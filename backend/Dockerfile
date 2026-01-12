# Use the official Node.js runtime as the base image
FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Install PostgreSQL client dependencies (needed for sequelize)
RUN apk add --no-cache postgresql-client

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 4000

# Run migrations before starting the application
CMD ["sh", "-c", "npx sequelize-cli db:migrate && npm start"]