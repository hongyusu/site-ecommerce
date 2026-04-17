#!/bin/bash
set -e

echo "Waiting for PostgreSQL..."

# Parse DATABASE_URL: postgresql://user:pass@host:port/dbname
DB_HOST=$(echo "$DATABASE_URL" | sed -E 's|.*@([^:]+):([0-9]+)/.*|\1|')
DB_PORT=$(echo "$DATABASE_URL" | sed -E 's|.*@([^:]+):([0-9]+)/.*|\2|')

until pg_isready -h "$DB_HOST" -p "$DB_PORT" -q; do
    echo "PostgreSQL not ready, retrying in 2s..."
    sleep 2
done

echo "PostgreSQL is ready."

# Check if database has data (users table)
TABLE_EXISTS=$(python -c "
from sqlalchemy import create_engine, text, inspect
import os
engine = create_engine(os.environ['DATABASE_URL'])
with engine.connect() as conn:
    insp = inspect(engine)
    if 'user' in insp.get_table_names():
        result = conn.execute(text('SELECT COUNT(*) FROM \"user\"'))
        print(result.scalar())
    else:
        print('0')
" 2>/dev/null || echo "0")

if [ "$TABLE_EXISTS" = "0" ] || [ -z "$TABLE_EXISTS" ]; then
    echo "Running database migrations..."
    PYTHONPATH=/app alembic upgrade head

    echo "Seeding demo data..."
    PYTHONPATH=/app python scripts/seed_data.py || echo "Warning: seed script failed (non-fatal)"
else
    echo "Database already initialized ($TABLE_EXISTS users found), running migrations..."
    PYTHONPATH=/app alembic upgrade head
fi

echo "Starting application..."
exec "$@"
