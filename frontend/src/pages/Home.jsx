import React from 'react'
import './Home.css'

function Home({ user }) {
  // Get the username from the user object
  const displayName = user?.username || user?.email || user?.name || 'User'
  
  return (
    <div className="home-container">
      <div className="hero-section">
        <h1 className="hero-title">
          {user ? `Welcome back, ${displayName}!` : 'Discover Your Next Favorite Movie'}
        </h1>
        <p className="hero-subtitle">
          {user 
            ? 'Ready to find your next movie or TV series?' 
            : 'Sign in to get personalized recommendations based on your taste'}
        </p>
        
        {!user && (
          <div className="hero-features">
            <div className="feature-card">
              <span className="feature-icon">🎯</span>
              <h3>Personalized Recommendations</h3>
              <p>Get movie suggestions tailored to your preferences</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">⭐</span>
              <h3>Rate & Review</h3>
              <p>Share your thoughts and discover new films</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">📝</span>
              <h3>Create Watchlist</h3>
              <p>Save movies you want to watch later</p>
            </div>
          </div>
        )}

        {user && (
          <div className="user-actions">
            <button className="action-btn">View Recommendations</button>
            <button className="action-btn secondary">My Watchlist</button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Home