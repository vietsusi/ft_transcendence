import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const getWatchlistStorageKey = (user) => `watchlist:${user?.id ?? user?.email ?? 'guest'}`

const readStoredWatchlist = (user) => {
  if (!user) return []

  try {
    const raw = localStorage.getItem(getWatchlistStorageKey(user))
    return raw ? JSON.parse(raw) : []
  } catch (error) {
    console.error('Failed to read watchlist from localStorage:', error)
    return []
  }
}

const writeStoredWatchlist = (user, items) => {
  if (!user) return
  localStorage.setItem(getWatchlistStorageKey(user), JSON.stringify(items))
}

function Watchlist() {
  const { user } = useAuth()
  const [watchlist, setWatchlist] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    const fetchWatchlist = async () => {
      setLoading(true)
      try {
        if (!user) {
          setWatchlist([])
          return
        }

        const stored = readStoredWatchlist(user)
        setWatchlist(stored)
      } catch (error) {
        console.error('Error fetching watchlist:', error)
        setWatchlist([])
      } finally {
        setLoading(false)
      }
    }

    fetchWatchlist()
  }, [user])

  const statusLabels = {
    'want-to-watch': 'Want to Watch',
    'watching': 'Currently Watching',
    'watched': 'Watched'
  }

  const filteredWatchlist = activeTab === 'all' 
    ? watchlist 
    : watchlist.filter(item => item.status === activeTab)

  const removeFromWatchlist = (movieId) => {
    const nextWatchlist = watchlist.filter(item => item.movieId !== movieId)
    setWatchlist(nextWatchlist)
    writeStoredWatchlist(user, nextWatchlist)
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-700">Please Sign In</h2>
          <p className="text-gray-500">Sign in to view your watchlist</p>
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
          <p className="mt-3 text-gray-600">Loading your watchlist...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">📝 My Watchlist</h1>
        <p className="text-gray-600 mb-6">Keep track of movies you want to watch</p>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {['all', 'want-to-watch', 'watching', 'watched'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg transition ${
                activeTab === tab 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {tab === 'all' ? 'All' : statusLabels[tab]}
            </button>
          ))}
        </div>

        {filteredWatchlist.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow">
            <div className="text-6xl mb-4">🎬</div>
            <h3 className="text-xl font-semibold text-gray-700">Your watchlist is empty</h3>
            <p className="text-gray-500">Start adding movies you want to watch!</p>
            <Link to="/movies" className="mt-4 inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              Browse Movies
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredWatchlist.map((item) => (
              <div key={item.movieId} className="bg-white rounded-lg shadow-md p-4 flex items-center justify-between hover:shadow-lg transition">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded flex items-center justify-center overflow-hidden">
                    {item.posterUrl ? (
                      <img src={item.posterUrl} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl">🎥</span>
                    )}
                  </div>
                  <div>
                    <Link to={`/movies/${item.movieId}`} className="font-semibold text-gray-800 hover:text-blue-600 transition">
                      {item.title}
                    </Link>
                    <p className="text-sm text-gray-500">{statusLabels[item.status] || item.status}</p>
                  </div>
                </div>
                <button
                  onClick={() => removeFromWatchlist(item.movieId)}
                  className="text-red-500 hover:text-red-700 transition"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Watchlist