#!/bin/bash

# Build and run the application locally with Docker Compose

echo "🚀 Building and starting Finance Tracker application..."

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your actual values before running again"
    exit 1
fi

# Build and start all services
echo "🔨 Building Docker images..."
docker-compose build

echo "🚀 Starting services..."
docker-compose up -d

echo "⏳ Waiting for services to be ready..."
sleep 30

# Check if services are running
echo "🔍 Checking service health..."
if curl -f http://localhost:5000/api/health > /dev/null 2>&1; then
    echo "✅ Backend is running at http://localhost:5000"
else
    echo "❌ Backend health check failed"
fi

if curl -f http://localhost > /dev/null 2>&1; then
    echo "✅ Frontend is running at http://localhost"
else
    echo "❌ Frontend health check failed"
fi

echo "📊 Application Status:"
docker-compose ps

echo ""
echo "🎉 Finance Tracker is ready!"
echo "Frontend: http://localhost"
echo "Backend API: http://localhost:5000/api"
echo ""
echo "To stop the application, run: docker-compose down"
echo "To view logs, run: docker-compose logs -f"
