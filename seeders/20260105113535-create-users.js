// seeders/YYYYMMDDHHmmss-create-users.js
'use strict';

const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const generateHash = (plaintextPassword) => bcrypt.hashSync(plaintextPassword, 10);

    const users = [
      {
        username: 'admin',
        password: generateHash('admin123'),
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        username: 'user',
        password: generateHash('user123'),
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await queryInterface.bulkInsert('Users', users, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', null, {});
  }
};