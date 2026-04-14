#!/bin/bash

# Initialize database for e-commerce platform
# This script creates the database, runs migrations, and seeds demo data

set -e

echo "=== E-commerce Database Initialization ==="
echo ""

# Check if PostgreSQL is running
if ! pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
    echo "❌ PostgreSQL is not running on localhost:5432"
    echo "Please start PostgreSQL first:"
    echo "  macOS: brew services start postgresql@15"
    echo "  Linux: sudo systemctl start postgresql"
    exit 1
fi

echo "✓ PostgreSQL is running"

# Check if Redis is running
if ! redis-cli ping > /dev/null 2>&1; then
    echo "⚠️  Warning: Redis is not running on localhost:6379"
    echo "Redis is optional for initial setup but required for full functionality"
    echo "  macOS: brew services start redis"
    echo "  Linux: sudo systemctl start redis"
else
    echo "✓ Redis is running"
fi

echo ""

# Create database if it doesn't exist
if psql -lqt | cut -d \| -f 1 | grep -qw ecommerce_dev; then
    echo "✓ Database 'ecommerce_dev' already exists"
else
    echo "Creating database 'ecommerce_dev'..."
    createdb ecommerce_dev
    echo "✓ Database created"
fi

echo ""

# Navigate to backend directory
cd "$(dirname "$0")/../backend"

# Check if Poetry is installed
if ! command -v poetry &> /dev/null; then
    echo "❌ Poetry is not installed"
    echo "Install Poetry: curl -sSL https://install.python-poetry.org | python3 -"
    exit 1
fi

echo "✓ Poetry is installed"
echo ""

# Install dependencies
echo "Installing Python dependencies..."
poetry install
echo "✓ Dependencies installed"
echo ""

# Run migrations
echo "Running database migrations..."
poetry run alembic upgrade head
echo "✓ Migrations applied"
echo ""

# Seed demo data
echo "Loading demo data..."
poetry run python scripts/seed_data.py
echo ""

echo "=== Database initialization completed successfully ==="
echo ""
echo "Demo accounts created:"
echo "  Admin: admin@example.com / admin123"
echo "  Customer 1-5: customer1@example.com / password123"
echo ""
echo "You can now start the backend:"
echo "  cd backend"
echo "  poetry run uvicorn app.main:app --reload"
echo ""
