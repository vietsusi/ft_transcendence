import React, { useState, useRef } from 'react'
import { useAuth } from '../context/AuthContext'

function Profile() {
  const { user, updateUser, logout } = useAuth()
  const fileInputRef = useRef(null)
  
  // State for editing
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState('profile') // 'profile' | 'password' | 'preferences'
  
  // Profile form state
  const [username, setUsername] = useState(user?.username || '')
  const [email, setEmail] = useState(user?.email || '')
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  
  // Password form state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  // Preferences state
  const [selectedGenres, setSelectedGenres] = useState([])
  
  // UI state
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Available genres
  const availableGenres = [
    'Action', 'Adventure', 'Animation', 'Comedy', 'Crime',
    'Documentary', 'Drama', 'Family', 'Fantasy', 'Horror',
    'Mystery', 'Romance', 'Sci-Fi', 'Thriller', 'War',
    'Western', 'Musical', 'Sport', 'Biography', 'History'
  ]

  // Handle avatar file selection
  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  // Handle avatar upload
  const handleAvatarUpload = async () => {
    if (!selectedFile) return
    
    setLoading(true)
    try {
      // TODO: Replace with actual API call
      // const formData = new FormData()
      // formData.append('avatar', selectedFile)
      // const response = await api.post('/users/avatar', formData)
      // updateUser({ avatar: response.data.avatar })
      
      // Mock upload
      await new Promise(resolve => setTimeout(resolve, 1000))
      updateUser({ avatar: avatarPreview })
      setMessage({ type: 'success', text: 'Avatar updated successfully!' })
      setSelectedFile(null)
      setAvatarPreview(null)
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to upload avatar' })
    } finally {
      setLoading(false)
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    }
  }

  // Handle profile update
  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      // TODO: Replace with actual API call
      // const response = await api.put('/users/profile', { username, email })
      // updateUser(response.data)
      
      // Mock update
      await new Promise(resolve => setTimeout(resolve, 1000))
      updateUser({ username, email })
      setMessage({ type: 'success', text: 'Profile updated successfully!' })
      setIsEditing(false)
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile' })
    } finally {
      setLoading(false)
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    }
  }

  // Handle password change
  const handlePasswordChange = async (e) => {
    e.preventDefault()
    
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' })
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
      return
    }
    
    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' })
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
      return
    }
    
    setLoading(true)
    try {
      // TODO: Replace with actual API call
      // await api.put('/users/password', { currentPassword, newPassword })
      
      // Mock update
      await new Promise(resolve => setTimeout(resolve, 1000))
      setMessage({ type: 'success', text: 'Password updated successfully!' })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update password' })
    } finally {
      setLoading(false)
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    }
  }

  // Handle genre preferences
  const handleGenreToggle = (genre) => {
    setSelectedGenres(prev => 
      prev.includes(genre) 
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    )
  }

  const handleSavePreferences = async () => {
    setLoading(true)
    try {
      // TODO: Replace with actual API call
      // await api.put('/users/preferences', { genres: selectedGenres })
      
      // Mock update
      await new Promise(resolve => setTimeout(resolve, 1000))
      updateUser({ preferredGenres: selectedGenres })
      setMessage({ type: 'success', text: 'Preferences saved successfully!' })
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save preferences' })
    } finally {
      setLoading(false)
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    }
  }

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header with avatar */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-32 relative">
          <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-4 border-white bg-gray-300 flex items-center justify-center text-3xl font-bold text-gray-600 overflow-hidden">
                {avatarPreview || user?.avatar ? (
                  <img 
                    src={avatarPreview || user?.avatar} 
                    alt="Avatar" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  user?.username?.[0]?.toUpperCase() || 'U'
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-1.5 hover:bg-blue-700 transition shadow-lg"
                title="Change avatar"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
          </div>
        </div>

        {/* Avatar upload preview */}
        {selectedFile && (
          <div className="mt-14 px-6 pb-4 flex justify-center gap-3">
            <span className="text-sm text-gray-600">New avatar selected</span>
            <button
              onClick={handleAvatarUpload}
              disabled={loading}
              className="px-4 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition disabled:opacity-50"
            >
              {loading ? 'Uploading...' : 'Upload Avatar'}
            </button>
            <button
              onClick={() => {
                setSelectedFile(null)
                setAvatarPreview(null)
              }}
              className="px-4 py-1 bg-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-400 transition"
            >
              Cancel
            </button>
          </div>
        )}

        {/* User info */}
        <div className="px-6 pt-14 pb-4 text-center">
          <h2 className="text-2xl font-bold text-gray-800">{user?.username || 'User'}</h2>
          <p className="text-gray-600">{user?.email || 'No email'}</p>
          {user?.preferredGenres?.length > 0 && (
            <div className="flex flex-wrap gap-1 justify-center mt-2">
              {user.preferredGenres.map(genre => (
                <span key={genre} className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                  {genre}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Message display */}
        {message.text && (
          <div className={`mx-6 mb-4 p-3 rounded-lg ${
            message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {message.text}
          </div>
        )}

        {/* Tabs */}
        <div className="border-t border-gray-200">
          <div className="flex">
            {['profile', 'password', 'preferences'].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab)
                  setMessage({ type: '', text: '' })
                }}
                className={`flex-1 px-4 py-3 text-sm font-medium transition ${
                  activeTab === tab
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                {tab === 'profile' && '👤 Profile'}
                {tab === 'password' && '🔒 Password'}
                {tab === 'preferences' && '🎯 Preferences'}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileUpdate}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={!isEditing}
                    className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:border-blue-500 transition ${
                      isEditing ? 'border-gray-300' : 'border-gray-100 bg-gray-50'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={!isEditing}
                    className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:border-blue-500 transition ${
                      isEditing ? 'border-gray-300' : 'border-gray-100 bg-gray-50'
                    }`}
                  />
                </div>
                <div className="flex gap-3">
                  {!isEditing ? (
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      Edit Profile
                    </button>
                  ) : (
                    <>
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                      >
                        {loading ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(false)
                          setUsername(user?.username || '')
                          setEmail(user?.email || '')
                        }}
                        className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>
            </form>
          )}

          {/* Password Tab */}
          {activeTab === 'password' && (
            <form onSubmit={handlePasswordChange}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Password
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={6}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Change Password'}
                </button>
              </div>
            </form>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div>
              <p className="text-sm text-gray-600 mb-4">
                Select your favorite genres to get better recommendations
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                {availableGenres.map((genre) => {
                  const isSelected = selectedGenres.includes(genre) || 
                    user?.preferredGenres?.includes(genre)
                  return (
                    <button
                      key={genre}
                      onClick={() => {
                        if (!isSelected) {
                          setSelectedGenres([...selectedGenres, genre])
                        } else {
                          setSelectedGenres(selectedGenres.filter(g => g !== genre))
                        }
                      }}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                        isSelected
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {genre}
                    </button>
                  )
                })}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleSavePreferences}
                  disabled={loading}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Preferences'}
                </button>
                <button
                  onClick={() => {
                    setSelectedGenres(user?.preferredGenres || [])
                  }}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
                >
                  Reset
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Logout button */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to sign out?')) {
                logout()
              }
            }}
            className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-medium"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}

export default Profile