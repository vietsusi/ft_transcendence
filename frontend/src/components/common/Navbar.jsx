import React from 'react'
import { Link, useNavigate } from 'react-router-dom'

function Navbar({ user, isAuthenticated, onLoginClick, onLogout }) {
  const navigate = useNavigate()

  const handleLogout = () => {
    onLogout()
    navigate('/')
  }

  const displayName = user?.username || user?.name || user?.email || 'User'

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition">
            <span className="text-2xl">🎬</span>
            <span className="text-xl font-bold text-blue-600">CineMatch</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link to="/movies" className="text-gray-700 hover:text-blue-600 font-medium transition px-3 py-2 rounded-lg hover:bg-blue-50 text-sm">
              Movies
            </Link>

            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="text-gray-700 hover:text-blue-600 font-medium transition px-3 py-2 rounded-lg hover:bg-blue-50 text-sm hidden sm:inline">
                  Dashboard
                </Link>
                <Link to="/watchlist" className="text-gray-700 hover:text-blue-600 font-medium transition px-3 py-2 rounded-lg hover:bg-blue-50 text-sm hidden sm:inline">
                  Watchlist
                </Link>
                <Link to="/recommendations" className="text-gray-700 hover:text-blue-600 font-medium transition px-3 py-2 rounded-lg hover:bg-blue-50 text-sm hidden sm:inline">
                  Recommendations
                </Link>
                <Link to="/profile" className="text-gray-700 hover:text-blue-600 font-medium transition px-3 py-2 rounded-lg hover:bg-blue-50 text-sm hidden sm:inline">
                  👤 {displayName}
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition text-sm"
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={onLoginClick}
                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition text-sm"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar