### Frontend Architecture Documentation

## 📋 Table of Contents
- [File Structure](#file-structure)
- [System Architecture](#system-architecture)
- [Frontend Architecture](#frontend-architecture)
- [Authentication Flow](#authentication-flow)
- [Authentication Flow (Simplified)](#authentication-flow-simplified)
- [Authentication System](#authentication-system)
- [Component Communication](#component-communication)
- [API Calls Flow](#api-calls-flow)
- [Component Responsibilities](#component-responsibilities)
---

# 📁 File Structure (Compact)
```bash
frontend/
├── src/
│   ├── api/
│   │   ├── axios.js          # HTTP client + interceptors
│   │   └── movieApi.js       # API endpoints
│   │
│   ├── context/
│   │   └── AuthContext.jsx   # Global auth state
│   │
│   ├── components/
│   │   ├── auth/
│   │   │   └── Login.jsx     # Login/Register modal
│   │   └── common/
│   │       ├── Navbar.jsx    # Navigation
│   │       └── ProtectedRoute.jsx # Route guard
│   │
│   ├── pages/
│   │   ├── Home.jsx          # Public homepage
│   │   ├── Profile.jsx       # User profile
│   │   ├── Movies.jsx        # Movie browsing
│   │   └── Recommendations.jsx # Recommendations
│   │
│   ├── App.jsx              # Main app + routes
│   └── main.jsx             # Entry point
│
├── .env                     # Environment variables
└── vite.config.js          # Vite config
```

# 🏗️ System Architecture

┌─────────────────────────────────────────────────────────┐
│                     WEBSITE                             │
│                                                         │
│  ┌──────────────┐    ┌──────────────┐                   │
│  │   Frontend   │    │   Backend    │                   │
│  │  (Vite:5174) │───▶│ (NestJS:5000)│                   │
│  └──────────────┘    └──────┬───────┘                   │
│         │                    │                          │
│         │                    ▼                          │
│         │           ┌──────────────┐                    │
│         │           │  PostgreSQL  │                    │
│         │           │  (Port:5432) │                    │
│         │           └──────────────┘                    │
│         │                    │                          │
│         ▼                    ▼                          │
│  http://localhost:5174  http://localhost:5000/api       │
│                                                         │
└─────────────────────────────────────────────────────────┘

# Frontend Architecture
```bash
┌────────────────────────────────────────────────────────────────────────────┐
│                          FRONTEND ARCHITECTURE                             │
└────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│                          main.jsx (Entry Point)                          │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │ <BrowserRouter> → <AuthProvider> → <App />                         │  │
│  └────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────┘
                                      │
┌─────────────────────────────────────▼────────────────────────────────────┐
│                            App.jsx (Main App)                            │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │ Routes: / → Home, /movies → Movies, /profile → Profile (Protected) │  │
│  │         /recommendations → Recommendations (Protected)             │  │
│  └────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────┘
                                      │
          ┌───────────────────────────┼───────────────────────────┐
          │                           │                           │
┌─────────▼─────────┐    ┌────────────▼────────────┐    ┌─────────▼─────────┐
│     Navbar        │    │      AuthContext        │    │  ProtectedRoute   │
│  (Navigation)     │    │    (Global State)       │    │  (Auth Guard)     │
│                   │    │                         │    │                   │
│ • Logo            │    │  ┌────────────────────┐ │    │ • Checks auth     │
│ • Movies link     │    │  │ user: null/{user}  │ │    │ • Redirects if    │
│ • Sign In/Logout  │◄───│  │ isAuthenticated    │ │───►│   not logged in   │
│ • Profile link    │    │  │ loading: false     │ │    │ • Shows children  │
│                   │    │  │ error: null        │ │    │                   │
└───────────────────┘    │  └────────────────────┘ │    └───────────────────┘
                         │                         │
                         │  ┌────────────────────┐ │
                         │  │ login()            │ │
                         │  │ register()         │ │
                         │  │ logout()           │ │
                         │  └────────────────────┘ │
                         └────────────┬────────────┘
                                      │
                    ┌─────────────────┼─────────────────┐
                    │                 │                 │
┌───────────────────▼──────┐ ┌────────▼────────┐ ┌───────▼───────────────────┐
│      Home (Public)       │ │   Login (Modal) │ │   Profile (Protected)     │
│                          │ │                 │ │                           │
│ • Welcome message        │ │ • Login Form    │ │ • User avatar             │
│ • Features cards         │ │ • Register Form │ │ • Username                │
│ • Call to action         │ │ • Toggle switch │ │ • Email                   │
│                          │ │ • Error display │ │ • Stats (watched, etc)    │
└─────────────────────────-┘ └────────┬────────┘ │ • Logout button           │
                                      │          └───────────────────────────┘
                                      │
┌────────────────────────────────────-▼───────────────────────────────────────┐
│                           axios.js (HTTP Client)                            │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ • Base URL: http://localhost:5000/api                                │   │
│  │ • Request Interceptor: Adds Bearer Token to every request            │   │
│  │ • Response Interceptor: Handles 401 Unauthorized                     │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────┬────────────────────────────────────────┘
                                     │
┌────────────────────────────────────▼───────────────────────────────────────┐
│                              BACKEND API                                   │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  POST /auth/login  → Login user and get JWT token                    │  │
│  │  POST /auth/register → Register new user                             │  │
│  │  GET /users/me     → Get current user profile (protected)            │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────────┘
```

# 🔐 Authentication Flow
```bash
┌─────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION FLOW                      │
└─────────────────────────────────────────────────────────────┘

  NOT LOGGED IN                    LOGGED IN
  ──────────────                    ─────────
  
  Home Page                        Home Page
  ├─ Show features                 ├─ Welcome back, [user]!
  ├─ "Sign In" button              ├─ "View Recommendations" button
  └─ No user info                  └─ "My Watchlist" button

  Navbar                           Navbar
  ├─ Logo                          ├─ Logo
  ├─ "Sign In" button              ├─ "Recommendations" link
  └─ No user name                  ├─ "👤 username" link
                                   └─ "Logout" button

  Login Modal                      Login Modal
  ├─ Shows when clicked            └─ Not accessible (hidden)
  ├─ Login/Register toggle
  └─ Form fields

  Protected Routes                 Protected Routes
  ├─ /profile → Redirect to Home   ├─ /profile → Show Profile
  └─ /recommendations → Redirect   └─ /recommendations → Show Recommendations
```
# 🔐 Authentication Flow (Simplified)
```bash
┌────────────────────────────────────────────────────────────────────────┐
│                         AUTHENTICATION FLOW                            │
└────────────────────────────────────────────────────────────────────────┘

    USER                    FRONTEND                      BACKEND
     │                          │                            │
     │  1. Click "Sign In"      │                            │
     ├─────────────────────────►│                            │
     │                          │                            │
     │  2. Enter credentials    │                            │
     ├─────────────────────────►│  3. POST /auth/login       │
     │                          ├───────────────────────────►│
     │                          │                            │
     │                          │  4. Return JWT token       │
     │                          │◄───────────────────────────┤
     │                          │                            │
     │  5. Store token in       │                            │
     │     localStorage         │                            │
     │◄─────────────────────────┤                            │
     │                          │                            │
     │  6. Logged in ✓          │  7. GET /users/me          │
     ├─────────────────────────►│   (with Bearer token)      │
     │                          ├───────────────────────────►│
     │                          │                            │
     │  8. Show user data       │  9. Return user profile    │
     │◄─────────────────────────┤◄───────────────────────────┤
     │                          │                            │
     │  10. Click "Logout"      │                            │
     ├─────────────────────────►│  11. Clear localStorage    │
     │                          ├────────────────────────────┤
     │  12. Redirect to Home    │                            │
     │◄─────────────────────────┤                            │

```

# 🏗️ Authentication System
```bash
┌─────────────────────────────────────────────────────────────────────────────┐
│                          AUTHENTICATION SYSTEM                              │
└─────────────────────────────────────────────────────────────────────────────┘

                                    ┌─────────────────┐
                                    │   main.jsx      │
                                    │ (Entry Point)   │
                                    └────────┬────────┘
                                             │
                                    ┌────────▼────────┐
                                    │  BrowserRouter  │
                                    │  (Routing)      │
                                    └────────┬────────┘
                                             │
                                    ┌────────▼────────┐
                                    │  AuthProvider   │
                                    │  (Global State) │
                                    └────────┬────────┘
                                             │
                                    ┌────────▼────────┐
                                    │     App.jsx     │
                                    │  (Main App)     │
                                    └────────┬────────┘
                                             │
              ┌──────────────────────────────┼──────────────────────────────┐
              │                              │                              │
     ┌────────▼────────┐          ┌─────────▼─────────┐          ┌─────────▼─────────┐
     │    Navbar.jsx   │          │     Home.jsx      │          │     Login.jsx     │
     │  (Navigation)   │          │   (Home Page)     │          │   (Auth Modal)    │
     └────────┬────────┘          └───────────────────┘          └─────────┬─────────┘
              │                                                           │
              │                                                           │
     ┌────────▼────────┐                                        ┌─────────▼─────────┐
     │  AuthContext    │◄───────────────────────────────────────│   AuthContext     │
     │  (useAuth)      │                                        │   (useAuth)       │
     └─────────────────┘                                        └───────────────────┘
```

# 📦 Component Communication (Compact)
```bash
                    ┌─────────────────────┐
                    │     AuthContext     │
                    │   (Global State)    │
                    └──────────┬──────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
┌───────▼───────┐    ┌─────────▼─────────┐    ┌───────▼───────┐
│    Navbar     │    │       Home        │    │    Profile    │
│  (useAuth)    │    │     (useAuth)     │    │   (useAuth)   │
│               │    │                   │    │               │
│ • Shows user  │    │ • Welcome user    │    │ • User data   │
│ • Logout      │    │ • Features        │    │ • Logout      │
└───────────────┘    └───────────────────┘    └───────────────┘
```

# 🌐 API Calls Flow (Compact)
```bash
┌────────────────────────────────────────────────────────────────────────┐
│                            API CALLS FLOW                              │
└────────────────────────────────────────────────────────────────────────┘

  Component              axios.js                 Backend
     │                      │                        │
     │ 1. api.get('/users') │                        │
     ├─────────────────────►│                        │
     │                      │                        │
     │                      │ 2. Add Bearer Token    │
     │                      │    from localStorage   │
     │                      │                        │
     │                      │ 3. HTTP Request        │
     │                      ├───────────────────────►│
     │                      │                        │
     │                      │ 4. Response            │
     │                      │◄───────────────────────┤
     │                      │                        │
     │ 5. Return data       │ 6. If 401:             │
     │◄─────────────────────┤    - Clear token       │
     │                      │    - Redirect to /     │

```
