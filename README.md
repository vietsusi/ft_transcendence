# FT_TRANSCENDENCE

Movie & TV Series Recommendation Platform

**Team:** Viet, Lin, An, Jasmin

---

## 🚀 Quick Start

```bash
# Clone and setup
git clone git@github.com:vietsusi/ft_transcendence.git
cd ft_transcendence
git checkout main

# Build and run
docker-compose -f ./docker-compose.yml up -d --build

# Check status
docker ps -a

# Stop services
docker compose -f ./docker-compose.yml down

📁 Project Structure
ft_transcendence/
├── backend/          # NestJS API
├── frontend/         # React + Vite
├── docker-compose.yml
├── Setup.md          # Detailed setup guide
└── README.md

👥 Team Responsibilities
Member  Role
Viet	Frontend Lead (UI/UX, Components)
Lin	    Backend Lead
An	    Backend Lead
Jasmin	Chatbox

🔧 Development Workflow
1. Create feature branch: git checkout -b feature/your-feature
2. Make changes and commit
3. Push to GitHub
4. Create Pull Request
5. Get approval from 3 team members
6. Merge to main

📚 Documentation
Setup Guide: Setup.md
Authentication Flow: Authentication_Flow_Diagram.md

