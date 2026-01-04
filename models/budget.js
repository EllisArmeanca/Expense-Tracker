// models/budget.js
'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Budget extends Model {
    static associate(models) {
      Budget.belongsToMany(models.User, {
        through: models.UserBudget,
        foreignKey: 'budgetId',
        otherKey: 'userId',
        onDelete: 'CASCADE'
      });
    }
  }
  Budget.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    startDate: DataTypes.DATEONLY,
    endDate: DataTypes.DATEONLY
  }, {
    sequelize,
    modelName: 'Budget',
  });
  return Budget;
};