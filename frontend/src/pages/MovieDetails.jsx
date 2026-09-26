import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth, api } from '../context/AuthContext'

const getWatchlistStorageKey = (user) => `watchlist:${user?.id ?? user?.email ?? 'guest'}`
const getRatingsStorageKey = (user) => `ratings:${user?.id ?? user?.email ?? 'guest'}`
const getReviewsStorageKey = (user) => `reviews:${user?.id ?? user?.email ?? 'guest'}`

const readStoredJson = (key) => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : []
  } catch (error) {
    console.error('Failed to read stored data from localStorage:', error)
    return []
  }
}

const writeStoredJson = (key, items) => {
  localStorage.setItem(key, JSON.stringify(items))
}

const readStoredWatchlist = (user) => {
  if (!user) return []
  return readStoredJson(getWatchlistStorageKey(user))
}

const writeStoredWatchlist = (user, items) => {
  if (!user) return
  writeStoredJson(getWatchlistStorageKey(user), items)
}

function MovieDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const [movie, setMovie] = useState(null)
  const [loading, setLoading] = useState(true)
  const [rating, setRating] = useState(0)
  const [review, setReview] = useState('')
  const [watchlistStatus, setWatchlistStatus] = useState('')
  const [showReviewForm, setShowReviewForm] = useState(false)

  useEffect(() => {
    const fetchMovie = async () => {
      setLoading(true)
      try {
        const response = await api.get(`/movies/${id}`)
        const fetchedMovie = response.data
        const nextMovie = {
          ...fetchedMovie,
          poster: fetchedMovie.posterUrl,
          rating: fetchedMovie.averageRating,
          type: fetchedMovie.type || 'MOVIE',
          genres: fetchedMovie.genres?.map(genre => typeof genre === 'string' ? genre : genre.name) || [],
        }

        setMovie(nextMovie)

        if (user) {
          const storedWatchlist = readStoredWatchlist(user)
          const current = storedWatchlist.find(item => item.movieId === Number(id))
          setWatchlistStatus(current?.status || '')
        }
      } catch (error) {
        console.error('Error fetching movie:', error)
        const fallbackMovie = {
          id: Number(id),
          title: 'Unknown Movie',
          type: 'MOVIE',
          genres: ['Unknown'],
          description: 'Movie details not available.',
          releaseYear: new Date().getFullYear(),
          poster: null,
          rating: 0,
          director: 'Unknown',
          cast: ['Unknown'],
        }
        setMovie(fallbackMovie)
      } finally {
        setLoading(false)
      }
    }

    fetchMovie()
  }, [id, user])

  const handleAddToWatchlist = (status) => {
    if (!isAuthenticated || !user || !movie) {
      return
    }

    const nextItems = readStoredWatchlist(user)
    const movieId = Number(movie.id)
    const filteredItems = nextItems.filter(item => item.movieId !== movieId)
    const updatedItems = [
      ...filteredItems,
      {
        movieId,
        title: movie.title,
        status,
        posterUrl: movie.poster || movie.posterUrl || null,
        updatedAt: new Date().toISOString(),
      },
    ]

    writeStoredWatchlist(user, updatedItems)
    setWatchlistStatus(status)
  }

  const handleSubmitRating = () => {
    if (!user || !movie) return

    const movieId = Number(movie.id)
    const ratings = readStoredJson(getRatingsStorageKey(user))
    const reviews = readStoredJson(getReviewsStorageKey(user))

    const nextRatings = [
      ...ratings.filter(item => item.movieId !== movieId),
      { movieId, rating, updatedAt: new Date().toISOString() }
    ]

    const trimmedReview = review.trim()
    const nextReviews = [
      ...reviews.filter(item => item.movieId !== movieId),
      ...(trimmedReview ? [{ movieId, review: trimmedReview, updatedAt: new Date().toISOString() }] : [])
    ]

    writeStoredJson(getRatingsStorageKey(user), nextRatings)
    writeStoredJson(getReviewsStorageKey(user), nextReviews)
    setShowReviewForm(false)
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-3 text-gray-600">Loading movie details...</p>
        </div>
      </div>
    )
  }

  if (!movie) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🎬</div>
          <h2 className="text-2xl font-bold text-gray-700">Movie not found</h2>
          <p className="text-gray-500">The movie you're looking for doesn't exist.</p>
          <button 
            onClick={() => navigate('/movies')}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Back to Movies
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button 
          onClick={() => navigate('/movies')}
          className="mb-6 text-gray-600 hover:text-blue-600 transition flex items-center gap-2"
        >
          ← Back to Movies
        </button>

        {/* Movie Header */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="md:flex">
            {/* Poster/Image */}
            <div className="md:w-1/3 h-64 md:h-auto bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center overflow-hidden">
              {movie.poster ? (
                <img src={movie.poster} alt={movie.title} className="w-full h-full object-cover" />
              ) : (
                <span className="text-8xl">🎥</span>
              )}
            </div>

            {/* Movie Info */}
            <div className="p-6 md:p-8 md:w-2/3">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">{movie.title}</h1>
                  <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                    <span>{movie.releaseYear}</span>
                    <span className="text-gray-300">|</span>
                    <span>{movie.type}</span>
                    <span className="text-gray-300">|</span>
                    <span className="flex items-center gap-1">
                      <span>⭐</span>
                      <span className="font-semibold">{movie.rating}</span>
                      <span className="text-gray-400">/ 10</span>
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {movie.genres.map((genre) => (
                    <span key={genre} className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                      {genre}
                    </span>
                  ))}
                </div>
              </div>

              <p className="text-gray-700 mt-4 leading-relaxed">
                {movie.description}
              </p>

              {movie.director && (
                <p className="text-sm text-gray-600 mt-2">
                  <span className="font-semibold">Director:</span> {movie.director}
                </p>
              )}

              {movie.cast && (
                <p className="text-sm text-gray-600 mt-1">
                  <span className="font-semibold">Cast:</span> {movie.cast.join(', ')}
                </p>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 mt-6">
                {isAuthenticated ? (
                  <>
                    <select
                      value={watchlistStatus}
                      onChange={(e) => handleAddToWatchlist(e.target.value)}
                      className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    >
                      <option value="">Add to Watchlist</option>
                      <option value="want-to-watch">Want to Watch</option>
                      <option value="watching">Currently Watching</option>
                      <option value="watched">Watched</option>
                    </select>

                    <button
                      onClick={() => setShowReviewForm(!showReviewForm)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      {showReviewForm ? 'Cancel Review' : 'Rate & Review'}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => navigate('/')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Sign in to rate and add to watchlist
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Rating & Review Form */}
        {showReviewForm && isAuthenticated && (
          <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Rate & Review</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Rating
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <button
                      key={num}
                      onClick={() => setRating(num)}
                      className={`w-10 h-10 rounded-full transition ${
                        rating === num 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Review (Optional)
                </label>
                <textarea
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  placeholder="Share your thoughts about this movie..."
                  rows={4}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition"
                />
              </div>
              <button
                onClick={handleSubmitRating}
                disabled={rating === 0}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
              >
                Submit Rating
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MovieDetails