import jwt from 'jsonwebtoken';

// Admin middleware to check for admin privileges
const adminAuthMiddleware = (req, res, next) => {
  // Extract token from Authorization header
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if the user has admin privileges
    // For now, we'll check using an environment variable ADMIN_USER_ID
    // In a real app, you'd typically have a role field in the user record
    if (decoded.id !== process.env.ADMIN_USER_ID) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export default adminAuthMiddleware;
