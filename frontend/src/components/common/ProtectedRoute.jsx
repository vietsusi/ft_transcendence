import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './ProtectedRoute.css'  // ← ADD: Import CSS for styling

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()

  // ===== SHOW LOADING STATE =====
  if (loading) {
    return (
      <div className="protected-loading">
        <div className="loading-spinner"></div>
        <p>Checking authentication...</p>
      </div>
    )
  }

  // ===== REDIRECT IF NOT AUTHENTICATED =====
  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }

  // ===== SHOW PROTECTED CONTENT =====
  return children
}

export default ProtectedRoute