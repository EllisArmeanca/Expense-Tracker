import jwt from 'jsonwebtoken';
import db from '../../models/index.js';

const { User } = db;

// Admin middleware to check for admin privileges
const adminAuthMiddleware = async (req, res, next) => {
  // Extract token from Authorization header
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user from database and check if they are admin
    const user = await User.findByPk(decoded.sub);

    if (!user || !user.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    req.user = user; // Attach user object instead of just decoded data
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export default adminAuthMiddleware;
