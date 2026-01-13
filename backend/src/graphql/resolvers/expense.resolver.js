// src/resolvers/expense.resolver.js

// Placeholder for expense controller
import * as expenseController from '../../controllers/expense.controller.js';

export const expenseResolvers = {
  queries: {
    expenses: async (_, { userId, tagIds, excludeTagIds, dateFrom, dateTo, withoutTags }, { req, user }) => {
      // If userId is provided, return expenses for that user only (must be the current user or admin)
      if (userId) {
        // Check if user is authenticated and authorized
        if (!user || user.id !== userId) {
          throw new Error('Unauthorized: You can only view your own expenses');
        }
      } else {
        // If no userId provided, may require admin privileges depending on your business logic
        // For now, we'll allow viewing all expenses to the authenticated user who owns those expenses
      }

      return await expenseController.getExpensesWithFilters({
        userId,
        tagIds,
        excludeTagIds,
        dateFrom,
        dateTo,
        withoutTags
      });
    },
    expense: async (_, { id }, { req, user }) => {
      const userId = user ? user.id : null;
      return await expenseController.getExpenseById(id, userId);
    },
    // Tag queries
    tags: async () => {
      return await expenseController.getAllTags();
    },
    tag: async (_, { id }) => {
      return await expenseController.getTagById(id);
    }
  },
  mutations: {
    createExpense: async (_, { title, amount, category, date, userId }, { req, user }) => {
      // Check if the user is authenticated and creating for themselves
      if (!user || user.id !== userId) {
        throw new Error('Unauthorized: You can only create expenses for yourself');
      }
      return await expenseController.createExpense({ title, amount, category, date, userId });
    },
    updateExpense: async (_, { id, ...updates }, { req, user }) => {
      // Check if user is authenticated
      if (!user) {
        throw new Error('Authentication required');
      }
      return await expenseController.updateExpense(id, updates, user.id);
    },
    deleteExpense: async (_, { id }, { req, user }) => {
      // Check if user is authenticated
      if (!user) {
        throw new Error('Authentication required');
      }
      return await expenseController.deleteExpense(id, user.id);
    },
    // Tag mutations
    createTag: async (_, { name, icon }, { req, user }) => {
      if (!user) {
        throw new Error('Authentication required');
      }
      return await expenseController.createTag({ name, icon });
    },
    updateTag: async (_, { id, name, icon }, { req, user }) => {
      if (!user) {
        throw new Error('Authentication required');
      }
      const updates = {};
      if (name) updates.name = name;
      if (icon !== undefined) updates.icon = icon;
      return await expenseController.updateTag(id, updates);
    },
    deleteTag: async (_, { id }, { req, user }) => {
      if (!user) {
        throw new Error('Authentication required');
      }
      return await expenseController.deleteTag(id);
    },
    // Expense tag management mutations
    addTagToExpense: async (_, { expenseId, tagId }, { req, user }) => {
      if (!user) {
        throw new Error('Authentication required');
      }
      return await expenseController.addTagToExpense(expenseId, tagId);
    },
    removeTagFromExpense: async (_, { expenseId, tagId }, { req, user }) => {
      if (!user) {
        throw new Error('Authentication required');
      }
      return await expenseController.removeTagFromExpense(expenseId, tagId);
    }
  }
};