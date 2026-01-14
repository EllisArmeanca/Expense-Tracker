#!/bin/sh

# Expense Tracker Demo Deployment Script for Alpine Linux
# This script will set up a self-hosted demo of the Expense Tracker application

set -e  # Exit on any error

echo "=================================================="
echo "Expense Tracker Demo Deployment Script"
echo "=================================================="

# Install dependencies
echo "Installing required packages..."
apk add --no-cache docker docker-compose

# Enable and start Docker
echo "Enabling and starting Docker..."
rc-update add docker boot
service docker start

# Wait for Docker daemon to start
sleep 5

# Use the current directory as the app directory
APP_DIR="$(pwd)"
echo "Using current directory as app directory: $APP_DIR"
cd $APP_DIR

# Create environment files with demo configuration
echo "Setting up environment files..."

# Create backend .env if it doesn't exist
if [ ! -f $APP_DIR/backend/.env ]; then
    cat > $APP_DIR/backend/.env << 'EOF'
NODE_ENV=production
PORT=4000
DATABASE_URL=postgresql://postgres:password@postgres:5432/expensetracker
DB_HOST=postgres
DB_PORT=5432
DB_NAME=expensetracker
DB_USER=postgres
DB_PASSWORD=password
JWT_SECRET=supersecretexpensetrackerdemokeychangeme
JWT_EXPIRES_IN=7d
LOG_LEVEL=info
EOF
fi

# Create frontend .env if it doesn't exist
if [ ! -f $APP_DIR/frontend/.env ]; then
    cat > $APP_DIR/frontend/.env << 'EOF'
VITE_API_URL=http://localhost:4000
EOF
fi

# Create or update docker-compose.prod.yml with production configuration
cat > $APP_DIR/docker-compose.prod.yml << 'EOF'
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    restart: unless-stopped
    environment:
      POSTGRES_DB: expensetracker
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data_prod:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    restart: unless-stopped
    ports:
      - "4000:4000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@postgres:5432/expensetracker
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_NAME=expensetracker
      - DB_USER=postgres
      - DB_PASSWORD=password
      - JWT_SECRET=supersecretexpensetrackerdemokeychangeme
      - JWT_EXPIRES_IN=7d
    depends_on:
      postgres:
        condition: service_healthy
    volumes:
      - ./backend/logs:/app/logs

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    restart: unless-stopped
    ports:
      - "5173:80"  # Expose frontend on port 5173
    environment:
      - VITE_API_URL=http://localhost:4000
    depends_on:
      - backend

volumes:
  postgres_data_prod:
EOF

echo "Building and starting containers..."
cd $APP_DIR
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d

# Wait for containers to start
echo "Waiting for containers to start..."
sleep 30

echo "=================================================="
echo "Deployment Complete!"
echo "=================================================="
echo ""
echo "Application is now running!"
echo "Backend: http://localhost:4000"
echo "Frontend: http://localhost:5173"
echo ""
echo "To view container status:"
echo "  docker-compose -f docker-compose.prod.yml ps"
echo ""
echo "To stop the demo:"
echo "  docker-compose -f docker-compose.prod.yml down"
echo ""
echo "Demo credentials (change these for production!):"
echo "  Admin User: admin@admin.admin"
echo "  Admin Password: admin123"
echo "  Demo User: example.example@example.com"
echo "  Demo Password: Password123!"
echo ""
echo "=================================================="

# Print current status
docker-compose -f docker-compose.prod.yml ps