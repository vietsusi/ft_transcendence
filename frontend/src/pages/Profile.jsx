import React from 'react'
import { useAuth } from '../context/AuthContext'
import './Profile.css'

function Profile() {
  const { user, logout } = useAuth()

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            {user?.avatar ? (
              <img src={user.avatar} alt="Avatar" />
            ) : (
              <span className="avatar-placeholder">
                {user?.username?.[0]?.toUpperCase() || 'U'}
              </span>
            )}
          </div>
          <h2>{user?.username}</h2>
          <p>{user?.email}</p>
        </div>
        <div className="profile-stats">
          <div className="stat-item">
            <span className="stat-value">0</span>
            <span className="stat-label">Movies Watched</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">0</span>
            <span className="stat-label">Reviews</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">0</span>
            <span className="stat-label">Watchlist</span>
          </div>
        </div>
        <button className="logout-btn-full" onClick={logout}>
          Sign Out
        </button>
      </div>
    </div>
  )
}

export default Profile