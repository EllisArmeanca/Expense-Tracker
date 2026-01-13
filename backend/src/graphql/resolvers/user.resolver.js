// src/resolvers/user.resolver.js

// Placeholder for user controller
import * as userController from '../../controllers/user.controller.js';
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'expense-tracker-backend', module: 'user-resolver' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    ...(process.env.NODE_ENV !== 'development'
      ? [
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' })
      ]
      : []
    )
  ]
});

export const userResolvers = {
  queries: {
    users: async () => {
      console.log('DEBUG: users resolver called');
      logger.info('Fetching all users');
      try {
        console.log('DEBUG: About to call userController.getUsers()');
        const result = await userController.getUsers();
        console.log('DEBUG: getUsers returned:', result);
        logger.info('Successfully fetched users', { count: result?.length });
        return result;
      } catch (error) {
        console.error('DEBUG: Error in users resolver:', error.message, error.stack);
        logger.error('Error fetching users', { error: error.message });
        throw error;
      }
    },
    user: async (_, { id }) => {
      logger.info('Fetching user by ID', { id });
      try {
        const result = await userController.getUserById(id);
        logger.info('Successfully fetched user', { id });
        return result;
      } catch (error) {
        logger.error('Error fetching user by ID', { id, error: error.message });
        throw error;
      }
    },
    me: async (_, args, { req, user }) => {
      // This requires authentication, so we ensure the user is logged in
      logger.info('Fetching current user', { userId: user?.id });
      if (!user) {
        logger.warn('Attempt to access current user without authentication');
        throw new Error('Authentication required');
      }
      try {
        const result = await userController.getCurrentUser(user.id);
        logger.info('Successfully fetched current user', { userId: user.id });
        return result;
      } catch (error) {
        logger.error('Error fetching current user', { userId: user.id, error: error.message });
        throw error;
      }
    },
    adminUsers: async (_, args, { req, user }) => {
      // This requires admin authentication
      logger.info('Fetching all users (admin access)', { adminUserId: user?.id });
      if (!user || !user.isAdmin) {
        logger.warn('Attempt to access admin function without admin privileges', { userId: user?.id, isAdmin: user?.isAdmin });
        throw new Error('Admin access required');
      }
      try {
        const result = await userController.getUsers();
        logger.info('Successfully fetched all users for admin', { adminUserId: user.id, resultCount: result?.length });
        return result;
      } catch (error) {
        logger.error('Error fetching all users (admin access)', { adminUserId: user.id, error: error.message });
        throw error;
      }
    }
  },
  mutations: {
    login: async (_, { email, password }) => {
      console.log('DEBUG: login resolver called with email:', email);
      logger.info('Login attempt', { email });
      try {
        console.log('DEBUG: About to call userController.login()');
        const result = await userController.login(email, password);
        console.log('DEBUG: login returned:', result ? 'success' : 'null/undefined');
        logger.info('Successful login', { userId: result?.user?.id, email });
        return result;
      } catch (error) {
        console.error('DEBUG: Error in login resolver:', error.message, error.stack);
        logger.error('Login failed', { email, error: error.message });
        throw error;
      }
    },
    register: async (_, { name, email, password }) => {
      logger.info('Register attempt', { name, email });
      try {
        const result = await userController.register({ name, email, password });
        logger.info('Successful registration', { userId: result?.user?.id, email });
        return result;
      } catch (error) {
        logger.error('Registration failed', { email, error: error.message });
        throw error;
      }
    },
    createUser: async (_, { name, email, password }) => {
      logger.info('Create user attempt', { name, email });
      try {
        const result = await userController.createUser({ name, email, password });
        logger.info('Successfully created user', { userId: result?.id, email });
        return result;
      } catch (error) {
        logger.error('Error creating user', { email, error: error.message });
        throw error;
      }
    },
    updateUser: async (_, { id, ...updates }) => {
      logger.info('Update user attempt', { id, updates: Object.keys(updates) });
      try {
        const result = await userController.updateUser(id, updates);
        logger.info('Successfully updated user', { id });
        return result;
      } catch (error) {
        logger.error('Error updating user', { id, error: error.message });
        throw error;
      }
    },
    updateProfile: async (_, { ...updates }, { req, user }) => {
      logger.info('Update profile attempt', { userId: user?.id, updates: Object.keys(updates) });
      if (!user) {
        logger.warn('Attempt to update profile without authentication');
        throw new Error('Authentication required');
      }
      try {
        const result = await userController.updateProfile(user.id, updates);
        logger.info('Successfully updated profile', { userId: user.id });
        return result;
      } catch (error) {
        logger.error('Error updating profile', { userId: user.id, error: error.message });
        throw error;
      }
    },
    deleteUser: async (_, { id }) => {
      logger.info('Delete user attempt', { id });
      try {
        const result = await userController.deleteUser(id);
        logger.info('Successfully deleted user', { id });
        return result;
      } catch (error) {
        logger.error('Error deleting user', { id, error: error.message });
        throw error;
      }
    },
    logout: async () => {
      logger.info('Logout attempt');
      try {
        const result = await userController.logout();
        logger.info('Successfully logged out');
        return result;
      } catch (error) {
        logger.error('Error during logout', { error: error.message });
        throw error;
      }
    },
    promoteToAdmin: async (_, { id }, { req, user }) => {
      // This requires admin authentication
      logger.info('Promoting user to admin', { adminUserId: user?.id, targetUserId: id });
      if (!user || !user.isAdmin) {
        logger.warn('Attempt to promote user without admin privileges', { userId: user?.id, isAdmin: user?.isAdmin });
        throw new Error('Admin access required');
      }
      try {
        const result = await userController.promoteToAdmin(id);
        logger.info('Successfully promoted user to admin', { adminUserId: user.id, targetUserId: id });
        return result;
      } catch (error) {
        logger.error('Error promoting user to admin', { adminUserId: user.id, targetUserId: id, error: error.message });
        throw error;
      }
    },
    demoteFromAdmin: async (_, { id }, { req, user }) => {
      // This requires admin authentication
      logger.info('Demoting user from admin', { adminUserId: user?.id, targetUserId: id });
      if (!user || !user.isAdmin) {
        logger.warn('Attempt to demote user without admin privileges', { userId: user?.id, isAdmin: user?.isAdmin });
        throw new Error('Admin access required');
      }
      try {
        const result = await userController.demoteFromAdmin(id);
        logger.info('Successfully demoted user from admin', { adminUserId: user.id, targetUserId: id });
        return result;
      } catch (error) {
        logger.error('Error demoting user from admin', { adminUserId: user.id, targetUserId: id, error: error.message });
        throw error;
      }
    }
  }
};
