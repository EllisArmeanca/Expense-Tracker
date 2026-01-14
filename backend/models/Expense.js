import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Expense = sequelize.define('Expense', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  userId: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
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
  tableName: 'expenses',
  timestamps: true,
  underscored: true
});

// Define associations
Expense.associate = function (models) {
  Expense.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user'
  });

  // Many-to-many relationship with tags through expense_tags junction table
  Expense.belongsToMany(models.Tag, {
    through: 'expense_tags',
    foreignKey: 'expense_id',
    otherKey: 'tag_id',
    as: 'tags'
  });
};

export default Expense;
