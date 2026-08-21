import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'

function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalWatched: 0,
    totalReviews: 0,
    watchlistCount: 0,
    favoriteGenres: [],
    recentActivity: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch user stats
    const fetchStats = async () => {
      setLoading(true)
      try {
        // Replace with actual API call
        // const response = await api.get('/dashboard/stats')
        // setStats(response.data)
        
        // Mock data
        setStats({
          totalWatched: 42,
          totalReviews: 15,
          watchlistCount: 8,
          favoriteGenres: ['Sci-Fi', 'Action', 'Drama'],
          recentActivity: [
            { type: 'watched', movie: 'Viet Frontend Demo', date: '2 days ago' },
            { type: 'reviewed', movie: 'Transcendance Demon', date: '3 days ago' },
            { type: 'watchlist', movie: 'Another Film', date: '1 week ago' },
          ]
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

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
            <div className="text-gray-600">Avg Rating: {stats.totalWatched > 0 ? '8.2' : 'N/A'}</div>
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