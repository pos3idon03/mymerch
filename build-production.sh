#!/bin/bash

echo "🚀 Building MyMerch for Production..."

# Build React app for production
echo "📦 Building React app..."
cd client
npm run build
cd ..

# Build Docker container
echo "🐳 Building Docker container..."
docker-compose build

echo "✅ Production build complete!"
echo "🚀 To run: docker-compose up"
echo "🌐 Your app will be available at http://localhost:5000"
