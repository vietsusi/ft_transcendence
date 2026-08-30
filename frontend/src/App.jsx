import React, { useState } from 'react' 
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Home from './pages/Home'
import Login from './components/auth/Login'
import Navbar from './components/common/Navbar'
import ProtectedRoute from './components/common/ProtectedRoute'
import Profile from './pages/Profile'
import Recommendations from './pages/Recommendations'
import Movies from './pages/Movies'  // ← Added: for future use
import MovieDetails from './pages/MovieDetails'      // ← Added: for future use
import Watchlist from './pages/Watchlist'            // ← Added: for future use
import Dashboard from './pages/Dashboard'            // ← Added: for future use

// import './App.css'

function App() {
  const { user, login, register, logout, isAuthenticated, loading, error } = useAuth()
  const [isLoginOpen, setIsLoginOpen] = useState(false) 

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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-3 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar 
        user={user}
        isAuthenticated={isAuthenticated}
        onLoginClick={() => setIsLoginOpen(true)}
        onLogout={handleLogout}
      />
      
      {/* ===== GLOBAL ERROR DISPLAY ===== */}
      {error && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </span>
            <button 
              className="text-red-700 hover:text-red-900 text-xl"
              onClick={() => {}}
            >
              ×
            </button>
          </div>
        </div>
      )}
      
      <main className="container mx-auto px-4 py-6">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home user={user} />} />
          <Route path="/movies" element={<Movies />} />
          <Route path="/movies/:id" element={<MovieDetails />} />  {/* ← ADD */}
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
          <Route path="/watchlist" element={
            <ProtectedRoute>
              <Watchlist />
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
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