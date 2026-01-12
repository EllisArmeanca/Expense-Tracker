// src/resolvers/user.resolver.js

// Placeholder for user controller
import * as userController from '../../controllers/user.controller.js';

export const userResolvers = {
  queries: {
    users: async () => {
      return await userController.getUsers();
    },
    user: async (_, { id }) => {
      return await userController.getUserById(id);
    },
    me: async (_, args, { req }) => {
      // This requires authentication, so we ensure the user is logged in
      if (!req.user) {
        throw new Error('Authentication required');
      }
      return await userController.getCurrentUser(req.user.id);
    }
  },
  mutations: {
    login: async (_, { email, password }) => {
      return await userController.login(email, password);
    },
    register: async (_, { name, email, password }) => {
      return await userController.register({ name, email, password });
    },
    createUser: async (_, { name, email, password }) => {
      return await userController.createUser({ name, email, password });
    },
    updateUser: async (_, { id, ...updates }) => {
      return await userController.updateUser(id, updates);
    },
    updateProfile: async (_, { ...updates }, { req }) => {
      if (!req.user) {
        throw new Error('Authentication required');
      }
      return await userController.updateProfile(req.user.id, updates);
    },
    deleteUser: async (_, { id }) => {
      return await userController.deleteUser(id);
    },
    logout: async () => {
      return await userController.logout();
    }
  }
};