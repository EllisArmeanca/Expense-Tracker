// models/user.js
'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // 1:1
      User.hasOne(models.Settings, { foreignKey: 'userId', onDelete: 'CASCADE' });
      // 1:M
      User.hasMany(models.Expense, { foreignKey: 'userId', onDelete: 'CASCADE' });
      // M:M
      User.belongsToMany(models.Budget, {
        through: models.UserBudget,
        foreignKey: 'userId',
        otherKey: 'budgetId',
        onDelete: 'CASCADE'
      });
    }
  }
  User.init({
    username: DataTypes.STRING,
    password: DataTypes.STRING,
    role: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};