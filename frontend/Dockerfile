#Use Node.js 18 as base image
FROM node:18

#Set working dir inside container
WORKDIR /app

#Copy package files first
COPY package*.json ./

#Install dependencies
RUN npm install

#Copy all source code
COPY . .

#Build the app
RUN npm run build

#Install serve
RUN npm install -g serve

#Expose port 5173
EXPOSE 5173

#start the app in the dev mode
CMD [ "npm", "run", "dev", "--", "--host", "0.0.0.0" ]