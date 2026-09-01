import React, { useState } from 'react'

function Movies() {
  const [searchTerm, setSearchTerm] = useState('')
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(false)

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchTerm.trim()) return
    
    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      setMovies([
        { id: 1, title: 'Viet Frontend Demo', year: 2010, rating: 8.8 },
        { id: 2, title: 'Transcendance Demo', year: 1999, rating: 8.7 },
        { id: 3, title: 'Another Film', year: 2014, rating: 8.6 },
      ])
      setLoading(false)
    }, 1000)
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

      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      )}

      {!loading && movies.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {movies.map((movie) => (
            <div key={movie.id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                <span className="text-5xl">🎥</span>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-800">{movie.title}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                  <span>{movie.year}</span>
                  <span className="text-gray-300">|</span>
                  <span className="flex items-center gap-1">
                    <span>⭐</span>
                    <span>{movie.rating}</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && movies.length === 0 && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🎥</div>
          <h3 className="text-xl font-semibold text-gray-700">No movies found</h3>
          <p className="text-gray-500">Start searching to discover great films!</p>
        </div>
      )}
    </div>
  )
}

export default Movies