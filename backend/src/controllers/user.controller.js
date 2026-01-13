// src/controllers/user.controller.js
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import db from '../../models/index.js';
import winston from 'winston';

const { User, Expense } = db;

// Create logger for this module
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'expense-tracker-backend', module: 'user-controller' },
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

// Get all users
export const getUsers = async () => {
  console.log('DEBUG: getUsers function called');
  logger.info('Fetching all users');
  try {
    console.log('DEBUG: About to call User.findAll()');
    // Temporarily removing the include to see if association is the issue
    const users = await User.findAll();
    console.log('DEBUG: User.findAll() succeeded, found', users.length, 'users');
    logger.info('Successfully fetched users', { count: users.length });
    return users;
  } catch (error) {
    console.error('DEBUG: Error in getUsers:', error.message, error.stack);
    logger.error('Failed to fetch users', { error: error.message });
    throw new Error(`Failed to fetch users: ${error.message}`);
  }
};

// Get user by ID
export const getUserById = async (id) => {
  logger.info('Fetching user by ID', { id });
  try {
    // Temporarily removing the include to see if association is the issue
    const user = await User.findByPk(id);

    if (!user) {
      logger.warn('User not found', { id });
      throw new Error('User not found');
    }

    logger.info('Successfully fetched user', { id });
    return user;
  } catch (error) {
    logger.error('Failed to fetch user', { id, error: error.message });
    throw new Error(`Failed to fetch user: ${error.message}`);
  }
};

// Helper function to generate IDs similar to Prisma's cuid()
function generateId() {
  console.log('DEBUG: generateId function called');
  const id = 'user_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  console.log('DEBUG: Generated ID:', id);
  return id;
}

// Create a new user
export const createUser = async ({ name, email, password }) => {
  console.log('DEBUG: createUser function called with email:', email);
  logger.info('Creating new user', { email });
  try {
    console.log('DEBUG: About to check if user already exists');
    // Check if user already exists
    const existingUser = await User.findOne({
      where: { email }
    });

    if (existingUser) {
      logger.warn('User creation failed: Email already exists', { email });
      throw new Error('User with this email already exists');
    }

    console.log('DEBUG: About to hash password');
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('DEBUG: Password hashed successfully');

    console.log('DEBUG: About to generate custom ID');
    // Create the user with a generated ID to match the STRING type in DB
    const userId = generateId();
    console.log('DEBUG: Generated ID:', userId);

    const user = await User.create({
      id: userId,
      name,
      email,
      password: hashedPassword
    });
    console.log('DEBUG: User created successfully with ID:', user.id);

    logger.info('Successfully created user', { userId: user.id, email });

    // Don't return the password hash
    const { password: _, ...userWithoutPassword } = user.toJSON();
    console.log('DEBUG: Returning user without password');
    return userWithoutPassword;
  } catch (error) {
    console.error('DEBUG: Error in createUser:', error.message, error.stack);
    logger.error('Failed to create user', { email, error: error.message });
    throw new Error(`Failed to create user: ${error.message}`);
  }
};

// Update user
export const updateUser = async (id, updates) => {
  logger.info('Updating user', { id, updates: Object.keys(updates) });
  try {
    // Remove password from updates if present (should be handled separately)
    const { password, ...otherUpdates } = updates;

    const [updatedRowsCount] = await User.update(otherUpdates, {
      where: { id }
    });

    if (updatedRowsCount === 0) {
      logger.warn('Update failed: User not found', { id });
      throw new Error('User not found');
    }

    const updatedUser = await User.findByPk(id);
    const { password: _, ...userWithoutPassword } = updatedUser.toJSON();

    logger.info('Successfully updated user', { id });
    return userWithoutPassword;
  } catch (error) {
    logger.error('Failed to update user', { id, error: error.message });
    throw new Error(`Failed to update user: ${error.message}`);
  }
};

// Delete user
export const deleteUser = async (id) => {
  logger.info('Deleting user', { id });
  try {
    const deletedRowCount = await User.destroy({
      where: { id }
    });

    if (deletedRowCount > 0) {
      logger.info('Successfully deleted user', { id });
    } else {
      logger.warn('Deletion attempted on non-existent user', { id });
    }

    return deletedRowCount > 0;
  } catch (error) {
    logger.error('Failed to delete user', { id, error: error.message });
    throw new Error(`Failed to delete user: ${error.message}`);
  }
};

// Login user
export const login = async (email, password) => {
  console.log('DEBUG: login function called with email:', email);
  logger.info('Processing login attempt', { email });
  try {
    console.log('DEBUG: About to find user by email');
    // Find user by email
    const user = await User.findOne({
      where: { email }
    });

    console.log('DEBUG: User lookup result:', user ? 'found user' : 'user not found');
    if (!user) {
      logger.warn('Login failed: User not found', { email });
      throw new Error('Invalid credentials');
    }

    console.log('DEBUG: About to compare passwords');
    // Compare passwords
    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log('DEBUG: Password comparison result:', isValidPassword);

    if (!isValidPassword) {
      logger.warn('Login failed: Invalid password', { email, userId: user.id });
      throw new Error('Invalid credentials');
    }

    console.log('DEBUG: About to generate JWT token');
    // Generate JWT token - including user details for frontend with OAuth-compliant claims
    const payload = {
      sub: user.id,             // Subject (user ID) for consistency
      id: user.id,              // User ID
      email: user.email,        // User email
      name: user.name,          // User name
      isAdmin: user.isAdmin,    // Admin status
      iat: Math.floor(Date.now() / 1000), // Issued at time
      iss: 'expense-tracker',   // Issuer
      aud: 'expense-tracker-users' // Audience
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      {
        algorithm: 'HS256',
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
      }
    );
    console.log('DEBUG: JWT token generated successfully');

    logger.info('Successful login', { userId: user.id, email });

    // Return both token and user info (excluding password)
    const { password: _, ...userWithoutPassword } = user.toJSON();
    console.log('DEBUG: Returning successful login result');
    return {
      token,
      user: userWithoutPassword
    };
  } catch (error) {
    console.error('DEBUG: Error in login:', error.message, error.stack);
    logger.error('Login failed', { email, error: error.message });
    throw new Error(`Login failed: ${error.message}`);
  }
};

