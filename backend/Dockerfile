# Use Node.js 18 as base image
FROM node:18

# Set working directory inside container
WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the app
RUN npm run build

# Expose backend port
EXPOSE 5000

# Start the app in development mode
CMD ["npm", "run", "start:dev"]