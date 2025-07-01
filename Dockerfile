# 1. Build React frontend
FROM node:18 AS client-build
WORKDIR /app/client
COPY client/package.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# 2. Build backend and serve frontend build
FROM node:18
WORKDIR /app

# Copy backend files
COPY package.json ./
RUN npm install

# Copy backend source
COPY . .

# Copy React build from previous stage
COPY --from=client-build /app/client/build ./client/build

# Create uploads directory
RUN mkdir -p uploads
RUN mkdir -p uploads/assets

# Expose port
EXPOSE 5000

# Start server
CMD ["node", "server.js"] 