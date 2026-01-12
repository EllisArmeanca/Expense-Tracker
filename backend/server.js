import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import { createHandler } from 'graphql-http/lib/use/express';
import { schema, rootValue } from './src/graphql/schema.js';
import authenticateToken from './src/middleware/auth.js';
import { sequelize } from './config/database.js'; // Import sequelize instance

dotenv.config();

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Middleware to attach user to request if authenticated (but not required for all routes)
app.use('/graphql', (req, res, next) => {
  // Try to authenticate the user but don't fail if token is invalid/missing
  // This allows both authenticated and unauthenticated queries to work
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.token = token;
      req.decoded = decoded;
    } catch (error) {
      // Token is invalid, but continue with request as some operations may not require auth
    }
  }

  next();
});

// GraphQL endpoint with context
app.use('/graphql', createHandler({
  schema,
  context: (req) => {
    return { req }; // Pass the request object to resolvers
  }
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 4000;

// Initialize database connection and sync models before starting server
sequelize.authenticate()
  .then(async () => {
    console.log('Database connection established successfully.');

    // Sync the models with the database
    await sequelize.sync();
    console.log('Database synchronized.');

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`GraphQL endpoint: http://localhost:${PORT}/graphql`);
      console.log(`Frontend: http://localhost:${PORT}/`);
      console.log('To use GraphQL development tools, you can use a standalone client like Altair, GraphQL Playground, or Apollo Studio');
    });
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
    process.exit(1);
  });

export default app;
