import React, { useState, useEffect } from 'react'
import { useAuth, api } from '../context/AuthContext'
import { Link } from 'react-router-dom'

const getWatchlistStorageKey = (user) => `watchlist:${user?.id ?? user?.email ?? 'guest'}`
const getRatingsStorageKey = (user) => `ratings:${user?.id ?? user?.email ?? 'guest'}`
const getReviewsStorageKey = (user) => `reviews:${user?.id ?? user?.email ?? 'guest'}`
const getActivityStorageKey = (user) => `activity:${user?.id ?? user?.email ?? 'guest'}`

const readStoredJson = (key) => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : []
  } catch (error) {
    console.error('Failed to read stored dashboard data:', error)
    return []
  }
}

const resolveMovieTitle = async (movieId) => {
  if (!movieId) return 'Unknown movie'

  try {
    const response = await api.get(`/movies/${movieId}`)
    return response.data?.title || `Movie #${movieId}`
  } catch (error) {
    return `Movie #${movieId}`
  }
}

function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalWatched: 0,
    totalReviews: 0,
    watchlistCount: 0,
    averageRating: null,
    favoriteGenres: [],
    recentActivity: [],
    ratingsAndReviews: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true)
      try {
        if (!user) {
          setStats({
            totalWatched: 0,
            totalReviews: 0,
            watchlistCount: 0,
            favoriteGenres: [],
            recentActivity: []
          })
          return
        }

        const watchlist = readStoredJson(getWatchlistStorageKey(user))
        const ratings = readStoredJson(getRatingsStorageKey(user))
        const reviews = readStoredJson(getReviewsStorageKey(user))
        const activity = readStoredJson(getActivityStorageKey(user))

        const watchedCount = watchlist.filter(item => item.status === 'watched').length
        const totalReviews = reviews.length
        const averageRating = ratings.length
          ? ratings.reduce((sum, item) => sum + Number(item.rating || 0), 0) / ratings.length
          : null

        const mergedEntries = new Map()

        ratings.forEach((item) => {
          const key = item.movieId ?? `${item.title ?? 'movie'}-${Math.random()}`
          const existing = mergedEntries.get(key) || {}
          mergedEntries.set(key, {
            id: `entry-${key}`,
            movieId: item.movieId,
            title: item.title || `Movie #${item.movieId}`,
            posterUrl: item.posterUrl || null,
            rating: item.rating,
            review: '',
            updatedAt: item.updatedAt,
            ...existing,
          })
        })

        reviews.forEach((item) => {
          const key = item.movieId ?? `${item.title ?? 'movie'}-${Math.random()}`
          const existing = mergedEntries.get(key) || {}
          mergedEntries.set(key, {
            ...existing,
            id: `entry-${key}`,
            movieId: item.movieId,
            title: item.title || `Movie #${item.movieId}`,
            posterUrl: item.posterUrl || existing.posterUrl || null,
            rating: existing.rating ?? null,
            review: item.review || existing.review || '',
            updatedAt: item.updatedAt || existing.updatedAt,
          })
        })

        const rawRatingsAndReviews = [...mergedEntries.values()]
          .map((item) => ({
            ...item,
            ratingText: item.rating !== null && item.rating !== undefined ? `Rated ${Number(item.rating).toFixed(1)}/10` : 'No rating yet',
            reviewText: item.review || 'No review written yet',
          }))
          .sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0))

        const hydrateEntryDetails = async (items) => Promise.all(items.map(async (item) => {
          const isFallbackTitle = !item.title || /^Movie #\d+$/i.test(item.title) || /^Unknown movie$/i.test(item.title)

          if (!item.movieId) {
            return item
          }

          try {
            const response = await api.get(`/movies/${item.movieId}`)
            const movie = response.data || {}
            return {
              ...item,
              title: (isFallbackTitle ? movie.title : item.title) || movie.title || `Movie #${item.movieId}`,
              year: item.year || movie.releaseYear || movie.year || null,
              posterUrl: item.posterUrl || movie.posterUrl || movie.poster || null,
            }
          } catch (error) {
            return {
              ...item,
              title: isFallbackTitle ? `Movie #${item.movieId}` : item.title,
              year: item.year || null,
            }
          }
        }))

        const ratingsAndReviews = await hydrateEntryDetails(rawRatingsAndReviews)

        const hydrateTitle = async (item) => {
          const needsTitleLookup = !item.title || /^Movie #\d+$/i.test(item.title) || /^Unknown movie$/i.test(item.title)
          const resolvedTitle = needsTitleLookup && item.movieId ? await resolveMovieTitle(item.movieId) : item.title

          return {
            ...item,
            title: resolvedTitle || 'Unknown movie',
          }
        }

        const fallbackActivity = [
          ...watchlist.map(item => ({
            type: item.status,
            title: item.title,
            label: item.status === 'want-to-watch' ? 'Want to Watch' : item.status === 'watching' ? 'Currently Watching' : 'Watched',
            updatedAt: item.updatedAt,
            movieId: item.movieId,
          })),
          ...ratings.map(item => ({
            type: 'reviewed',
            title: item.title,
            label: 'Rated',
            updatedAt: item.updatedAt,
            movieId: item.movieId,
          })),
          ...reviews.map(item => ({
            type: 'reviewed',
            title: item.title,
            label: 'Reviewed',
            updatedAt: item.updatedAt,
            movieId: item.movieId,
          }))
        ]

        const hydratedActivity = await Promise.all((activity.length ? activity : fallbackActivity).map(hydrateTitle))

        const recentActivity = hydratedActivity
          .map(item => {
            const actionLabel = item.label || 'Updated'
            const title = item.title || 'Unknown movie'

            return {
              type: item.type,
              movie: `${actionLabel}: ${title}`,
              date: item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : 'Recently',
              timestamp: new Date(item.updatedAt || Date.now()).getTime(),
            }
          })
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, 5)

        setStats({
          totalWatched: watchedCount,
          totalReviews,
          watchlistCount: watchlist.length,
          averageRating,
          favoriteGenres: user?.preferredGenres || [],
          recentActivity,
          ratingsAndReviews,
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [user])

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-700">Please Sign In</h2>
          <p className="text-gray-500">Sign in to view your dashboard</p>
          <Link to="/" className="mt-4 inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            Go Home
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-3 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-800">📊 Your Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user.username}!</p>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            Export Data
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-blue-600">{stats.totalWatched}</div>
            <div className="text-gray-600">Movies Watched</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-green-600">{stats.totalReviews}</div>
            <div className="text-gray-600">Reviews</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-purple-600">{stats.watchlistCount}</div>
            <div className="text-gray-600">Watchlist</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-orange-600">⭐</div>
            <div className="text-gray-600">Avg Rating: {stats.averageRating !== null ? stats.averageRating.toFixed(1) : 'N/A'}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Favorite Genres */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">🎯 Favorite Genres</h3>
            {stats.favoriteGenres.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {stats.favoriteGenres.map((genre) => (
                  <span key={genre} className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    {genre}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No genres yet. Start rating movies!</p>
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">🕐 Recent Activity</h3>
            {stats.recentActivity.length > 0 ? (
              <ul className="space-y-3">
                {stats.recentActivity.map((activity, index) => (
                  <li key={index} className="flex items-center justify-between text-sm border-b border-gray-100 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">{activity.type === 'watched' ? '👀' : activity.type === 'reviewed' ? '✍️' : '📝'}</span>
                      <span>{activity.movie}</span>
                    </div>
                    <span className="text-gray-400 text-xs">{activity.date}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No recent activity</p>
            )}
          </div>
        </div>

        <div className="mt-6 bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">⭐ My Ratings & Reviews</h3>
          {stats.ratingsAndReviews.length > 0 ? (
            <div className="space-y-4">
              {stats.ratingsAndReviews.map((item) => {
                const stars = Array.from({ length: 5 }, (_, index) => index < Math.round(Number(item.rating || 0) / 2))

                return (
                  <div key={item.id} className="border border-gray-200 rounded-xl bg-gray-50 p-4">
                    <div className="flex gap-4 items-start">
                      <div className="w-20 h-28 rounded-lg overflow-hidden bg-[#dfeaf8] border border-gray-300 flex-shrink-0">
                        {item.posterUrl ? (
                          <img src={item.posterUrl} alt={item.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl text-gray-600">
                            🎬
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="text-2xl font-bold leading-tight text-gray-800">{item.title}</div>
                        <div className="mt-1 text-sm text-gray-500">
                          {item.year ? item.year : 'Unknown year'}
                        </div>

                        <div className="mt-3 flex items-center gap-2 text-lg">
                          {stars.map((filled, index) => (
                            <span key={index} className={filled ? 'text-yellow-500' : 'text-gray-300'}>★</span>
                          ))}
                          <span className="ml-1 text-base font-medium text-gray-700">
                            {item.rating !== null && item.rating !== undefined ? `${Number(item.rating).toFixed(1)}/10` : 'No rating'}
                          </span>
                        </div>

                        <div className="mt-3 pl-3 border-l-2 border-gray-300 text-gray-700 whitespace-pre-wrap text-base leading-relaxed">
                          {item.reviewText === 'No review written yet' ? 'No review written yet' : item.reviewText}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-gray-500">You have not rated or reviewed any movies yet.</p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link to="/movies" className="bg-blue-600 text-white p-4 rounded-xl text-center hover:bg-blue-700 transition">
            🎬 Search Movies
          </Link>
          <Link to="/watchlist" className="bg-purple-600 text-white p-4 rounded-xl text-center hover:bg-purple-700 transition">
            📝 My Watchlist
          </Link>
          <Link to="/recommendations" className="bg-green-600 text-white p-4 rounded-xl text-center hover:bg-green-700 transition">
            🎯 Recommendations
          </Link>
          <Link to="/profile" className="bg-gray-600 text-white p-4 rounded-xl text-center hover:bg-gray-700 transition">
            👤 My Profile
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Dashboard