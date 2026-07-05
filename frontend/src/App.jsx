import React, { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="app">
      <header className="app-header">
        <h1>🎬 FT_Transcendence</h1>
        <h2>Movie & TV Series Recommendation Platform</h2>
        <div className="card">
          <p>Frontend is working!</p>
          <button onClick={() => setCount((count) => count + 1)}>
            Count is {count}
          </button>
        </div>
        <div className="status">
          <p>✅ React + Vite setup successful</p>
          <p>🐳 Docker: Ready</p>
        </div>
      </header>
    </div>
  )
}

export default App