#### Login

┌─────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION FLOW                       │
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


## Architecture Diagram
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