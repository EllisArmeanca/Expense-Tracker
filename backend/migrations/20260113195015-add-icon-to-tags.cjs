/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('tags', 'icon', {
      type: Sequelize.STRING,
      allowNull: true,  // Allow null initially for existing tags
      comment: 'Icon identifier for the tag (emoji, icon name, or icon class)'
    });
  },

  async down (queryInterface) {
    await queryInterface.removeColumn('tags', 'icon');
  }
};