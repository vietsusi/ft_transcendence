import React from 'react'
import { useAuth } from '../context/AuthContext'
import './Recommendations.css'

function Recommendations() {
  const { user } = useAuth()

  return (
    <div className="recommendations-container">
      <h1>🎯 Your Recommendations</h1>
      <p className="subtitle">Based on your viewing history and ratings</p>
      
      <div className="recommendations-grid">
        {/* This will be populated with real recommendations later */}
        <div className="empty-state">
          <span className="empty-icon">🎬</span>
          <h3>No recommendations yet</h3>
          <p>Watch some movies and rate them to get personalized suggestions!</p>
        </div>
      </div>
    </div>
  )
}

export default Recommendations