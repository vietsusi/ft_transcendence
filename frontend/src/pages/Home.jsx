import React from 'react'
import { useNavigate } from 'react-router-dom'

function Home({ user }) {
  const navigate = useNavigate()
  const displayName = user?.username || user?.email || user?.name || 'User'
  
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="text-center max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold text-gray-800 mb-4">
          {user ? `Welcome back, ${displayName}!` : 'Discover Your Next Favorite Movie'}
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          {user 
            ? 'Ready to find your next movie or TV series?' 
            : 'Sign in to get personalized recommendations based on your taste'}
        </p>
        
        {!user && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition border border-gray-100">
              <div className="text-4xl mb-3">🎯</div>
              <h3 className="text-lg font-semibold text-gray-800">Personalized Recommendations</h3>
              <p className="text-gray-600 text-sm">Get movie suggestions tailored to your preferences</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition border border-gray-100">
              <div className="text-4xl mb-3">⭐</div>
              <h3 className="text-lg font-semibold text-gray-800">Rate & Review</h3>
              <p className="text-gray-600 text-sm">Share your thoughts and discover new films</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition border border-gray-100">
              <div className="text-4xl mb-3">📝</div>
              <h3 className="text-lg font-semibold text-gray-800">Create Watchlist</h3>
              <p className="text-gray-600 text-sm">Save movies you want to watch later</p>
            </div>
          </div>
        )}

        {user && (
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold shadow-md"
              onClick={() => navigate('/recommendations')}
            >
              View Recommendations
            </button>
            <button 
              className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-semibold"
              onClick={() => navigate('/watchlist')}
            >
              My Watchlist
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Home