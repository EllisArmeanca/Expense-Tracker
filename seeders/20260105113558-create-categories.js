// seeders/YYYYMMDDHHmmss-create-categories.js
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const categories = [
      {
        name: 'Food',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Transport',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Entertainment',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Rent',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Utilities',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await queryInterface.bulkInsert('Categories', categories, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Categories', null, {});
  }
};