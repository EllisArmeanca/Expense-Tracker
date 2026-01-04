// models/expense.js
'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Expense extends Model {
    static associate(models) {
      Expense.belongsTo(models.User, { foreignKey: 'userId', onDelete: 'CASCADE' });
      Expense.belongsTo(models.Category, { foreignKey: 'categoryId', onDelete: 'SET NULL' });
    }
  }
  Expense.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    description: DataTypes.STRING,
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Expense',
  });
  return Expense;
};