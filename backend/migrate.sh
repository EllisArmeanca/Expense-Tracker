#!/bin/bash

case "$1" in
  "up")
    npx sequelize-cli db:migrate
    ;;
  "create")
    if [ -z "$2" ]; then
      echo "Usage: $0 create <migration-name>"
      exit 1
    fi
    npx sequelize-cli migration:generate --name "$2"
    ;;
  *)
    echo "Usage: $0 {up|create <migration-name>}"
    exit 1
    ;;
esac