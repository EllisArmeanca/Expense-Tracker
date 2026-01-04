// migrations/XXXXXX-create-user-budget.js
'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('UserBudgets', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      budgetId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Budgets',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Asigură-te că nu ai duplicate (userId, budgetId)
    await queryInterface.addConstraint('UserBudgets', {
      fields: ['userId', 'budgetId'],
      type: 'unique',
      name: 'UserBudgets_userId_budgetId_unique'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('UserBudgets');
  }
};