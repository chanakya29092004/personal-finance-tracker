@echo off
REM Personal Finance Tracker Setup Script for Windows

echo 🚀 Setting up Personal Finance Tracker...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js (v14 or higher) and try again.
    pause
    exit /b 1
)

echo ✅ Node.js found
node --version

REM Check if MongoDB is installed
mongod --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  MongoDB not found locally. Make sure to:
    echo    1. Install MongoDB locally, or
    echo    2. Update MONGODB_URI in server/.env to use MongoDB Atlas
)

REM Install dependencies
echo 📦 Installing dependencies...

echo Installing root dependencies...
call npm install

echo Installing client dependencies...
cd client
call npm install

echo Installing server dependencies...
cd ..\server
call npm install
cd ..

REM Create environment files if they don't exist
if not exist "server\.env" (
    echo 📝 Creating server environment file...
    (
        echo PORT=5000
        echo MONGODB_URI=mongodb://localhost:27017/personal-finance-tracker
        echo JWT_SECRET=your_jwt_secret_key_here_change_in_production
        echo NODE_ENV=development
    ) > server\.env
    echo ✅ Created server/.env
) else (
    echo ⚠️  server/.env already exists
)

if not exist "client\.env" (
    echo 📝 Creating client environment file...
    echo REACT_APP_API_URL=http://localhost:5000/api > client\.env
    echo ✅ Created client/.env
) else (
    echo ⚠️  client/.env already exists
)

echo.
echo 🎉 Setup complete!
echo.
echo To start the application:
echo   npm run dev         # Runs both frontend and backend
echo   npm run client      # Runs only frontend (port 3000)
echo   npm run server      # Runs only backend (port 5000)
echo.
echo Make sure MongoDB is running before starting the backend!
echo.
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:5000
echo.
pause
