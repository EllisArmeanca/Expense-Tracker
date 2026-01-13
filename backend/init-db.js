#!/usr/bin/env node

import { sequelize } from './config/database.js';
import winston from 'winston';

// Configure Winston logger for this script
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'expense-tracker-backend', module: 'init-db-script' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    ...(process.env.NODE_ENV === 'production'
      ? [
          new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
          new winston.transports.File({ filename: 'logs/combined.log' })
        ]
      : []
    )
  ]
});

async function initDatabase() {
  try {
    logger.info('Connecting to database...');
    await sequelize.authenticate();
    logger.info('Database connection established successfully.');

    logger.info('Synchronizing database models...');
    await sequelize.sync({ force: false }); // This will create tables if they don't exist
    logger.info('Database synchronized successfully.');

    process.exit(0);
  } catch (error) {
    logger.error('Error initializing database:', { error: error.message });
    process.exit(1);
  }
}

// Run initialization if this file is executed directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  initDatabase();
}
