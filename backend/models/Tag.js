import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

function generateId(prefix = 'tag') {
  return prefix + '_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

const Tag = sequelize.define('Tag', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false,
    defaultValue: () => generateId('tag')
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      len: [1, 100] // Limit tag name length
    }
  },
  icon: {
    type: DataTypes.STRING,
    allowNull: true,  // Allow null for backward compatibility
    comment: 'Icon identifier for the tag (emoji, icon name, or icon class)'
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'tags',
  timestamps: true,
  underscored: true
});

// Define associations
Tag.associate = function (models) {
  // Many-to-many relationship with expenses through expense_tags junction table
  Tag.belongsToMany(models.Expense, {
    through: 'expense_tags',
    foreignKey: 'tag_id',
    otherKey: 'expense_id',
    as: 'expenses'
  });
};

export default Tag;