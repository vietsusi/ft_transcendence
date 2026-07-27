import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Navbar.css'

function Navbar({ user, isAuthenticated, onLoginClick, onLogout }) {
  const navigate = useNavigate()

  // ===== HANDLE LOGOUT =====
  const handleLogout = () => {
    onLogout()
    navigate('/')
  }

  // ===== GET DISPLAY NAME =====
  const displayName = user?.username || user?.name || user?.email || 'User'

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* ===== LOGO ===== */}
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">🎬</span>
          <span className="logo-text">CineMatch</span>
        </Link>
        
        {/* ===== NAV LINKS ===== */}
        <div className="navbar-links">
          {isAuthenticated ? (
            // ===== LOGGED IN =====
            <>
              <Link to="/movies" className="nav-link">
                Movies
              </Link>
              <Link to="/recommendations" className="nav-link">
                Recommendations
              </Link>
              <Link to="/profile" className="nav-link profile-link">
                <span className="welcome-text">👤 {displayName}</span>
              </Link>
              <button className="navbar-btn logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            // ===== NOT LOGGED IN =====
            <>
              <Link to="/movies" className="nav-link">
                Movies
              </Link>
              <button className="navbar-btn signin-btn" onClick={onLoginClick}>
                Sign In
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar