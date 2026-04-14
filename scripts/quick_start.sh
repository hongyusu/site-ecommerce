#!/bin/bash

# Quick start script for Phase 1 development
# Starts PostgreSQL, Redis, initializes database, and provides instructions

set -e

echo "=== E-commerce Platform Quick Start (Phase 1) ==="
echo ""

# Start PostgreSQL
echo "Starting PostgreSQL..."
if command -v brew &> /dev/null; then
    brew services start postgresql@15 > /dev/null 2>&1 || true
    echo "✓ PostgreSQL started"
elif command -v systemctl &> /dev/null; then
    sudo systemctl start postgresql > /dev/null 2>&1 || true
    echo "✓ PostgreSQL started"
else
    echo "⚠️  Please start PostgreSQL manually"
fi

# Start Redis
echo "Starting Redis..."
if command -v brew &> /dev/null; then
    brew services start redis > /dev/null 2>&1 || true
    echo "✓ Redis started"
elif command -v systemctl &> /dev/null; then
    sudo systemctl start redis > /dev/null 2>&1 || true
    echo "✓ Redis started"
else
    echo "⚠️  Please start Redis manually"
fi

echo ""

# Wait for services to start
echo "Waiting for services to initialize..."
sleep 3

# Initialize database
echo ""
echo "Initializing database..."
./scripts/init_db.sh

echo ""
echo "=== Setup Complete ==="
echo ""
echo "📋 Next steps:"
echo ""
echo "Terminal 1 - Start Backend:"
echo "  cd backend"
echo "  poetry run uvicorn app.main:app --reload"
echo ""
echo "Terminal 2 - Start Frontend:"
echo "  cd frontend"
echo "  npm run dev"
echo ""
echo "Then open http://localhost:3000 in your browser"
echo ""
echo "Demo accounts:"
echo "  Admin: admin@example.com / admin123"
echo "  Customer: customer1@example.com / password123"
echo ""
