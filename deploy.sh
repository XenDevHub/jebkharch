#!/bin/bash
set -e

echo "=== Jeb Kharch Automated Production Deployment Script ==="

# 1. Check for Docker
echo "Checking for Docker..."
if ! [ -x "$(command -v docker)" ]; then
  echo "Installing Docker..."
  sudo apt-get update
  sudo apt-get install -y apt-transport-https ca-certificates curl software-properties-common
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
  sudo apt-get update
  sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
fi

# Detect docker compose command (v2 plugin vs v1 standalone)
if docker compose version &>/dev/null 2>&1; then
  DC="docker compose"
elif command -v docker-compose &>/dev/null; then
  DC="docker-compose"
else
  echo "❌ Neither 'docker compose' nor 'docker-compose' found. Please install Docker Compose."
  exit 1
fi
echo "Using: $DC"

# 2. Check for .env.prod
if [ ! -f .env.prod ]; then
  echo "Error: .env.prod file not found. Creating a template..."
  cp .env.example .env.prod
  echo "Please edit the .env.prod file with your production secrets, then rerun this script."
  exit 1
fi

# 3. Build & Start containers
# NOTE: Migrations run automatically inside the api container on startup (prisma migrate deploy)
echo "Building and starting containers..."
$DC -f docker-compose.prod.yml --env-file .env.prod up --build -d

# 4. Wait for API container to be healthy (migrations complete)
echo "Waiting for API to finish migrations..."
for i in $(seq 1 30); do
  STATUS=$(docker inspect --format='{{.State.Status}}' jebkharch_api_prod 2>/dev/null || echo "not_found")
  if [ "$STATUS" = "running" ]; then
    # Check if app is responding
    if docker exec jebkharch_api_prod sh -c "nc -z localhost 3000" 2>/dev/null; then
      echo "✅ API is up and running."
      break
    fi
  elif [ "$STATUS" = "exited" ]; then
    echo "❌ API container exited unexpectedly. Showing logs:"
    docker logs jebkharch_api_prod --tail 50
    exit 1
  fi
  echo "  → Waiting... ($i/30)"
  sleep 3
done

# 5. Run database seed (idempotent — upsert safe to run multiple times)
echo "Running database seed..."
docker exec jebkharch_api_prod sh -c "cd /app/apps/api && npx ts-node --transpileOnly prisma/seed.ts" || \
  echo "⚠️  Seed skipped or already done."

echo ""
echo "=== Deployment Successful! ==="
echo "Backend is running at http://localhost:3000"
