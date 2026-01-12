// src/resolvers/expense.resolver.js

// Placeholder for expense controller
import * as expenseController from '../../controllers/expense.controller.js';

export const expenseResolvers = {
  queries: {
    expenses: async (_, { userId }, { req }) => {
      // If userId is provided, return expenses for that user only (must be the current user or admin)
      if (userId) {
        // Check if user is authenticated and authorized
        if (!req.user || req.user.id !== userId) {
          throw new Error('Unauthorized: You can only view your own expenses');
        }
        return await expenseController.getUserExpenses(userId);
      } else {
        // If no userId provided, return all expenses (this might be restricted in a real app)
        // Check if user is admin
        return await expenseController.getExpenses();
      }
    },
    expense: async (_, { id }, { req }) => {
      const userId = req.user ? req.user.id : null;
      return await expenseController.getExpenseById(id, userId);
    }
  },
  mutations: {
    createExpense: async (_, { title, amount, category, date, userId }, { req }) => {
      // Check if the user is authenticated and creating for themselves
      if (!req.user || req.user.id !== userId) {
        throw new Error('Unauthorized: You can only create expenses for yourself');
      }
      return await expenseController.createExpense({ title, amount, category, date, userId });
    },
    updateExpense: async (_, { id, ...updates }, { req }) => {
      // Check if user is authenticated
      if (!req.user) {
        throw new Error('Authentication required');
      }
      return await expenseController.updateExpense(id, updates, req.user.id);
    },
    deleteExpense: async (_, { id }, { req }) => {
      // Check if user is authenticated
      if (!req.user) {
        throw new Error('Authentication required');
      }
      return await expenseController.deleteExpense(id, req.user.id);
    }
  }
};