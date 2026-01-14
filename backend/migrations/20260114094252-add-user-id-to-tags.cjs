'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Add userId column to tags table
    await queryInterface.addColumn('tags', 'user_id', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'user_1', // temporary default value to be updated later
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    });

    // Update all existing tags to be associated with a default user (like the first user)
    // This is needed because we set allowNull: false
    const [existingUsers] = await queryInterface.sequelize.query(
      'SELECT id FROM users LIMIT 1'
    );

    if (existingUsers.length > 0) {
      const defaultUserId = existingUsers[0].id;
      await queryInterface.sequelize.query(
        `UPDATE tags SET user_id = ?`,
        { replacements: [defaultUserId] }
      );
    }

    // Change allowNull to true after populating existing records
    await queryInterface.changeColumn('tags', 'user_id', {
      type: Sequelize.STRING,
      allowNull: true, // Allow null temporarily
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    });

    // Add index for better performance
    await queryInterface.addIndex('tags', ['user_id']);

    // Now make it NOT NULL again
    await queryInterface.changeColumn('tags', 'user_id', {
      type: Sequelize.STRING,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    });
  },

  async down (queryInterface, Sequelize) {
    // Remove the userId column
    await queryInterface.removeColumn('tags', 'user_id');
  }
};