// Register user (creates user and returns token)
export const register = async ({ name, email, password }) => {
  logger.info('Processing registration attempt', { email });
  try {
    const user = await createUser({ name, email, password });

    // Generate JWT token after successful registration following OAuth specification
    const payload = {
      sub: user.id,           // Subject (user ID)
      id: user.id,            // User ID
      email: user.email,      // Email address
      name: user.name,        // User name
      isAdmin: user.isAdmin,  // Admin status
      iat: Math.floor(Date.now() / 1000), // Issued at time
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // Expiration time (24 hours)
      iss: 'expense-tracker', // Issuer
      aud: 'expense-tracker-users' // Audience
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      {
        algorithm: 'HS256',
        expiresIn: process.env.JWT_EXPIRES_IN || '24h'
      }
    );

    logger.info('Successful registration', { userId: user.id, email });

    return {
      token,
      user
    };
  } catch (error) {
    logger.error('Registration failed', { email, error: error.message });
    throw new Error(`Registration failed: ${error.message}`);
  }
};

// Get current user (requires authentication)
export const getCurrentUser = async (userId) => {
  logger.info('Fetching current user', { userId });
  try {
    // Temporarily removing the include to see if association is the issue
    const user = await User.findByPk(userId);

    if (!user) {
      logger.warn('Current user not found', { userId });
      throw new Error('User not found');
    }

    logger.info('Successfully fetched current user', { userId });
    const { password: _, ...userWithoutPassword } = user.toJSON();
    return userWithoutPassword;
  } catch (error) {
    logger.error('Failed to fetch current user', { userId, error: error.message });
    throw new Error(`Failed to fetch user: ${error.message}`);
  }
};

// Update user profile
export const updateProfile = async (id, updates) => {
  logger.info('Updating user profile', { id, updates: Object.keys(updates) });
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
      logger.warn('Profile update failed: User not found', { id });
      throw new Error('User not found');
    }

    const updatedUser = await User.findByPk(id); // Removed include to troubleshoot

    logger.info('Successfully updated user profile', { id });
    const { password: _, ...userWithoutPassword } = updatedUser.toJSON();
    return userWithoutPassword;
  } catch (error) {
    logger.error('Failed to update profile', { id, error: error.message });
    throw new Error(`Failed to update profile: ${error.message}`);
  }
};

// Logout user (client-side - just invalidate the token)
export const logout = async () => {
  logger.info('Processing logout');
  // In a real implementation, you might want to maintain a blacklist of tokens
  logger.info('Logout processed');
  return { success: true };
};

// Promote user to admin
export const promoteToAdmin = async (id) => {
  logger.info('Promoting user to admin', { targetUserId: id });
  try {
    const user = await User.findByPk(id);

    if (!user) {
      logger.warn('Promotion failed: User not found', { targetUserId: id });
      throw new Error('User not found');
    }

    // Update the user's isAdmin flag
    await User.update({ isAdmin: true }, { where: { id } });

    // Fetch the updated user
    const updatedUser = await User.findByPk(id);

    logger.info('Successfully promoted user to admin', { targetUserId: id });
    const { password: _, ...userWithoutPassword } = updatedUser.toJSON();
    return userWithoutPassword;
  } catch (error) {
    logger.error('Failed to promote user to admin', { targetUserId: id, error: error.message });
    throw new Error(`Failed to promote user to admin: ${error.message}`);
  }
};

// Demote user from admin
export const demoteFromAdmin = async (id) => {
  logger.info('Demoting user from admin', { targetUserId: id });
  try {
    const user = await User.findByPk(id);

    if (!user) {
      logger.warn('Demotion failed: User not found', { targetUserId: id });
      throw new Error('User not found');
    }

    // Don't allow demoting the last admin (optional security measure)
    const admins = await User.findAll({ where: { isAdmin: true } });
    if (admins.length <= 1 && user.isAdmin) {
      logger.warn('Demotion failed: Cannot remove the last admin', { targetUserId: id });
      throw new Error('Cannot remove the last admin');
    }

    // Update the user's isAdmin flag
    await User.update({ isAdmin: false }, { where: { id } });

    // Fetch the updated user
    const updatedUser = await User.findByPk(id);

    logger.info('Successfully demoted user from admin', { targetUserId: id });
    const { password: _, ...userWithoutPassword } = updatedUser.toJSON();
    return userWithoutPassword;
  } catch (error) {
    logger.error('Failed to demote user from admin', { targetUserId: id, error: error.message });
    throw new Error(`Failed to demote user from admin: ${error.message}`);
  }
};
