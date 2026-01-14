import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import { createHandler } from 'graphql-http/lib/use/express';
import { schema } from './src/graphql/schema.js';
import authenticateToken from './src/middleware/auth.js';
import authenticateAdmin from './src/middleware/adminAuth.js';
import { sequelize } from './config/database.js'; // Import sequelize instance
import winston from 'winston';
import db from './models/index.js';

dotenv.config();

// Configure Winston logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'expense-tracker-backend' },
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

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10000 // limit each IP to 100 requests per windowMs
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  const originalSend = res.send;
  res.send = function (body) {
    logger.info(`${req.method} ${req.path} - ${res.statusCode}`, {
      statusCode: res.statusCode,
      contentLength: body ? Buffer.byteLength(body, 'utf8') : 0
    });
    originalSend.call(this, body);
  };

  next();
});


// GraphQL endpoint with context for regular users
app.use('/graphql', createHandler({
  schema,
  context: async (req) => {
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
      } catch (error) {
        // Token is invalid, but continue with request as some operations may not require auth
        // Log the error for debugging purposes
        console.log('JWT verification failed:', error.message);
      }
    }

    // Return context with request and user info
    return { req, user };
  }
}));

// Admin GraphQL endpoint with admin authentication
app.use('/admin/gql', async (req, res, next) => {
  logger.info('Admin endpoint authentication attempt', { ip: req.ip });
  try {
    const user = await authenticateAdmin(req);
    logger.info('Admin authentication successful', { userId: user?.id, userEmail: user?.email });

    // Create a custom GraphQL handler that has access to the authenticated admin user
    const adminGraphQLHandler = createHandler({
      schema,
      context: async () => {
        // Context for admin endpoint with the authenticated user
        logger.info('Admin context created', {
          adminUserExists: !!user,
          adminUserId: user?.id,
          adminUserIsAdmin: user?.isAdmin
        });

        const context = {
          req,
          user: user ? { ...user, isAdmin: true } : null, // Ensure isAdmin flag is set
          isAdmin: true // Indicate this is an admin context
        };

        logger.info('Admin context details', {
          userPresent: !!context.user,
          userId: context.user?.id,
          userIsAdmin: context.user?.isAdmin,
          isAdminFlag: context.isAdmin
        });

        return context;
      }
    });

    // Execute the admin GraphQL handler
    await adminGraphQLHandler(req, res);
  } catch (error) {
    logger.error('Admin authentication failed', { error: error.message, ip: req.ip });
    res.status(401).json({
      error: 'Unauthorized',
      message: error.message
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 4000;

// Initialize database connection and sync models before starting server
sequelize.authenticate()
  .then(async () => {
    console.log('Database connection established successfully.');

    // Run migrations to ensure the database is up to date
    logger.info('Running database migrations...');
    try {
      await sequelize.sync({ force: false }); // Sync models to create tables if they don't exist
      logger.info('Database synchronized successfully.');
    } catch (syncError) {
      logger.error('Database synchronization failed:', { error: syncError.message });
      throw syncError;
    }

    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
      logger.info(`GraphQL endpoint: http://localhost:${PORT}/graphql`);
      logger.info(`Health check endpoint: http://localhost:${PORT}/health`);
    });
  })
  .catch(err => {
    logger.error('Unable to connect to the database:', { error: err.message });
    process.exit(1);
  });

export default app;
