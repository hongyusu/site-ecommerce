#!/bin/bash

# Health check script for e-commerce platform
# Checks if all required services are running

echo "=== E-commerce Platform Health Check ==="
echo ""

ALL_OK=true

# Check PostgreSQL
echo -n "PostgreSQL (localhost:5432): "
if pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
    echo "✓ Running"
else
    echo "❌ Not running"
    ALL_OK=false
fi

# Check Redis
echo -n "Redis (localhost:6379): "
if redis-cli ping > /dev/null 2>&1; then
    echo "✓ Running"
else
    echo "❌ Not running"
    ALL_OK=false
fi

# Check Backend
echo -n "Backend API (localhost:8000): "
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo "✓ Running"
else
    echo "❌ Not running"
    ALL_OK=false
fi

# Check Frontend
echo -n "Frontend (localhost:3000): "
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "✓ Running"
else
    echo "❌ Not running"
    ALL_OK=false
fi

echo ""

if [ "$ALL_OK" = true ]; then
    echo "=== All services are healthy ==="
    echo ""
    echo "Access points:"
    echo "  Frontend: http://localhost:3000"
    echo "  Backend API: http://localhost:8000"
    echo "  API Docs: http://localhost:8000/docs"
    exit 0
else
    echo "=== Some services are not running ==="
    echo ""
    echo "Start services:"
    echo "  PostgreSQL: brew services start postgresql@15"
    echo "  Redis: brew services start redis"
    echo "  Backend: cd backend && poetry run uvicorn app.main:app --reload"
    echo "  Frontend: cd frontend && npm run dev"
    exit 1
fi
