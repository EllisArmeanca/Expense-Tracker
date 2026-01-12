const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// Import models to ensure associations are set up (we'll do this asynchronously)
// Note: We can't use ES module imports in a CommonJS file
// So this will need to be handled differently

module.exports = { sequelize };
