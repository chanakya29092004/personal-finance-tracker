@echo off

REM Build and run the application locally with Docker Compose

echo 🚀 Building and starting Finance Tracker application...

REM Create .env file if it doesn't exist
if not exist .env (
    echo 📝 Creating .env file from template...
    copy .env.example .env
    echo ⚠️  Please edit .env file with your actual values before running again
    pause
    exit /b 1
)

REM Build and start all services
echo 🔨 Building Docker images...
docker-compose build

echo 🚀 Starting services...
docker-compose up -d

echo ⏳ Waiting for services to be ready...
timeout /t 30 /nobreak > nul

REM Check if services are running
echo 🔍 Checking service health...
curl -f http://localhost:5000/api/health > nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Backend is running at http://localhost:5000
) else (
    echo ❌ Backend health check failed
)

curl -f http://localhost > nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Frontend is running at http://localhost
) else (
    echo ❌ Frontend health check failed
)

echo 📊 Application Status:
docker-compose ps

echo.
echo 🎉 Finance Tracker is ready!
echo Frontend: http://localhost
echo Backend API: http://localhost:5000/api
echo.
echo To stop the application, run: docker-compose down
echo To view logs, run: docker-compose logs -f

pause
