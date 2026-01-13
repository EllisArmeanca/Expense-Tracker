import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import db from '../../models/index.js';

const { User } = db;

// Verify token and get user
export const verifyTokenAndGetUser = async (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] }
    });

    return user;
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return null;
    }
    throw error;
  }
};

// Generate a new token
export const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// Validate user credentials
export const validateUserCredentials = async (email, password) => {
  const user = await User.findOne({ where: { email } });

  if (!user) {
    return null; // User not found
  }

  const isValidPassword = await bcrypt.compare(password, user.password);

  if (!isValidPassword) {
    return null; // Invalid password
  }

  // Return user without password
  const { password: _, ...userWithoutPassword } = user.toJSON();
  return userWithoutPassword;
};
