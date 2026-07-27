This is the ft_transcendence projects.
Team member: Viet, Lin, An, Jasmin
# Folder Structure

ft_transcendence/
├── backend/                    # Person A & B's code
│   ├── src/
│   ├── prisma/
│   └── package.json
│
├── frontend/                   # (Person D)
│   ├── public/                 # Static files (favicon, images)
│   ├── src/
│   │   ├── api/               # API calls to backend
│   │   ├── components/        # Reusable UI pieces
│   │   ├── pages/             # Full pages (routes)
│   │   ├── hooks/             # Custom React hooks
│   │   ├── context/           # React Context (Auth, Theme)
│   │   ├── utils/             # Helper functions
│   │   ├── styles/            # CSS/tailwind
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── routes.jsx
│   ├── package.json
│   ├── vite.config.js
│   ├── Dockerfile
│   └── .env
│
├── docker-compose.yml         # Main Docker config
├── .env                       # Environment variables
├── .gitignore
└── README.md


# Explanation
1. Backend and Frontend are isolated
2. Clear ownship
3. Easy to add new features
4. Using Git on each developer's branch -> Merge need to have Pull Request and approval from 3 remaining person
