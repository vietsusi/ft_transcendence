import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../context/AuthContext'

function Movies() {
  const [searchTerm, setSearchTerm] = useState('')
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchMovies(1)
  }, [])

  const fetchMovies = async (pageNum = 1) => {
    setLoading(true)
    try {
      const response = await api.get(`/movies/search?page=${pageNum}&limit=12`)
      if (pageNum === 1) {
        setMovies(response.data.items)
      } else {
        setMovies(prev => [...prev, ...response.data.items])
      }
      setTotalPages(response.data.pagination.totalPages)
      setPage(pageNum)
    } catch (error) {
      console.error('Error fetching movies:', error)
    } finally {
      setLoading(false)
    }
  }

const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchTerm.trim()) {
      fetchMovies(1)
      return
    }
    setLoading(true)
    try {
      const response = await api.get(`/movies/search?search=${searchTerm}&limit=24`)
      const results = response.data.items || []
      const sorted = results.sort((a, b) => {
        const aTitle = a.title.toLowerCase().includes(searchTerm.toLowerCase())
        const bTitle = b.title.toLowerCase().includes(searchTerm.toLowerCase())
        if (aTitle && !bTitle) return -1
        if (!aTitle && bTitle) return 1
        return b.averageRating - a.averageRating
      })
      setMovies(sorted)
      setTotalPages(1)
    } catch (error) {
      console.error('Error searching movies:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">🎬 Browse Movies</h1>
        <p className="text-lg text-gray-600 mt-2">Discover and search for your favorite films</p>
      </div>

      <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
        <div className="flex gap-3">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search for movies, TV shows, genres..."
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
      </form>

      {loading && page === 1 && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      )}

      {!loading && movies.length === 0 && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🎥</div>
          <h3 className="text-xl font-semibold text-gray-700">No movies found</h3>
          <p className="text-gray-500">Start searching to discover great films!</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {movies.map((movie) => (
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
                  <span>{movie.averageRating}</span>
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

      {page < totalPages && (
        <div className="text-center mt-8">
          <button
            onClick={() => fetchMovies(page + 1)}
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