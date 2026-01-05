// seeders/YYYYMMDDHHmmss-create-settings-for-users-3-and-4.js
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const settings = [
      {
        userId: 3,
        currency: 'RON',
        timezone: 'Europe/Bucharest',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        userId: 4,
        currency: 'EUR',
        timezone: 'Europe/Paris',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await queryInterface.bulkInsert('Settings', settings, {});
    console.log('✅ Added settings for users 3 and 4');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Settings', {
      userId: [3, 4]
    }, {});
  }
};