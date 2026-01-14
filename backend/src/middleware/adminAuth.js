import jwt from 'jsonwebtoken';
import db from '../../models/index.js';
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'expense-tracker-backend', module: 'admin-auth' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Middleware to authenticate and authorize admin users
const authenticateAdmin = async (req) => {
  logger.info('Admin authentication attempt', {
    path: req.path,
    method: req.method,
    authHeaderPresent: !!req.headers['authorization']
  });

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  let user = null;

  if (token) {
    logger.info('Verifying admin token', { tokenPresent: !!token });
    try {
      // Verify token with OAuth-compliant claims checking
      const decoded = jwt.verify(token, process.env.JWT_SECRET, {
        algorithms: ['HS256'],  // Specify allowed algorithms
        issuer: 'expense-tracker',  // Validate issuer
        audience: 'expense-tracker-users'  // Validate audience
      });

      logger.info('Token verified, fetching user', { userId: decoded.sub });

      // Fetch the user from the database using the subject claim (sub)
      user = await db.User.findByPk(decoded.sub, {
        attributes: { exclude: ['password'] }
      });



      logger.info('User fetched from database', {
        userFound: !!user,
        userId: user?.id,
        userIsAdmin: user?.isAdmin
      });

      // Check if user is an admin
      if (!user || !user.isAdmin) {
        logger.warn('Admin access denied', {
          userExists: !!user,
          userIsAdmin: user?.isAdmin,
          userId: user?.id
        });
        throw new Error('Access denied. Admin privileges required.');
      }

      logger.info('Admin authentication successful', { userId: user.id });
    } catch (error) {
      logger.error('Admin authentication error', {
        error: error.message,
        stack: error.stack
      });
      // Token is invalid or user is not an admin
      throw new Error(error.message || 'Unauthorized: Admin access required');
    }
  } else {
    logger.warn('Authorization header missing');
    throw new Error('Authorization header missing');
  }

  return user;
};

export default authenticateAdmin;
