import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../context/AuthContext'

function Movies() {
  const [searchTerm, setSearchTerm] = useState('')
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const [query, setQuery] = useState('')
  const [genre, setGenre] = useState('')
  const [type, setType] = useState('')
  const [genres, setGenres] = useState([])
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    api.get('/genres', { signal: controller.signal })
      .then(response => { if (!controller.signal.aborted) setGenres(response.data) })
      .catch(() => {})
    return () => controller.abort()
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError('')
    api.get('/movies/search', {
      params: { search: query || undefined, genre: genre || undefined, type: type || undefined, page, limit: 12 },
      signal: controller.signal,
    }).then(response => {
      if (controller.signal.aborted) return
      setMovies(previous => page === 1 ? response.data.items : [...previous, ...response.data.items])
      setTotalPages(response.data.pagination.totalPages)
    }).catch(() => {
      if (!controller.signal.aborted) setError('Unable to load catalog. Please try again.')
    }).finally(() => {
      if (!controller.signal.aborted) setLoading(false)
    })
    return () => controller.abort()
  }, [query, genre, type, page, retry])

  const resetResults = () => {
    setMovies([])
    setPage(1)
    setTotalPages(1)
  }

  const handleSearch = (event) => {
    event.preventDefault()
    resetResults()
    setQuery(searchTerm.trim())
    setRetry(value => value + 1)
  }

  const rankedMovies = query ? [...movies].sort((a, b) => {
    const aTitle = a.title.toLowerCase().includes(query.toLowerCase())
    const bTitle = b.title.toLowerCase().includes(query.toLowerCase())
    if (aTitle !== bTitle) return aTitle ? -1 : 1
    return b.averageRating - a.averageRating
  }) : movies

  return (
    <div className="min-h-screen py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">🎬 Browse Movies</h1>
        <p className="text-lg text-gray-600 mt-2">Discover and search for your favorite films</p>
      </div>

      <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
        <div className="flex gap-3">
          <input
            aria-label="Search movies"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search title or description"
            className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? '...' : 'Search'}
          </button>
        </div>
        <div className="flex flex-wrap gap-3 mt-3">
          <select aria-label="Genre" value={genre} onChange={event => { resetResults(); setGenre(event.target.value) }} className="border rounded-lg p-2">
            <option value="">All genres</option>
            {genres.map(item => <option key={item.id} value={item.name}>{item.name}</option>)}
          </select>
          <select aria-label="Format" value={type} onChange={event => { resetResults(); setType(event.target.value) }} className="border rounded-lg p-2">
            <option value="">All formats</option><option value="MOVIE">Movies</option><option value="TV_SERIES">TV series</option>
          </select>
        </div>
      </form>

      {error && <div role="alert" className="text-center mb-6">{error} <button onClick={() => setRetry(value => value + 1)} className="text-blue-700">Try again</button></div>}

      {loading && page === 1 && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      )}

      {!loading && !error && movies.length === 0 && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🎥</div>
          <h3 className="text-xl font-semibold text-gray-700">No movies found</h3>
          <p className="text-gray-500">Start searching to discover great films!</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {rankedMovies.map((movie) => (
          <Link
            key={movie.id}
            to={`/movies/${movie.id}`}
            className="block bg-white rounded-xl shadow-md hover:shadow-xl transition overflow-hidden cursor-pointer"
          >
            <div className="h-48 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center overflow-hidden">
              {movie.posterUrl ? (
                <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover" />
              ) : (
                <span className="text-5xl">🎥</span>
              )}
            </div>
            <div className="p-4">
              <h3 className="text-lg font-bold text-gray-800">{movie.title}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                <span>{movie.releaseYear}</span>
                <span className="text-gray-300">|</span>
                <span className="flex items-center gap-1">
                  <span>⭐</span>
                  <span>{Number(movie.averageRating).toFixed(1)}/10 · Rating</span>
                </span>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {movie.genres?.map(genre => (
                  <span key={genre.id || genre.name} className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                    {genre.name || genre}
                  </span>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {!error && page < totalPages && (
        <div className="text-center mt-8">
          <button
            onClick={() => setPage(value => value + 1)}
            disabled={loading}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  )
}

export default Movies