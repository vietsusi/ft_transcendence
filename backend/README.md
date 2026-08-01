# ft_transcendence — Backend

## Tech Stack
- NestJS
- PostgreSQL
- Prisma ORM
- JWT Authentication

## Setup

1. Install dependencies
npm install

2. Copy environment file and fill in your values
cp .env.example .env

3. Run database migration
npx prisma migrate dev

4. Start the server
npm run start:dev

## API Endpoints

### Auth
- `POST /auth/register` — Create a new user
- `POST /auth/login` — Login and get JWT token

### Users
- `GET /users/me` — Get current user (requires JWT token)

## How to use JWT token
After login, add the token to your request header:
Authorization: Bearer YOUR_TOKEN_HERE