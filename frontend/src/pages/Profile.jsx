import React from 'react'
import { useAuth } from '../context/AuthContext'

function Profile() {
  const { user, logout } = useAuth()

  return (
    <div className="max-w-md mx-auto mt-10">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-32"></div>
        <div className="px-6 pb-6 -mt-16">
          <div className="flex justify-center">
            <div className="w-24 h-24 rounded-full border-4 border-white bg-gray-300 flex items-center justify-center text-3xl font-bold text-gray-600">
              {user?.username?.[0]?.toUpperCase() || 'U'}
            </div>
          </div>
          
          <div className="text-center mt-2">
            <h2 className="text-2xl font-bold text-gray-800">{user?.username || 'User'}</h2>
            <p className="text-gray-600">{user?.email || 'No email'}</p>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">0</div>
              <div className="text-sm text-gray-500">Movies Watched</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">0</div>
              <div className="text-sm text-gray-500">Reviews</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">0</div>
              <div className="text-sm text-gray-500">Watchlist</div>
            </div>
          </div>

          <button 
            onClick={logout}
            className="w-full mt-6 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-medium"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}

export default Profile