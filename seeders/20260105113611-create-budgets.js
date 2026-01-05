// seeders/YYYYMMDDHHmmss-create-budgets.js
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const budgets = [
      {
        name: 'Monthly Budget',
        amount: 1000.00,
        startDate: '2026-01-01',
        endDate: '2026-01-31',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Vacation Budget',
        amount: 500.00,
        startDate: '2026-07-01',
        endDate: '2026-07-31',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await queryInterface.bulkInsert('Budgets', budgets, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Budgets', null, {});
  }
};