import React, { useState } from 'react'  // ← Changed: import useState directly
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Home from './pages/Home'
import Login from './components/auth/Login'
import Navbar from './components/common/Navbar'
import ProtectedRoute from './components/common/ProtectedRoute'
import Profile from './pages/Profile'
import Recommendations from './pages/Recommendations'
import Movies from './pages/Movies'  // ← Added: for future use
import './App.css'

function App() {
  const { user, login, register, logout, isAuthenticated, loading, error } = useAuth()
  const [isLoginOpen, setIsLoginOpen] = useState(false)  // ← Changed: removed React.

  // ===== HANDLE LOGIN =====
  const handleLogin = async (email, password) => {
    try {
      const result = await login(email, password)
      console.log('✅ Login successful:', result)
      setIsLoginOpen(false)
      return result
    } catch (error) {
      console.error('❌ Login error:', error)
      // Error is already handled in AuthContext
      throw error
    }
  }

  // ===== HANDLE REGISTER =====
  const handleRegister = async (username, email, password) => {
    try {
      const result = await register(username, email, password)
      console.log('✅ Registration successful:', result)
      setIsLoginOpen(false)
      return result
    } catch (error) {
      console.error('❌ Registration error:', error)
      throw error
    }
  }

  // ===== HANDLE LOGOUT =====
  const handleLogout = () => {
    logout()
    console.log('🔴 User logged out')
  }

  // ===== SHOW LOADING STATE =====
  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="app">
      <Navbar 
        user={user}
        isAuthenticated={isAuthenticated}
        onLoginClick={() => setIsLoginOpen(true)}
        onLogout={handleLogout}
      />
      
      {/* ===== GLOBAL ERROR DISPLAY ===== */}
      {error && (
        <div className="global-error">
          <div className="global-error-content">
            <span className="global-error-icon">⚠️</span>
            <span className="global-error-message">{error}</span>
            <button 
              className="global-error-dismiss"
              onClick={() => setError(null)}
            >
              ×
            </button>
          </div>
        </div>
      )}
      
      <main className="main-content">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home user={user} />} />
          <Route path="/movies" element={<Movies />} />
          
          {/* Protected Routes - Only when logged in */}
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/recommendations" element={
            <ProtectedRoute>
              <Recommendations />
            </ProtectedRoute>
          } />
          
          {/* 404 - Redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Login Modal */}
      {isLoginOpen && (
        <Login 
          onClose={() => setIsLoginOpen(false)}
          onLogin={handleLogin}
          onRegister={handleRegister}
        />
      )}
    </div>
  )
}

export default App