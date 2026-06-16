#!/bin/bash
echo ""
echo "⚖  NyayaTrack Setup"
echo "===================="
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
  echo "❌ Node.js not found. Please install Node.js 16+ from https://nodejs.org"
  exit 1
fi
echo "✅ Node.js $(node -v) found"

# Check MongoDB
if ! command -v mongod &> /dev/null; then
  echo "⚠️  MongoDB not found locally."
  echo "   Install MongoDB Community: https://www.mongodb.com/try/download/community"
  echo "   OR update MONGO_URI in backend/.env to use MongoDB Atlas (free cloud)"
fi

# Install dependencies
echo ""
echo "📦 Installing backend dependencies..."
cd backend && npm install
cd ..

echo ""
echo "📦 Installing frontend dependencies..."
cd frontend && npm install
cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "🚀 To start NyayaTrack:"
echo "   Terminal 1: cd backend && npm run dev"
echo "   Terminal 2: cd frontend && npm start"
echo ""
echo "   Backend  → http://localhost:5020"
echo "   Frontend → http://localhost:3010"
echo ""
