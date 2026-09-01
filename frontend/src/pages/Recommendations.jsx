import React from 'react'
import { useAuth } from '../context/AuthContext'

function Recommendations() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">🎯 Your Recommendations</h1>
        <p className="text-lg text-gray-600 mt-2">Based on your viewing history and ratings</p>
      </div>
      
      <div className="text-center py-16">
        <div className="text-6xl mb-4">🎬</div>
        <h3 className="text-xl font-semibold text-gray-700">No recommendations yet</h3>
        <p className="text-gray-500">Watch some movies and rate them to get personalized suggestions!</p>
      </div>
    </div>
  )
}

export default Recommendations