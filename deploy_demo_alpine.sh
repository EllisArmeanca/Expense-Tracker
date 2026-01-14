#!/bin/sh

# Expense Tracker Demo Deployment Script for Alpine Linux
# This script will set up a self-hosted demo of the Expense Tracker application

set -e  # Exit on any error

echo "=================================================="
echo "Expense Tracker Demo Deployment Script"
echo "=================================================="

# Install dependencies
echo "Installing required packages..."
apk add --no-cache git docker docker-compose curl nginx certbot python3 py3-pip certbot-nginx

# Enable and start Docker
echo "Enabling and starting Docker..."
rc-update add docker boot
service docker start

# Wait for Docker daemon to start
sleep 5

# Clone the repository to a production location
APP_DIR="/opt/expense-tracker-demo"
REPO_URL="https://github.com/[YOUR_REPO_ORIGINAL_HERE]/Expense-Tracker.git"  # Replace with actual repo URL

echo "Cloning repository to $APP_DIR..."
if [ -d "$APP_DIR" ]; then
    echo "Directory exists, updating..."
    cd $APP_DIR
    git pull origin main
else
    git clone $REPO_URL $APP_DIR
    cd $APP_DIR
fi

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

# Set up nginx configuration
NGINX_CONF="/etc/nginx/conf.d/expense-tracker.conf"
mkdir -p /var/www/certbot

cat > $NGINX_CONF << 'EOF'
upstream backend {
    server 127.0.0.1:4000;
}

upstream frontend {
    server 127.0.0.1:5173;
}

server {
    listen 80;
    server_name _;

    # Certbot location for SSL certificate renewal
    location /.well-known/acme-challenge {
        root /var/www/certbot;
        try_files $uri =404;
    }

    # Redirect all traffic to HTTPS
    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name _;

    ssl_certificate /etc/ssl/nginx/fullchain.pem;
    ssl_certificate_key /etc/ssl/nginx/privkey.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Main location - serve frontend
    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    # API proxy to backend
    location /api {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /graphql {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /admin/gql {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Create a startup script
STARTUP_SCRIPT="/usr/local/bin/start-expense-tracker"
cat > $STARTUP_SCRIPT << 'EOF'
#!/bin/sh
cd /opt/expense-tracker-demo

# Stop existing containers
docker-compose -f docker-compose.prod.yml down || true

# Start all services
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to be healthy
echo "Waiting for services to start..."
sleep 30

echo "Services started successfully!"
docker-compose -f docker-compose.prod.yml ps
EOF

chmod +x $STARTUP_SCRIPT

# Create systemd service for auto-start
SERVICE_FILE="/etc/init.d/expense-tracker"
cat > $SERVICE_FILE << 'EOF'
#!/sbin/openrc-run

name="expense-tracker"
description="Expense Tracker Demo Service"
start_cmd="start_service"
stop_cmd="stop_service"

start_service() {
    /usr/local/bin/start-expense-tracker
}

stop_service() {
    cd /opt/expense-tracker-demo
    docker-compose -f docker-compose.prod.yml down
}

start_pre() {
    # Ensure Docker daemon is running
    if ! pgrep dockerd >/dev/null; then
        service docker start
        sleep 5
    fi
}
EOF

chmod +x $SERVICE_FILE
rc-update add expense-tracker default

echo "Building and starting containers..."
cd $APP_DIR
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d

# Wait for containers to start
echo "Waiting for containers to start..."
sleep 30

# Create SSL directory
mkdir -p /etc/ssl/nginx

# Just set up basic NGINX with HTTP first, SSL can be configured later
sed -i '/listen 443/d;/ssl_certificate/d;/ssl_certificate_key/d;/^server_name $domain;/!s/^server_name _;/server_name $(hostname -f || hostname -I | awk '\''{print $1}'\'');/;s/https/http/g;/add_header/d' /etc/nginx/conf.d/expense-tracker.conf

# Create a basic HTTP-only version initially
cat > $NGINX_CONF << 'EOF'
upstream backend {
    server 127.0.0.1:4000;
}

upstream frontend {
    server 127.0.0.1:5173;
}

server {
    listen 80;
    server_name _;

    # Main location - serve frontend
    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    # API proxy to backend
    location /api {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /graphql {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /admin/gql {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Restart NGINX
service nginx restart

# Wait for NGINX to start
sleep 5

# Setup cron job for certificate renewal (will run but only take effect when SSL is enabled)
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet --post-hook 'service nginx reload'") | crontab -

echo "=================================================="
echo "Deployment Complete!"
echo "=================================================="
echo ""
echo "Application is now running at http://$(hostname -I | awk '{print $1}')"
echo ""
echo "To start/stop the service manually:"
echo "  start-expense-tracker  # Start the application"
echo "  cd /opt/expense-tracker-demo && docker-compose -f docker-compose.prod.yml up -d  # Alternative start"
echo "  cd /opt/expense-tracker-demo && docker-compose -f docker-compose.prod.yml down  # Stop"
echo ""
echo "To enable HTTPS with Let's Encrypt, run:"
echo "  certbot --nginx -d your-domain.com"
echo ""
echo "The service is configured to auto-start on boot."
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