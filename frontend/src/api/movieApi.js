import { api } from '../context/AuthContext'

export const movieApi = {
  // Get all movies
  getMovies: (params) => api.get('/movies', { params }),
  
  // Get single movie
  getMovie: (id) => api.get(`/movies/${id}`),
  
  // Search movies
  searchMovies: (query) => api.get('/movies/search', { params: query }),
  
  // Get genres
  getGenres: () => api.get('/genres'),
}

export const userApi = {
  // Get user profile
  getProfile: () => api.get('/users/profile'),
  
  // Update profile
  updateProfile: (data) => api.put('/users/profile', data),
  
  // Get watchlist
  getWatchlist: () => api.get('/users/watchlist'),
  
  // Add to watchlist
  addToWatchlist: (movieId) => api.post('/users/watchlist', { movieId }),
  
  // Remove from watchlist
  removeFromWatchlist: (movieId) => api.delete(`/users/watchlist/${movieId}`),
  
  // Get watch history
  getWatchHistory: () => api.get('/users/watch-history'),
  
  // Get ratings
  getRatings: () => api.get('/users/ratings'),
  
  // Rate a movie
  rateMovie: (movieId, rating) => api.post('/users/ratings', { movieId, rating }),
}

export const recommendationApi = {
  // Get recommendations
  getRecommendations: () => api.get('/recommendations'),
  
  // Get analytics
  getAnalytics: () => api.get('/analytics'),
  
  // Export data
  exportData: (format) => api.get(`/analytics/export?format=${format}`),
}