#!/bin/bash

echo "🚀 Starting Digital Psychological Intervention System..."
echo

echo "📦 Installing dependencies..."
npm run install-all
if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo
echo "🔧 Setting up environment..."
node setup.js

echo
echo "🗄️ Starting MongoDB..."
echo "Please make sure MongoDB is running on your system"
echo "You can start it with: brew services start mongodb-community (macOS) or sudo systemctl start mongod (Linux)"

echo
echo "🌐 Starting the application..."
echo "Frontend will be available at: http://localhost:3000"
echo "Backend API will be available at: http://localhost:5000"
echo

npm run dev
