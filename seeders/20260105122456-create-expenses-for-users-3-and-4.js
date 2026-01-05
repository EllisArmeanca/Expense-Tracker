// seeders/YYYYMMDDHHmmss-create-expenses-for-users-3-and-4.js
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const expenses = [
      // User 3 (admin)
      {
        userId: 3,
        categoryId: 1, // Food
        description: 'Pizza',
        amount: 45.5,
        date: '2026-01-05',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        userId: 3,
        categoryId: 2, // Transport
        description: 'Taxi',
        amount: 15.0,
        date: '2026-01-05',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // User 4 (user)
      {
        userId: 4,
        categoryId: 1, // Food
        description: 'Burger',
        amount: 25.0,
        date: '2026-01-05',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        userId: 4,
        categoryId: 3, // Entertainment
        description: 'Cinema',
        amount: 30.0,
        date: '2026-01-05',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await queryInterface.bulkInsert('Expenses', expenses, {});
    console.log('✅ Added expenses for users 3 and 4');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Expenses', {
      userId: [3, 4]
    }, {});
  }
};