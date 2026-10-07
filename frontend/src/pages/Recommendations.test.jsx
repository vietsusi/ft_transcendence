import React from 'react'
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Recommendations from './Recommendations'

const mocks = vi.hoisted(() => ({
  user: { id: 1, preferredGenres: ['Drama'] },
  getRecommendations: vi.fn(), getGenres: vi.fn(),
}))
vi.mock('../context/AuthContext', () => ({ useAuth: () => ({ user: mocks.user }) }))
vi.mock('../api/movieApi', () => ({
  movieApi: { getGenres: mocks.getGenres }, recommendationApi: { getRecommendations: mocks.getRecommendations },
}))
const movie = { id: 4, title: 'Catalog film', type: 'MOVIE', releaseYear: 2020, description: 'Stored description', averageRating: 8, ratingIsMock: true, genres: [{ id: 1, name: 'Drama' }], recommendation: { reasons: ['Matches your Drama preferences'] } }
const response = (overrides = {}) => ({ data: {
  items: [movie], pagination: { page: 1, limit: 12, total: 25, totalPages: 3 },
  meta: { mode: 'personalized', preferredGenres: ['Drama'] }, ...overrides,
} })
const view = () => <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><Recommendations /></MemoryRouter>

beforeEach(() => {
  vi.clearAllMocks()
  mocks.user = { id: 1, preferredGenres: ['Drama'] }
  mocks.getGenres.mockResolvedValue({ data: [{ id: 1, name: 'Drama' }] })
  mocks.getRecommendations.mockResolvedValue(response())
})
afterEach(cleanup)

describe('recommendations page', () => {
  it('shows loading before grounded cards, reasons and existing detail links', async () => {
    render(view())
    expect(screen.getByRole('status').textContent).toContain('Finding your next watch')
    const card = await screen.findByRole('link', { name: /Catalog film/ })
    expect(card.getAttribute('href')).toBe('/movies/4')
    expect(screen.getByText('Matches your Drama preferences')).toBeTruthy()
    expect(screen.getByText(/Demo score \(mock\)/)).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Edit genre preferences' }).getAttribute('href')).toBe('/profile')
  })
  it('supports cold start without requiring ratings or watch history', async () => {
    mocks.user.preferredGenres = []
    mocks.getRecommendations.mockResolvedValue(response({ meta: { mode: 'discovery', preferredGenres: [] } }))
    render(view())
    expect(await screen.findByText(/save your favorite genres in Profile/)).toBeTruthy()
  })
  it('discloses unmatched saved preferences', async () => {
    mocks.getRecommendations.mockResolvedValue(response({ meta: { mode: 'discovery', preferredGenres: ['Horror'] } }))
    render(view())
    expect(await screen.findByText(/your saved genres do not match/)).toBeTruthy()
  })
  it('applies filters, resets pagination and clears filters', async () => {
    const user = userEvent.setup()
    render(view())
    await screen.findByText('Catalog film')
    await user.click(screen.getByRole('button', { name: 'Next' }))
    await waitFor(() => expect(mocks.getRecommendations.mock.calls.at(-1)[0].page).toBe(2))
    await user.selectOptions(screen.getByLabelText('Format'), 'TV_SERIES')
    await user.selectOptions(screen.getByLabelText('Genre'), 'Drama')
    await user.type(screen.getByLabelText('From year'), '2000')
    await user.type(screen.getByLabelText('To year'), '2025')
    await user.click(screen.getByRole('button', { name: 'Apply filters' }))
    await waitFor(() => expect(mocks.getRecommendations.mock.calls.at(-1)[0]).toEqual({ page: 1, limit: 12, type: 'TV_SERIES', genre: 'Drama', minYear: '2000', maxYear: '2025' }))
    await user.click(screen.getByRole('button', { name: 'Reset filters' }))
    await waitFor(() => expect(mocks.getRecommendations.mock.calls.at(-1)[0]).toEqual({ page: 1, limit: 12 }))
  })
  it('rejects reversed year ranges without issuing a request', async () => {
    render(view())
    await screen.findByText('Catalog film')
    fireEvent.change(screen.getByLabelText('From year'), { target: { value: '2025' } })
    fireEvent.change(screen.getByLabelText('To year'), { target: { value: '2000' } })
    fireEvent.click(screen.getByRole('button', { name: 'Apply filters' }))
    expect(screen.getByRole('alert').textContent).toContain('Minimum year')
    expect(mocks.getRecommendations).toHaveBeenCalledTimes(1)
  })
  it('offers retry after an API error', async () => {
    mocks.getRecommendations.mockRejectedValueOnce(new Error('offline'))
    render(view())
    expect((await screen.findByRole('alert')).textContent).toContain('Unable to load')
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(await screen.findByText('Catalog film')).toBeTruthy()
  })
  it('renders empty results with recovery actions', async () => {
    mocks.getRecommendations.mockResolvedValue(response({ items: [], pagination: { page: 1, total: 0, totalPages: 0 } }))
    render(view())
    expect(await screen.findByText('No recommendations in this selection')).toBeTruthy()
    expect(screen.getByRole('link', { name: /Browse catalog/ }).getAttribute('href')).toBe('/movies')
    expect(screen.queryByRole('navigation', { name: 'Recommendation pages' })).toBeNull()
  })
  it('refreshes for saved preferences and cancels requests on unmount', async () => {
    const rendered = render(view())
    await screen.findByText('Catalog film')
    const signal = mocks.getRecommendations.mock.calls[0][1].signal
    mocks.user = { id: 1, preferredGenres: ['Comedy'] }
    rendered.rerender(view())
    await waitFor(() => expect(mocks.getRecommendations).toHaveBeenCalledTimes(2))
    expect(signal.aborted).toBe(true)
    const latest = mocks.getRecommendations.mock.calls.at(-1)[1].signal
    rendered.unmount()
    expect(latest.aborted).toBe(true)
  })
  it('ignores stale responses after filters change', async () => {
    let resolveOld
    mocks.getRecommendations.mockImplementationOnce(() => new Promise(resolve => { resolveOld = resolve }))
    render(view())
    fireEvent.change(screen.getByLabelText('Format'), { target: { value: 'TV_SERIES' } })
    fireEvent.click(screen.getByRole('button', { name: 'Apply filters' }))
    await screen.findByText('Catalog film')
    await act(async () => resolveOld(response({ items: [{ ...movie, title: 'Stale title' }] })))
    expect(screen.queryByText('Stale title')).toBeNull()
  })
  it('keeps recommendations usable when genre lookup fails and retries lookup', async () => {
    mocks.getGenres.mockRejectedValueOnce(new Error('offline'))
    render(view())
    await screen.findByText('Catalog film')
    fireEvent.click(screen.getByRole('button', { name: 'Retry genre filters' }))
    await waitFor(() => expect(screen.getByRole('option', { name: 'Drama' })).toBeTruthy())
  })
})
