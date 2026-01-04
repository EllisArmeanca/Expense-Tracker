// models/userbudget.js
'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserBudget extends Model {
    static associate(models) {
      // Nu e nevoie de asocieri suplimentare în modelul de join
    }
  }
  UserBudget.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    budgetId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Budgets',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'UserBudget',
    indexes: [
      {
        unique: true,
        fields: ['userId', 'budgetId']
      }
    ]
  });
  return UserBudget;
};