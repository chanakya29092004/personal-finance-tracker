#!/bin/bash

# Personal Finance Tracker Setup Script

echo "🚀 Setting up Personal Finance Tracker..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js (v14 or higher) and try again."
    exit 1
fi

echo "✅ Node.js found: $(node --version)"

# Check if MongoDB is running
if ! command -v mongod &> /dev/null; then
    echo "⚠️  MongoDB not found locally. Make sure to:"
    echo "   1. Install MongoDB locally, or"
    echo "   2. Update MONGODB_URI in server/.env to use MongoDB Atlas"
fi

# Install dependencies
echo "📦 Installing dependencies..."

echo "Installing root dependencies..."
npm install

echo "Installing client dependencies..."
cd client && npm install

echo "Installing server dependencies..."
cd ../server && npm install && cd ..

# Create environment files if they don't exist
if [ ! -f server/.env ]; then
    echo "📝 Creating server environment file..."
    cat > server/.env << EOL
PORT=5000
MONGODB_URI=mongodb://localhost:27017/personal-finance-tracker
JWT_SECRET=$(openssl rand -base64 32)
NODE_ENV=development
EOL
    echo "✅ Created server/.env with random JWT secret"
else
    echo "⚠️  server/.env already exists"
fi

if [ ! -f client/.env ]; then
    echo "📝 Creating client environment file..."
    cat > client/.env << EOL
REACT_APP_API_URL=http://localhost:5000/api
EOL
    echo "✅ Created client/.env"
else
    echo "⚠️  client/.env already exists"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "To start the application:"
echo "  npm run dev         # Runs both frontend and backend"
echo "  npm run client      # Runs only frontend (port 3000)"
echo "  npm run server      # Runs only backend (port 5000)"
echo ""
echo "Make sure MongoDB is running before starting the backend!"
echo ""
echo "Frontend: http://localhost:3000"
echo "Backend:  http://localhost:5000"
