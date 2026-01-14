import jwt from 'jsonwebtoken';
import db from '../../models/index.js';

// Middleware to authenticate and authorize admin users
const authenticateAdmin = async (req) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  let user = null;
  
  if (token) {
    try {
      // Verify token with OAuth-compliant claims checking
      const decoded = jwt.verify(token, process.env.JWT_SECRET, {
        algorithms: ['HS256'],  // Specify allowed algorithms
        issuer: 'expense-tracker',  // Validate issuer
        audience: 'expense-tracker-users'  // Validate audience
      });

      // Fetch the user from the database using the subject claim (sub)
      user = await db.User.findByPk(decoded.sub, {
        attributes: { exclude: ['password'] }
      });

      // Check if user is an admin
      if (!user || !user.isAdmin) {
        throw new Error('Access denied. Admin privileges required.');
      }
    } catch (error) {
      // Token is invalid or user is not an admin
      throw new Error(error.message || 'Unauthorized: Admin access required');
    }
  } else {
    throw new Error('Authorization header missing');
  }

  return user;
};

export default authenticateAdmin;