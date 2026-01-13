#!/bin/bash

echo "Expense Tracker - Development Environment Setup"
echo "=============================================="

if [ "$1" == "dev" ]; then
  echo "Starting development environment..."
  cd /home/theo/Documents/an3/node/Expense-Tracker
  docker-compose -f docker-compose.dev.yml up
elif [ "$1" == "prod" ]; then
  echo "Starting production environment..."
  cd /home/theo/Documents/an3/node/Expense-Tracker
  docker-compose -f docker-compose.prod.yml up --build
else
  echo "Usage: $0 [dev|prod]"
  echo "  dev  - Start development environment"
  echo "  prod - Start production environment"
fi

