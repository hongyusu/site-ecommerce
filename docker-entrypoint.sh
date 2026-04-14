#!/bin/bash
set -e

PG_DATA="/var/lib/postgresql/15/main"
PG_CONF="/etc/postgresql/15/main/postgresql.conf"
PG_HBA="/etc/postgresql/15/main/pg_hba.conf"
PG_BIN="/usr/lib/postgresql/15/bin"

# ---- Create log directory ----
mkdir -p /var/log/supervisor

# ---- Configure PostgreSQL auth (trust for all local connections) ----
cat > "$PG_HBA" <<'HBAEOF'
local   all   all                 trust
host    all   all   127.0.0.1/32  trust
host    all   all   ::1/128       trust
HBAEOF

# Ensure correct ownership
chown -R postgres:postgres "$PG_DATA"
chown -R postgres:postgres /etc/postgresql/15/main
mkdir -p /var/run/postgresql
chown postgres:postgres /var/run/postgresql

# ---- Initialize Redis data dir ----
mkdir -p /var/lib/redis
chown redis:redis /var/lib/redis 2>/dev/null || true

# ---- Start PostgreSQL temporarily to run migrations ----
echo "Starting PostgreSQL for migrations..."
su - postgres -c "$PG_BIN/pg_ctl -D $PG_DATA -o '-c config_file=$PG_CONF' -l /tmp/pg_init.log start -w"

# Wait for PostgreSQL to be ready
for i in $(seq 1 30); do
    if su - postgres -c "$PG_BIN/pg_isready -q" 2>/dev/null; then
        echo "PostgreSQL is ready."
        break
    fi
    sleep 1
done

# Create database if it doesn't exist
su - postgres -c "psql -tc \"SELECT 1 FROM pg_database WHERE datname = 'ecommerce_dev'\" | grep -q 1" \
    || su - postgres -c "createdb ecommerce_dev"

# Run Alembic migrations
echo "Running database migrations..."
cd /app/backend
export DATABASE_URL="postgresql://postgres@localhost:5432/ecommerce_dev"
export REDIS_URL="redis://localhost:6379/0"
export JWT_SECRET="dev-secret-key-change-in-production"
export ENVIRONMENT="development"
export CORS_ORIGINS="http://localhost:3000,http://localhost"
export PYTHONPATH="/app/backend"
python3 -m alembic upgrade head

# Seed data if DB is empty (check user count via psql)
USER_COUNT=$(su - postgres -c "psql -At -d ecommerce_dev -c 'SELECT COUNT(*) FROM \"user\"'" 2>/dev/null || echo "0")
if [ "$USER_COUNT" = "0" ] || [ -z "$USER_COUNT" ]; then
    echo "Seeding demo data..."
    python3 scripts/seed_data.py || echo "Warning: seed script failed (non-fatal)"
fi

# Stop the temporary PostgreSQL (supervisor will start it properly)
echo "Stopping temporary PostgreSQL..."
su - postgres -c "$PG_BIN/pg_ctl -D $PG_DATA stop -w"

echo "Initialization complete. Starting all services..."

# ---- Hand off to supervisor ----
exec "$@"
