import React from 'react'
import './Movies.css'

function Movies() {
  return (
    <div className="movies-container">
      <h1>🎬 Browse Movies</h1>
      <p className="subtitle">Discover and search for your favorite films</p>
      
      <div className="search-bar">
        <input 
          type="text" 
          placeholder="Search for movies, TV shows, genres..."
          className="search-input"
        />
        <button className="search-btn">Search</button>
      </div>
      
      <div className="movie-grid">
        {/* Movie cards will be populated here */}
        <div className="empty-state">
          <span className="empty-icon">🎥</span>
          <h3>No movies found</h3>
          <p>Start searching to discover great films!</p>
        </div>
      </div>
    </div>
  )
}

export default Movies