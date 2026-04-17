#!/bin/bash
set -e

SERVER_IP="${1:-localhost}"
export NEXT_PUBLIC_API_URL="http://${SERVER_IP}/api"

echo "Deploying ecommerce site..."
echo "  Server IP: ${SERVER_IP}"
echo "  API URL:   ${NEXT_PUBLIC_API_URL}"

docker compose up -d --build

echo ""
echo "Waiting for services to become healthy..."
sleep 10

# Check health
for service in backend frontend; do
    if docker compose ps "$service" | grep -q "healthy"; then
        echo "  $service: healthy"
    else
        echo "  $service: waiting..."
    fi
done

echo ""
echo "Access the application:"
echo "  Frontend: http://${SERVER_IP}"
echo "  API Docs: http://${SERVER_IP}/docs"
echo "  API:      ${NEXT_PUBLIC_API_URL}"
