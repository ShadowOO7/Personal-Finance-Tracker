FROM node:18-slim

WORKDIR /app

# Install system deps for pdf parsing (none required) and for building client
RUN apt-get update && apt-get install -y build-essential python3 make && rm -rf /var/lib/apt/lists/*

# copy backend package.json and install dependencies
COPY backend/package.json backend/package-lock.json* ./
RUN npm install --production

# copy backend source
COPY backend/ ./

# copy client and build it
WORKDIR /app/client
COPY client/package.json client/package-lock.json* ./ 
RUN npm install
COPY client/ ./
RUN npm run build

# back to app
WORKDIR /app
EXPOSE 3000
CMD ["node", "server.js"]
