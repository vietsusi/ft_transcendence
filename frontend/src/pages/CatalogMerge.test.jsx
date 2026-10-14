import React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import Movies from './Movies'
import MovieDetails from './MovieDetails'

const mocks = vi.hoisted(() => ({ get: vi.fn(), user: { id: 7 } }))
vi.mock('../context/AuthContext', () => ({
  api: { get: mocks.get },
  useAuth: () => ({ user: mocks.user, isAuthenticated: !!mocks.user }),
}))
const film = { id: 4, title: 'Catalog film', releaseYear: 2020, type: 'MOVIE', genres: [{ id: 1, name: 'Drama' }], description: 'Stored metadata', averageRating: 8.2, posterUrl: '/poster.jpg', sourceUrl: 'https://www.wikidata.org/wiki/Q4' }
const page = (items = [film], totalPages = 2) => ({ data: { items, pagination: { totalPages } } })
const view = (path = '/movies') => <MemoryRouter initialEntries={[path]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><Routes><Route path="/movies" element={<Movies />} /><Route path="/movies/:id" element={<MovieDetails />} /></Routes></MemoryRouter>

beforeEach(() => {
  vi.clearAllMocks()
  const storage = new Map()
  vi.stubGlobal('localStorage', {
    getItem: key => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, String(value)),
    removeItem: key => storage.delete(key),
    clear: () => storage.clear(),
  })
  mocks.user = { id: 7 }
  mocks.get.mockImplementation((url) => Promise.resolve(url === '/genres' ? { data: film.genres } : url === '/movies/search' ? page() : { data: film }))
})
afterEach(() => { cleanup(); vi.unstubAllGlobals() })

describe('catalog merge compatibility', () => {
  it('keeps posters, detail links and Load More with search and filters', async () => {
    render(view())
    await screen.findByText(film.title)
    expect(screen.getByRole('img', { name: film.title }).getAttribute('src')).toBe('/poster.jpg')
    expect(screen.getByRole('link', { name: /Catalog film/ }).getAttribute('href')).toBe('/movies/4')
    mocks.get.mockImplementation((url, config) => Promise.resolve(url === '/genres' ? { data: film.genres } : page(config.params.page === 2 ? [{ ...film, id: 5, title: 'Second film' }] : [film])))
    fireEvent.change(screen.getByLabelText('Search movies'), { target: { value: 'Catalog & film' } })
    fireEvent.click(screen.getByRole('button', { name: 'Search' }))
    await waitFor(() => expect(mocks.get.mock.calls.at(-1)[1].params.search).toBe('Catalog & film'))
    await waitFor(() => expect(screen.getByRole('button', { name: 'Load More' }).disabled).toBe(false))
    fireEvent.click(screen.getByRole('button', { name: 'Load More' }))
    await screen.findByText('Second film')
    expect(screen.getByText(film.title)).toBeTruthy()
    expect(mocks.get.mock.calls.at(-1)[1].params).toMatchObject({ search: 'Catalog & film', page: 2 })
    fireEvent.change(screen.getByLabelText('Genre'), { target: { value: 'Drama' } })
    await waitFor(() => expect(mocks.get.mock.calls.at(-1)[1].params).toMatchObject({ search: 'Catalog & film', genre: 'Drama', page: 1 }))
    await screen.findByText(film.title)
    expect(screen.queryByText('Second film')).toBeNull()
    fireEvent.change(screen.getByLabelText('Format'), { target: { value: 'TV_SERIES' } })
    await waitFor(() => expect(mocks.get.mock.calls.at(-1)[1].params).toMatchObject({ type: 'TV_SERIES', genre: 'Drama', page: 1 }))
  })

  it('retries a failed extra page without skipping it or losing earlier results', async () => {
    render(view())
    await screen.findByText(film.title)
    mocks.get.mockRejectedValueOnce(new Error('offline'))
    fireEvent.click(screen.getByRole('button', { name: 'Load More' }))
    await screen.findByRole('alert')
    expect(screen.getByText(film.title)).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Load More' })).toBeNull()
    mocks.get.mockResolvedValueOnce(page([{ ...film, id: 5, title: 'Second film' }]))
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }))
    await screen.findByText('Second film')
    expect(mocks.get.mock.calls.at(-1)[1].params.page).toBe(2)
  })

  it('ignores an old catalog response after changing format', async () => {
    let resolveOld
    mocks.get.mockImplementation((url) => url === '/genres' ? Promise.resolve({ data: film.genres }) : new Promise(resolve => { resolveOld = resolve }))
    render(view())
    await waitFor(() => expect(resolveOld).toBeTypeOf('function'))
    const signal = mocks.get.mock.calls.at(-1)[1].signal
    mocks.get.mockResolvedValueOnce(page())
    fireEvent.change(screen.getByLabelText('Format'), { target: { value: 'TV_SERIES' } })
    await screen.findByText(film.title)
    expect(signal.aborted).toBe(true)
    await act(async () => resolveOld(page([{ ...film, title: 'Stale film' }])))
    expect(screen.queryByText('Stale film')).toBeNull()
  })

  it('keeps metadata and chat links alongside user watchlist, ratings and reviews', async () => {
    render(view('/movies/4'))
    await screen.findByRole('heading', { name: film.title })
    expect(screen.getByRole('link', { name: 'Find similar titles in chat' }).getAttribute('href')).toBe('/chat?movie=4')
    expect(screen.getByRole('link', { name: /Metadata source/ }).getAttribute('href')).toBe(film.sourceUrl)
    expect(screen.getByText('8.2')).toBeTruthy()
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'watching' } })
    expect(JSON.parse(localStorage.getItem('watchlist:7'))[0]).toMatchObject({ movieId: 4, status: 'watching', posterUrl: film.posterUrl })
    fireEvent.click(screen.getByRole('button', { name: 'Rate & Review' }))
    fireEvent.click(screen.getByRole('button', { name: '9' }))
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Good movie' } })
    fireEvent.click(screen.getByRole('button', { name: 'Submit Rating' }))
    expect(JSON.parse(localStorage.getItem('ratings:7'))[0]).toMatchObject({ movieId: 4, rating: 9 })
    expect(JSON.parse(localStorage.getItem('reviews:7'))[0]).toMatchObject({ movieId: 4, review: 'Good movie' })
    expect(localStorage.getItem('ratings:guest')).toBeNull()
  })

  it('shows a real not-found error without fabricated actionable movie data', async () => {
    mocks.get.mockRejectedValueOnce({ response: { status: 404 } })
    render(view('/movies/999'))
    expect((await screen.findByRole('alert')).textContent).toContain('not in our catalog')
    expect(screen.queryByText('Unknown Movie')).toBeNull()
    expect(screen.queryByRole('button', { name: 'Rate & Review' })).toBeNull()
  })

  it('cancels detail requests on unmount and retains guest sign-in actions', async () => {
    mocks.user = null
    const rendered = render(view('/movies/4'))
    await screen.findByRole('heading', { name: film.title })
    expect(screen.getByRole('button', { name: 'Sign in to rate and add to watchlist' })).toBeTruthy()
    const signal = mocks.get.mock.calls.at(-1)[1].signal
    rendered.unmount()
    expect(signal.aborted).toBe(true)
  })
})
