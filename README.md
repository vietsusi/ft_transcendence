*This project has been created as part of the 42 curriculum by vinguyen, atran, linliu, jiawli.*

# FT_TRANSCENDENCE

## Description

**Project name:** ft_transcendence, a Movie & TV Series Recommendation Platform.

Users can browse and search movies and TV series (data from the TMDB API), create an account, manage their profile, and chat with an AI-powered assistant to get recommendations.

**Goal:** build a complete full-stack web application (frontend, backend, database, containerized deployment) as the ft_transcendence project of the 42 curriculum.

**Key features**
- User registration and authentication (JWT)
- Browse and search movies and TV series (TMDB)
- Recommendations
- Chatbot assistant (demo mode or real LLM provider)
- Image upload (user uploads stored in `backend/uploads`)
- Fully containerized with Docker Compose

---

## Instructions

### Prerequisites
- Git
- Docker and Docker Compose (`docker compose` v2 or `docker-compose`)
- Free ports: `5173` (frontend), `5001` (backend), `55432` (PostgreSQL, bound to localhost)
- No local Node.js is required, everything runs inside containers

### Configuration (.env)
Create a `.env` file at the repository root (it is git-ignored). All variables have defaults, so the project also starts without it, but you should set your own values:

```env
DATABASE_URL=postgresql://postgres:postgres@db:5432/transcendence
JWT_SECRET=change_me_in_prod
API_KEY=change_me_api_key
TMDB_API_KEY=<your TMDB API key>
FRONTEND_URL=http://localhost:5173
CHAT_MODE=demo            # demo = no external LLM needed
CHAT_BASE_URL=
CHAT_API_KEY=
CHAT_MODEL=
```

### Run the project
```bash
git clone git@github.com:vietsusi/ft_transcendence.git
cd ft_transcendence
git checkout main

docker-compose -f ./docker-compose.yml up -d --build
```

The first start takes a few minutes: the containers install their npm dependencies, generate the Prisma client, apply the database migrations and seed the database.

Then open:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5001/api

### Useful commands
```bash
docker ps -a                                      # status of the containers
docker logs -f transcendence_frontend             # frontend logs
docker logs -f transcendence_backend              # backend logs
docker-compose -f ./docker-compose.yml down       # stop everything
docker-compose -f ./docker-compose.yml down -v    # stop and delete the database volume
```

### Project structure
```
ft_transcendence/
├── backend/             # NestJS API + Prisma
├── frontend/            # React + Vite
├── docker-compose.yml
├── SetUp.md             # Detailed setup guide
├── Architecture_Diagram.md
└── README.md
```

---

## Team Information

| Login | Name | Role | Responsibilities |
|-------|------|------|------------------|
| vinguyen | Viet | Frontend Lead | UI/UX, React components, integration with the API |
| atran | An | Backend Lead | Backend API and database |
| linliu | Lin | Backend Lead | Backend API and database |
| jiawli | Jasmin | Developer (Chatbot) | Chatbot feature (backend and frontend integration) |

---

## Project Management

- **Workflow:** feature branches (`feature/<name>`), Pull Request on GitHub, approval from 3 team members, then merge into `main`.
- **Tools:** GitHub (repository and Pull Requests).
- **Communication:** direct communication between team members.

---

## Technical Stack

**Frontend**
- React 19, Vite, React Router
- Tailwind CSS, Radix UI, lucide-react
- Axios for API calls
- Vercel AI SDK (`ai`, `@ai-sdk/react`) and Streamdown for the chat interface
- Vitest and Testing Library for tests

**Backend**
- NestJS (Node.js)
- Prisma ORM (migrations and seeding)
- JWT authentication

**Database**
- PostgreSQL 16, a relational database well suited to structured data with relations (users and their data) and integrity constraints, with good Prisma support.

**Other**
- Docker and Docker Compose for the whole environment
- TMDB API as the source of movie and TV data

**Justification of major choices**
- NestJS: structured, modular backend written in TypeScript.
- Prisma: type-safe database access and versioned migrations.
- React + Vite: fast development and a rich ecosystem.
- Docker Compose: one command runs the full stack on any machine.

---

## Database Schema

The schema is defined in `backend/prisma/schema.prisma`, which lists all tables, fields, data types and relations. Migrations are in `backend/prisma/migrations`.

---

## Features List

| Feature | Description | Team member(s) |
|---------|-------------|----------------|
| Authentication | Registration, login, JWT sessions | Backend team |
| Movie/TV browsing and search | Search and display titles from TMDB | Backend and frontend teams |
| Recommendations | Suggestions of movies and series | Backend team |
| Chatbot | Conversational assistant for recommendations | Jasmin |
| User interface | Pages, components, responsive layout | Viet |

---

## Modules

The modules chosen for this project are described in the evaluation sheet. Major modules count for 2 points and minor modules for 1 point.

---

## Individual Contributions

- **Viet (vinguyen):** frontend, UI/UX and React components.
- **An (atran):** backend API and database.
- **Lin (linliu):** backend API and database.
- **Jasmin (jiawli):** chatbot feature.

---

## Development Workflow

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make changes and commit
3. Push to GitHub
4. Open a Pull Request
5. Get approval from 3 team members
6. Merge into `main`

---

## Resources

**Documentation and references**
- NestJS: https://docs.nestjs.com
- Prisma: https://www.prisma.io/docs
- PostgreSQL: https://www.postgresql.org/docs
- React: https://react.dev
- Vite: https://vite.dev
- Tailwind CSS: https://tailwindcss.com/docs
- Docker and Docker Compose: https://docs.docker.com
- TMDB API: https://developer.themoviedb.org/docs
- JWT: https://jwt.io/introduction

**Use of AI**
- Claude was used to debug the Docker and npm setup (lock file mismatch between Vite and Vitest, `npm ci` in the Compose commands) and to fix `docker-compose.yml`.
- Claude was used to help write and structure this README.

All AI-generated content was reviewed and tested by the team before being used.

---

## Additional Information

- Detailed setup guide: `SetUp.md`
- Architecture diagram: `Architecture_Diagram.md`