import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { movieApi, recommendationApi } from '../api/movieApi'
import MovieCard from '../components/MovieCard'

const emptyFilters = { type: '', genre: '', minYear: '', maxYear: '' }

// Remount when saved preferences change, resetting pagination and pending requests.
export default function Recommendations() {
  const { user } = useAuth()
  if (!user) return null
  return <RecommendationFeed key={`${user.id}:${JSON.stringify(user.preferredGenres || [])}`} />
}

function RecommendationFeed() {
  const [filters, setFilters] = useState(emptyFilters)
  const [draft, setDraft] = useState(emptyFilters)
  const [page, setPage] = useState(1)
  const [retry, setRetry] = useState(0)
  const [genres, setGenres] = useState([])
  const [genreError, setGenreError] = useState(false)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [formError, setFormError] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    setGenreError(false)
    movieApi.getGenres({ signal: controller.signal })
      .then(response => setGenres(response.data))
      .catch(() => { if (!controller.signal.aborted) setGenreError(true) })
    return () => controller.abort()
  }, [retry])

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError('')
    setResult(null)
    const params = { page, limit: 12 }
    for (const [key, value] of Object.entries(filters)) {
      if (value !== '') params[key] = value
    }
    recommendationApi.getRecommendations(params, { signal: controller.signal })
      .then(response => { if (!controller.signal.aborted) setResult(response.data) })
      .catch(() => { if (!controller.signal.aborted) setError('Unable to load recommendations. Please try again.') })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [filters, page, retry])

  function applyFilters(event) {
    event.preventDefault()
    if (draft.minYear && draft.maxYear && Number(draft.minYear) > Number(draft.maxYear)) {
      setFormError('Minimum year must not exceed maximum year.')
      return
    }
    setFormError('')
    setFilters({ ...draft })
    setPage(1)
  }

  function clearFilters() {
    setDraft(emptyFilters)
    setFilters(emptyFilters)
    setFormError('')
    setPage(1)
  }

  const updateDraft = event => setDraft(previous => ({ ...previous, [event.target.name]: event.target.value }))
  const personalized = result?.meta.mode === 'personalized'
  const hasFilters = Object.values(filters).some(Boolean)

  return <section className="max-w-6xl mx-auto" aria-labelledby="recommendations-heading">
    <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
      <div>
        <h1 id="recommendations-heading" className="text-3xl font-bold text-slate-900">🎯 Your recommendations</h1>
        <p className="text-slate-600 mt-3">Find your next movie or series, with a little room to explore.</p>
      </div>
      <Link to="/profile" className="border border-blue-200 bg-white text-blue-700 rounded-lg px-4 py-2 hover:bg-blue-50 transition">Edit genre preferences</Link>
    </div>

    <div className="rounded-xl border border-blue-100 bg-blue-50 p-5 mb-6">
      <h2 className="font-semibold text-slate-900">How we choose your picks</h2>
      <p className="text-sm text-slate-600 mt-2">We balance your saved genre preferences with catalog scores, release year and variety. Demo scores do not influence ranking.</p>
      <p className="text-sm text-slate-600 mt-2">Recommendations currently use genre preferences; viewing history and personal ratings are not available yet.</p>
      {!loading && !error && result && <>
        <p className="text-sm font-medium text-blue-800 mt-3">{personalized ? 'Picked for your preferences' : 'Discovery picks'}{!personalized && (result.meta.preferredGenres.length ? ' — your saved genres do not match this selection.' : ' — save your favorite genres in Profile to personalize your picks.')}</p>
        {result.meta.preferredGenres.length > 0 && <div className="flex flex-wrap gap-2 mt-3" aria-label="Saved genre preferences">
          {result.meta.preferredGenres.map(genre => <span key={genre} className="bg-white text-blue-800 border border-blue-100 rounded-full px-3 py-1 text-xs">{genre}</span>)}
        </div>}
      </>}
    </div>

    <form onSubmit={applyFilters} className="bg-white border border-slate-200 rounded-xl p-4 mb-6">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <label className="text-sm text-slate-700">Format
          <select name="type" value={draft.type} onChange={updateDraft} className="block w-full border rounded-lg p-3 mt-1">
            <option value="">Movies &amp; TV series</option><option value="MOVIE">Movies</option><option value="TV_SERIES">TV series</option>
          </select>
        </label>
        <label className="text-sm text-slate-700">Genre
          <select name="genre" value={draft.genre} onChange={updateDraft} className="block w-full border rounded-lg p-3 mt-1">
            <option value="">All genres</option>{genres.map(genre => <option key={genre.id} value={genre.name}>{genre.name}</option>)}
          </select>
        </label>
        <label className="text-sm text-slate-700">From year
          <input name="minYear" type="number" min="1888" max="2100" step="1" placeholder="Any year" value={draft.minYear} onChange={updateDraft} className="block w-full border rounded-lg p-3 mt-1" />
        </label>
        <label className="text-sm text-slate-700">To year
          <input name="maxYear" type="number" min="1888" max="2100" step="1" placeholder="Any year" value={draft.maxYear} onChange={updateDraft} className="block w-full border rounded-lg p-3 mt-1" />
        </label>
      </div>
      <div className="flex flex-wrap gap-3 mt-4">
        <button type="submit" className="bg-blue-600 text-white rounded-lg px-5 py-2 hover:bg-blue-700 transition">Apply filters</button>
        <button type="button" onClick={clearFilters} className="border rounded-lg px-4 py-2 text-slate-700 hover:bg-slate-50 transition">Reset filters</button>
      </div>
      {formError && <p role="alert" className="text-sm text-red-700 mt-3">{formError}</p>}
      {genreError && <p className="text-sm text-slate-600 mt-3">Genre filters are unavailable. <button type="button" onClick={() => setRetry(value => value + 1)} className="text-blue-700 underline">Retry genre filters</button></p>}
    </form>

    <div aria-live="polite" aria-busy={loading}>
      {loading ? <div role="status" className="text-center py-16 text-slate-600">
        <div aria-hidden="true" className="mx-auto animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4" />Finding your next watch…
      </div> : error ? <div role="alert" className="bg-white border rounded-xl p-8 text-center">
        <p className="text-red-700">{error}</p>
        <button onClick={() => setRetry(value => value + 1)} className="mt-4 bg-blue-600 text-white rounded-lg px-5 py-2 hover:bg-blue-700">Try again</button>
      </div> : result && <>
        <p className="text-sm text-slate-500 mb-4">{result.pagination.total} titles in this selection · {personalized ? 'Personalized picks' : 'Discovery picks'}</p>
        {result.pagination.windowLimited && <p className="text-sm text-slate-600 mb-4">Showing the first {20 * result.pagination.limit} picks. Narrow your filters to explore more titles.</p>}
        {result.items.length ? <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {result.items.map(movie => <article key={movie.id} className="flex flex-col gap-2">
            <MovieCard movie={movie} />
            <div className="px-4 pb-3 text-sm text-blue-800">
              <p className="font-medium">Why this pick</p>
              <ul className="mt-1 space-y-1">{movie.recommendation.reasons.map(reason => <li key={reason}>{reason}</li>)}</ul>
            </div>
          </article>)}
        </div> : <div className="text-center py-12 bg-white border rounded-xl">
          <div aria-hidden="true" className="text-4xl mb-4">🎬</div>
          <h2 className="text-xl font-semibold text-slate-800">No recommendations in this selection</h2>
          <p className="text-slate-600 mt-2">{hasFilters ? 'Try a wider year range or another genre.' : 'There are no titles to recommend on this page. Explore the catalog or reset your selection.'}</p>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            <button onClick={clearFilters} className="text-blue-700 hover:underline">Reset selection</button>
            <Link to="/movies" className="text-blue-700 hover:underline">Browse catalog →</Link>
          </div>
        </div>}
        {result.pagination.totalPages > 1 && <nav aria-label="Recommendation pages" className="flex justify-center items-center gap-5 my-8">
          <button disabled={page <= 1} onClick={() => setPage(value => value - 1)} className="border rounded-lg px-4 py-2 disabled:opacity-40">Previous</button>
          <span className="text-sm text-slate-600">Page {page} / {result.pagination.totalPages}</span>
          <button disabled={page >= result.pagination.totalPages} onClick={() => setPage(value => value + 1)} className="border rounded-lg px-4 py-2 disabled:opacity-40">Next</button>
        </nav>}
      </>}
    </div>
  </section>
}
