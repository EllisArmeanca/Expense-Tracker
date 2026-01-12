# Multi-stage build: build stage
FROM node:20 AS build

# Set the working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine

# Install a simple web server to serve static files
RUN npm install -g serve

# Set the working directory
WORKDIR /app

# Copy the build output from the previous stage
COPY --from=build /app/dist ./dist

# Expose the port
EXPOSE 3000

# Serve the application
CMD ["serve", "-s", "dist", "-l", "3000"]