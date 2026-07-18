#!/bin/bash
set -e

echo "=== Jeb Kharch Automated Production Deployment Script ==="

# 1. Update & Install Dependencies
echo "Checking for Docker..."
if ! [ -x "$(command -v docker)" ]; then
  echo "Installing Docker..."
  sudo apt-get update
  sudo apt-get install -y apt-transport-https ca-certificates curl software-properties-common
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
  sudo apt-get update
  sudo apt-get install -y docker-ce docker-ce-cli containerd.io
fi

echo "Checking for Docker Compose..."
if ! [ -x "$(command -v docker-compose)" ]; then
  echo "Installing Docker Compose..."
  sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
  sudo chmod +x /usr/local/bin/docker-compose
fi

# 2. Check for .env file
if [ ! -f .env.prod ]; then
  echo "Error: .env.prod file not found. Creating a template..."
  cp .env.example .env.prod
  echo "Please edit the .env.prod file with your production secrets, then rerun this script."
  exit 1
fi

# 3. Pull/Build and Run docker-compose
echo "Building and starting containers..."
docker-compose -f docker-compose.prod.yml --env-file .env.prod up --build -d


# 4. Run Prisma Database Migrations and Seeding
echo "Running database migrations inside container..."
docker-compose -f docker-compose.prod.yml exec -T api pnpm --filter @jebkharch/api prisma:migrate
docker-compose -f docker-compose.prod.yml exec -T api pnpm --filter @jebkharch/api prisma:seed

echo "=== Deployment Successful! ==="
echo "Backend is running at http://localhost:3000"
