# E-commerce Backend

FastAPI-based backend for the e-commerce platform.

## Prerequisites

- Python 3.12.8 (via pyenv)
- Poetry (package manager)
- PostgreSQL 15
- Redis 7

## Setup (Phase 1: Local Terminal Development)

### 1. Install Dependencies

```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
poetry install
```

### 2. Configure Environment

```bash
# .env.dev is already created with default values
# Modify if needed for your local setup
```

### 3. Start PostgreSQL and Redis

```bash
# macOS (with Homebrew)
brew services start postgresql@15
brew services start redis

# Linux
sudo systemctl start postgresql
sudo systemctl start redis
```

### 4. Create Database

```bash
# Create the development database
createdb ecommerce_dev
```

### 5. Run Database Migrations

```bash
# Generate initial migration
poetry run alembic revision --autogenerate -m "Initial migration"

# Apply migrations
poetry run alembic upgrade head
```

### 6. Load Demo Data

```bash
# Populate database with demo users
poetry run python scripts/seed_data.py
```

Demo users created:
- Admin: `admin@example.com` / `admin123`
- Customer 1-5: `customer1@example.com` - `customer5@example.com` / `password123`

### 7. Start Backend Server

```bash
# Start with hot reload
poetry run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at:
- API: http://localhost:8000
- API Docs (Swagger): http://localhost:8000/docs
- API Docs (ReDoc): http://localhost:8000/redoc

## Development Commands

```bash
# Run tests
poetry run pytest

# Type checking
poetry run mypy .

# Linting
poetry run ruff check .

# Format code
poetry run black .

# Create new migration
poetry run alembic revision --autogenerate -m "description"

# Apply migrations
poetry run alembic upgrade head

# Rollback migration
poetry run alembic downgrade -1

# Start Celery worker (for background tasks)
poetry run celery -A app.celery_app worker --loglevel=info
```

## Database Access

```bash
# PostgreSQL shell
psql ecommerce_dev

# Redis CLI
redis-cli
```

## Project Structure

```
backend/
├── alembic/              # Database migrations
│   ├── versions/         # Migration files
│   └── env.py            # Alembic environment
├── app/
│   ├── api/
│   │   └── v1/
│   │       └── endpoints/  # API route handlers
│   ├── core/
│   │   ├── config.py       # Settings management
│   │   └── database.py     # Database connection
│   ├── models/             # SQLAlchemy models
│   ├── schemas/            # Pydantic schemas
│   ├── services/           # Business logic
│   ├── utils/              # Utility functions
│   └── main.py             # FastAPI app entry point
├── scripts/
│   └── seed_data.py        # Demo data seeding
├── tests/                  # Test files
├── .env.dev                # Environment variables
├── alembic.ini             # Alembic configuration
├── pyproject.toml          # Poetry dependencies
└── README.md               # This file
```

## API Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Troubleshooting

### Database connection error

```bash
# Check if PostgreSQL is running
brew services list | grep postgresql

# Check connection
psql -h localhost -U postgres -d ecommerce_dev
```

### Redis connection error

```bash
# Check if Redis is running
brew services list | grep redis

# Test connection
redis-cli ping
```

### Migration errors

```bash
# Drop database and recreate (WARNING: Destroys all data)
dropdb ecommerce_dev
createdb ecommerce_dev
poetry run alembic upgrade head
```
