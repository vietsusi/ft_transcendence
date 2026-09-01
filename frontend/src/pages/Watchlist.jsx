import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Watchlist() {
  const { user } = useAuth()
  const [watchlist, setWatchlist] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    // Fetch watchlist from API
    const fetchWatchlist = async () => {
      setLoading(true)
      try {
        // Replace with actual API call
        // const response = await api.get('/watchlist')
        // setWatchlist(response.data)
        
        // Mock data
        setWatchlist([
          { id: 1, title: 'Viet Frontend Demo', status: 'want-to-watch', poster: null },
          { id: 2, title: 'Trancendance Demo', status: 'watching', poster: null },
          { id: 3, title: 'Another Film', status: 'watched', poster: null },
        ])
      } catch (error) {
        console.error('Error fetching watchlist:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchWatchlist()
  }, [])

  const statusLabels = {
    'want-to-watch': 'Want to Watch',
    'watching': 'Currently Watching',
    'watched': 'Watched'
  }

  const filteredWatchlist = activeTab === 'all' 
    ? watchlist 
    : watchlist.filter(item => item.status === activeTab)

  const removeFromWatchlist = (id) => {
    setWatchlist(watchlist.filter(item => item.id !== id))
    // API call to remove
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
              <div key={item.id} className="bg-white rounded-lg shadow-md p-4 flex items-center justify-between hover:shadow-lg transition">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded flex items-center justify-center">
                    <span className="text-2xl">🎥</span>
                  </div>
                  <div>
                    <Link to={`/movies/${item.id}`} className="font-semibold text-gray-800 hover:text-blue-600 transition">
                      {item.title}
                    </Link>
                    <p className="text-sm text-gray-500">{statusLabels[item.status] || item.status}</p>
                  </div>
                </div>
                <button
                  onClick={() => removeFromWatchlist(item.id)}
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