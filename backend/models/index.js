import { sequelize } from '../config/database.js';
import User from './User.js';
import Expense from './Expense.js';

const db = {};

// Assign models to db object
db.User = User;
db.Expense = Expense;

// Set up associations
User.associate(db);
Expense.associate(db);

db.sequelize = sequelize;

export default db;
