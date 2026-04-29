@echo off
echo 🚀 Starting Digital Psychological Intervention System...
echo.

echo 📦 Installing dependencies...
call npm run install-all
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo 🔧 Setting up environment...
node setup.js

echo.
echo 🗄️ Starting MongoDB...
echo Please make sure MongoDB is running on your system
echo You can start it with: net start MongoDB (Windows) or brew services start mongodb-community (macOS)

echo.
echo 🌐 Starting the application...
echo Frontend will be available at: http://localhost:3000
echo Backend API will be available at: http://localhost:5000
echo.

call npm run dev
