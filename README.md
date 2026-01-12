# Expense Tracker - Docker Setup

This project is configured to run using Docker containers for both development and production environments.

## Prerequisites

- Docker Engine
- Docker Compose

## Development Environment

To start the development environment with hot reloading:

```bash
docker-compose -f docker-compose.dev.yml up --build
```

Or use the convenience script:

```bash
./run.sh dev
```

Services will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:4000
- GraphQL: http://localhost:4000/graphql
- Database: localhost:5432

## Production Environment

To start the production environment:

```bash
docker-compose -f docker-compose.prod.yml up --build
```

Or use the convenience script:

```bash
./run.sh prod
```

Services will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:4000

## Service Structure

### Development:
- **PostgreSQL**: Database server
- **Backend**: Node.js/Express server with Sequelize ORM (port 4000)
- **Frontend**: Vite development server (port 5173)

### Production:
- **PostgreSQL**: Database server
- **Backend**: Node.js/Express server with Sequelize ORM (port 4000)
- **Frontend**: Static file server serving built frontend (port 3000)

## Environment Variables

Environment variables are configured in:
- `backend/.env` - Backend configuration
- `frontend/.env` - Frontend configuration

## Development Notes

- The development setup features live reload for both frontend and backend
- Frontend source code is mounted as a volume for immediate changes
- Backend code changes trigger server restarts via nodemon
- Database migrations run automatically when the backend starts

## Troubleshooting

- If you encounter issues with node_modules, remove the volume and restart: `docker-compose -f docker-compose.dev.yml down -v`
- Make sure ports 3000, 4000, 5173, and 5432 are available