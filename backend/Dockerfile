# Use Node.js 20 as base image
FROM node:20

# Set working dir inside container
WORKDIR /app

# Copy package files first for better layer caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the source
COPY . .

# Generate the Prisma client
RUN npx prisma generate

# Expose the backend port
EXPOSE 5000

# Apply migrations, seed demo data, then start in dev mode
CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma db seed && npm run start:dev"]
