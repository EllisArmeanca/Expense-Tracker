// models/settings.js
'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Settings extends Model {
    static associate(models) {
      Settings.belongsTo(models.User, { foreignKey: 'userId', onDelete: 'CASCADE' });
    }
  }
  Settings.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true
    },
    currency: {
      type: DataTypes.STRING,
      defaultValue: 'RON'
    },
    timezone: {
      type: DataTypes.STRING,
      defaultValue: 'Europe/Bucharest'
    }
  }, {
    sequelize,
    modelName: 'Settings',
  });
  return Settings;
};