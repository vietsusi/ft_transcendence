import React, { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

// ===== CONFIGURATION =====
// Set to false when backend is ready
const USE_MOCK_API = false // ← Change to false when connecting to real backend

// ===== CREATE AXIOS INSTANCE =====
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
})

// ===== REQUEST INTERCEPTOR (Adds token to every request) =====
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ===== RESPONSE INTERCEPTOR (Handles errors globally) =====
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      // Redirect to home if not already there
      if (window.location.pathname !== '/') {
        window.location.href = '/'
      }
    }
    return Promise.reject(error)
  }
)

// ===== CREATE CONTEXT =====
const AuthContext = createContext()

// ===== CUSTOM HOOK =====
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

// ===== EMAIL VALIDATION HELPER =====
const validateEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return emailRegex.test(email)
}

// ===== MOCK USER DATABASE (Only used in mock mode) =====
const mockUsers = [
  {
    id: 1,
    username: 'demo',
    email: 'demo@example.com',
    password: 'password123',
    name: 'Demo User',
    avatar: null,
    createdAt: new Date().toISOString()
  }
]

const findUserByEmail = (email) => {
  return mockUsers.find(user => user.email.toLowerCase() === email.toLowerCase())
}

const findUserByUsername = (username) => {
  return mockUsers.find(user => user.username.toLowerCase() === username.toLowerCase())
}

// ===== AUTH PROVIDER =====
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Check for existing session on load
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const token = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    
    if (token && storedUser) {
      try {
        if (USE_MOCK_API) {
          // Mock mode: use stored user
          setUser(JSON.parse(storedUser))
        } else {
          // Real backend: verify token
          const response = await api.get('/auth/verify')
          setUser(response.data.user)
        }
      } catch (error) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setUser(null)
      }
    }
    setLoading(false)
  }

  // ===== LOGIN FUNCTION =====
  const login = async (email, password) => {
    setError(null)
    setLoading(true)
    
    // Validate inputs
    if (!email || !password) {
      setError('Email and password are required')
      setLoading(false)
      throw new Error('Email and password are required')
    }
    
    if (!validateEmail(email)) {
      setError('Please enter a valid email address (e.g., user@domain.com)')
      setLoading(false)
      throw new Error('Invalid email address')
    }
    
    try {
      let userData, token

      if (USE_MOCK_API) {
        // ===== MOCK MODE =====
        const foundUser = findUserByEmail(email)
        
        if (!foundUser) {
          setError('No account found with this email address')
          setLoading(false)
          throw new Error('User not found')
        }
        
        if (foundUser.password !== password) {
          setError('Incorrect password. Please try again.')
          setLoading(false)
          throw new Error('Invalid password')
        }
        
        userData = {
          id: foundUser.id,
          username: foundUser.username,
          email: foundUser.email,
          name: foundUser.name || foundUser.username,
          avatar: foundUser.avatar,
          createdAt: foundUser.createdAt
        }
        token = 'mock-jwt-token-' + Date.now()
        
      } else {
        // ===== REAL BACKEND =====
        const response = await api.post('/auth/login', { email, password })
        userData = response.data.user
        token = response.data.token
      }
      
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(userData))
      
      setUser(userData)
      return userData
      
    } catch (error) {
      if (!error.message || error.message === 'User not found' || error.message === 'Invalid password') {
        // Error already set
      } else {
        setError(error.response?.data?.message || 'Login failed. Please try again.')
      }
      throw error
    } finally {
      setLoading(false)
    }
  }

  // ===== REGISTER FUNCTION =====
  const register = async (username, email, password) => {
    setError(null)
    setLoading(true)
    
    if (!username || username.length < 3) {
      setError('Username must be at least 3 characters')
      setLoading(false)
      throw new Error('Username must be at least 3 characters')
    }
    
    if (!email || !validateEmail(email)) {
      setError('Please enter a valid email address (e.g., user@domain.com)')
      setLoading(false)
      throw new Error('Invalid email address')
    }
    
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      throw new Error('Password must be at least 6 characters')
    }
    
    try {
      let userData, token

      if (USE_MOCK_API) {
        // ===== MOCK MODE =====
        const existingEmail = findUserByEmail(email)
        if (existingEmail) {
          setError('An account with this email already exists')
          setLoading(false)
          throw new Error('Email already registered')
        }
        
        const existingUsername = findUserByUsername(username)
        if (existingUsername) {
          setError('Username is already taken')
          setLoading(false)
          throw new Error('Username already taken')
        }
        
        const newUser = {
          id: Date.now(),
          username: username,
          email: email,
          password: password,
          name: username,
          avatar: null,
          createdAt: new Date().toISOString()
        }
        
        mockUsers.push(newUser)
        
        userData = {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          name: newUser.name,
          avatar: newUser.avatar,
          createdAt: newUser.createdAt
        }
        token = 'mock-jwt-token-' + Date.now()
        
      } else {
        // ===== REAL BACKEND =====
        const response = await api.post('/auth/register', { username, email, password })
        userData = response.data.user
        token = response.data.token
      }
      
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(userData))
      
      setUser(userData)
      return userData
      
    } catch (error) {
      if (!error.message || 
          error.message === 'Email already registered' || 
          error.message === 'Username already taken') {
        // Error already set
      } else {
        setError(error.response?.data?.message || 'Registration failed. Please try again.')
      }
      throw error
    } finally {
      setLoading(false)
    }
  }

  // ===== LOGOUT =====
  // const logout = async () => {
  //   try {
  //     if (!USE_MOCK_API) {
  //       await api.post('/auth/logout')
  //     }
  //   } catch (error) {
  //     // Ignore logout errors
  //   } finally {
  //     localStorage.removeItem('token')
  //     localStorage.removeItem('user')
  //     setUser(null)
  //     setError(null)
  //   }
  // }
  const logout = () => {
  // Simply remove tokens and clear state - no API call needed for JWT
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  setUser(null)
  setError(null)
  console.log('🔴 User logged out')
}

  // ===== UPDATE USER =====
  const updateUser = (updatedData) => {
    const updatedUser = { ...user, ...updatedData }
    localStorage.setItem('user', JSON.stringify(updatedUser))
    setUser(updatedUser)
  }

  // ===== VALUE OBJECT =====
  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user,
    isMockMode: USE_MOCK_API
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// ===== EXPORT API FOR OTHER COMPONENTS =====
export { api }