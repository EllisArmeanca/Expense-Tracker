'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Remove the category column
    await queryInterface.removeColumn('expenses', 'category');
  },

  async down (queryInterface, Sequelize) {
    // Add back the category column
    await queryInterface.addColumn('expenses', 'category', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'General' // Default value to satisfy NOT NULL constraint
    });
  }
};
