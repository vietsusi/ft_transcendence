import React, { useState, useEffect } from 'react'
import './Login.css'

function Login({ onClose, onLogin, onRegister }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')  // ← NEW: For registration
  const [username, setUsername] = useState('')
  const [isRegistering, setIsRegistering] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [touched, setTouched] = useState({})  // ← NEW: Track touched fields

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  // ===== STRICT EMAIL VALIDATION =====
  const validateEmail = (email) => {
    // Strict email regex - requires proper TLD
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    return emailRegex.test(email)
  }

  // ===== PASSWORD VALIDATION =====
  const validatePassword = (password) => {
    return password.length >= 6
  }

  // ===== GET FIELD ERROR =====
  const getFieldError = (field) => {
    if (!touched[field]) return ''
    
    switch(field) {
      case 'email':
        if (!email) return 'Email is required'
        if (!validateEmail(email)) return 'Please enter a valid email (e.g., user@domain.com)'
        return ''
      case 'password':
        if (!password) return 'Password is required'
        if (password.length < 6) return 'Password must be at least 6 characters'
        return ''
      case 'confirmPassword':
        if (isRegistering && confirmPassword !== password) return 'Passwords do not match'
        return ''
      case 'username':
        if (isRegistering && !username) return 'Username is required'
        if (isRegistering && username.length < 3) return 'Username must be at least 3 characters'
        return ''
      default:
        return ''
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // ===== MARK ALL FIELDS AS TOUCHED =====
    setTouched({
      email: true,
      password: true,
      username: isRegistering,
      confirmPassword: isRegistering
    })

    // ===== VALIDATE EMAIL =====
    if (!validateEmail(email)) {
      setError('Please enter a valid email address (e.g., user@domain.com)')
      return
    }

    // ===== VALIDATE PASSWORD =====
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    // ===== REGISTRATION VALIDATION =====
    if (isRegistering) {
      if (!username || username.length < 3) {
        setError('Username must be at least 3 characters')
        return
      }
      
      if (password !== confirmPassword) {
        setError('Passwords do not match')
        return
      }
    }

    setLoading(true)

    try {
      if (isRegistering) {
        await onRegister(username, email, password)
      } else {
        await onLogin(email, password)
      }
    } catch (error) {
      setError(error.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  // ===== HANDLE BLUR (Mark field as touched) =====
  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true })
  }

  return (
    <div className="login-overlay" onClick={onClose}>
      <div className="login-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose} aria-label="Close">×</button>
        
        <div className="login-header">
          <h2>{isRegistering ? 'Create Account' : 'Welcome Back'}</h2>
          <p>
            {isRegistering 
              ? 'Join us and start discovering your next favorite movie!' 
              : 'Sign in to continue your movie journey'}
          </p>
        </div>

        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form" noValidate>
          {isRegistering && (
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                placeholder="Choose a username (min 3 characters)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onBlur={() => handleBlur('username')}
                required
                minLength={3}
                disabled={loading}
                autoComplete="username"
                className={touched.username && getFieldError('username') ? 'error' : ''}
              />
              {touched.username && getFieldError('username') && (
                <span className="field-error">{getFieldError('username')}</span>
              )}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email (e.g., user@domain.com)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => handleBlur('email')}
              required
              disabled={loading}
              autoComplete="email"
              className={touched.email && getFieldError('email') ? 'error' : ''}
            />
            {touched.email && getFieldError('email') && (
              <span className="field-error">{getFieldError('email')}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              placeholder="Enter your password (min 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => handleBlur('password')}
              required
              minLength={6}
              disabled={loading}
              autoComplete={isRegistering ? 'new-password' : 'current-password'}
              className={touched.password && getFieldError('password') ? 'error' : ''}
            />
            {touched.password && getFieldError('password') && (
              <span className="field-error">{getFieldError('password')}</span>
            )}
          </div>

          {isRegistering && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onBlur={() => handleBlur('confirmPassword')}
                required
                minLength={6}
                disabled={loading}
                autoComplete="new-password"
                className={touched.confirmPassword && getFieldError('confirmPassword') ? 'error' : ''}
              />
              {touched.confirmPassword && getFieldError('confirmPassword') && (
                <span className="field-error">{getFieldError('confirmPassword')}</span>
              )}
            </div>
          )}

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Please wait...' : (isRegistering ? 'Create Account' : 'Sign In')}
          </button>

          <div className="switch-mode">
            <p>
              {isRegistering ? 'Already have an account?' : "Don't have an account?"}
              <button 
                type="button" 
                className="switch-btn"
                onClick={() => {
                  setIsRegistering(!isRegistering)
                  setError('')
                  setTouched({})
                  setConfirmPassword('')  // Reset confirm password on switch
                }}
                disabled={loading}
              >
                {isRegistering ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login