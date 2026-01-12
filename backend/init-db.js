#!/usr/bin/env node

import { sequelize } from './config/database.cjs';

async function initDatabase() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    console.log('Running migrations...');
    await sequelize.sync(); // This will create tables if they don't exist
    console.log('Database initialized successfully.');

    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

// Run initialization if this file is executed directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  initDatabase();
}
