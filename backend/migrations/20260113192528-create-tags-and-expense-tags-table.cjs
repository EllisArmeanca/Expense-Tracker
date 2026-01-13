'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Create the tags table
    await queryInterface.createTable('tags', {
      id: {
        type: Sequelize.STRING,
        primaryKey: true,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Create the expense_tags junction table for many-to-many relationship
    await queryInterface.createTable('expense_tags', {
      id: {
        type: Sequelize.STRING,
        primaryKey: true,
        allowNull: false
      },
      expense_id: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: 'expenses',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      tag_id: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: 'tags',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  async down (queryInterface) {
    // Drop the junction table first to avoid foreign key constraint issues
    await queryInterface.dropTable('expense_tags');
    // Then drop the tags table
    await queryInterface.dropTable('tags');
  }
};
