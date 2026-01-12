// src/controllers/user.controller.js
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import db from '../../models/index.js';
import { generateToken } from '../services/auth.service.js';
const { User, Expense } = db;

// Get all users
export const getUsers = async () => {
  try {
    return await User.findAll({
      include: [{
        model: Expense,
        as: 'expenses'
      }]
    });
  } catch (error) {
    throw new Error(`Failed to fetch users: ${error.message}`);
  }
};

// Get user by ID
export const getUserById = async (id) => {
  try {
    const user = await User.findByPk(id, {
      include: [{
        model: Expense,
        as: 'expenses'
      }]
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  } catch (error) {
    throw new Error(`Failed to fetch user: ${error.message}`);
  }
};

// Create a new user
export const createUser = async ({ name, email, password }) => {
  try {
    // Check if user already exists
    const existingUser = await User.findOne({
      where: { email }
    });

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user with a generated ID to match the STRING type in DB
    const user = await User.create({
      id: generateId(),
      name,
      email,
      password: hashedPassword
    });

    // Don't return the password hash
    const { password: _, ...userWithoutPassword } = user.toJSON();
    return userWithoutPassword;
  } catch (error) {
    throw new Error(`Failed to create user: ${error.message}`);
  }
};

// Update user
export const updateUser = async (id, updates) => {
  try {
    // Remove password from updates if present (should be handled separately)
    const { password, ...otherUpdates } = updates;

    const [updatedRowsCount] = await User.update(otherUpdates, {
      where: { id }
    });

    if (updatedRowsCount === 0) {
      throw new Error('User not found');
    }

    const updatedUser = await User.findByPk(id);
    const { password: _, ...userWithoutPassword } = updatedUser.toJSON();
    return userWithoutPassword;
  } catch (error) {
    throw new Error(`Failed to update user: ${error.message}`);
  }
};

// Delete user
export const deleteUser = async (id) => {
  try {
    const deletedRowCount = await User.destroy({
      where: { id }
    });
    return deletedRowCount > 0;
  } catch (error) {
    throw new Error(`Failed to delete user: ${error.message}`);
  }
};

// Login user
export const login = async (email, password) => {
  try {
    // Find user by email
    const user = await User.findOne({
      where: { email }
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Compare passwords
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Return both token and user info (excluding password)
    const { password: _, ...userWithoutPassword } = user.toJSON();
    return {
      token,
      user: userWithoutPassword
    };
  } catch (error) {
    throw new Error(`Login failed: ${error.message}`);
  }
};

// Register user (creates user and returns token)
export const register = async ({ name, email, password }) => {
  try {
    const user = await createUser({ name, email, password });

    // Generate JWT token after successful registration
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return {
      token,
      user
    };
  } catch (error) {
    throw new Error(`Registration failed: ${error.message}`);
  }
};

// Get current user (requires authentication)
export const getCurrentUser = async (userId) => {
  try {
    const user = await User.findByPk(userId, {
      include: [{
        model: Expense,
        as: 'expenses'
      }]
    });

    if (!user) {
      throw new Error('User not found');
    }

    const { password: _, ...userWithoutPassword } = user.toJSON();
    return userWithoutPassword;
  } catch (error) {
    throw new Error(`Failed to fetch user: ${error.message}`);
  }
};

// Update user profile
export const updateProfile = async (id, updates) => {
  try {
    // Handle password updates separately if included
    if (updates.password) {
      // Hash new password
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    const [updatedRowsCount] = await User.update(updates, {
      where: { id }
    });

    if (updatedRowsCount === 0) {
      throw new Error('User not found');
    }

    const updatedUser = await User.findByPk(id, {
      include: [{
        model: Expense,
        as: 'expenses'
      }]
    });

    const { password: _, ...userWithoutPassword } = updatedUser.toJSON();
    return userWithoutPassword;
  } catch (error) {
    throw new Error(`Failed to update profile: ${error.message}`);
  }
};

// Logout user (client-side - just invalidate the token)
export const logout = async () => {
  // In a real implementation, you might want to maintain a blacklist of tokens
  return { success: true };
};

// Helper function to generate IDs similar to Prisma's cuid()
function generateId() {
  return 'user_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}