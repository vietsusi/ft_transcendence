# Check Docker
Run in terminal:
docker --version
docker-compose version

# Install Docker
1. Linux:
    sudo apt-get install docker-compose

# Running Command
# Build
docker-compose -f ./docker-compose.yml up -d --build

# Remove
docker compose -f ./docker-compose.yml down

# Clean
docker system prune -a -f --volumes

# Check status
docker ps -a

# check log
docker logs mariadb