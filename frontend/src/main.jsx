import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'      // ← Enables routing
import { AuthProvider } from './context/AuthContext'  // ← Provides auth state to ALL components
import App from './App'                                // ← Main app component
import './index.css'                                  // ← Global styles

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>          {/* 1. Enables URL routing (/, /profile, /recommendations) */}
      <AuthProvider>         {/* 2. Wraps everything - makes auth available everywhere */}
        <App />              {/* 3. Main app - contains all pages */}
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)