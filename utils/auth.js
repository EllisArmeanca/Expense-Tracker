// utils/auth.js

///autorizarea, verificarea drepturilor pe baza rolului userului

const ROLES = {
  ADMIN: 'admin',
  USER: 'user'
};

function requireAuth(context) {
  if (!context.user) {
    throw new Error('Authentication required');
  }
}

function requireAdmin(context) {
  requireAuth(context);
  if (context.user.role !== ROLES.ADMIN) {
    throw new Error('Admin access required');
  }
}

function requireUser(context) {
  requireAuth(context);
  if (context.user.role !== ROLES.USER && context.user.role !== ROLES.ADMIN) {
    throw new Error('User or admin access required');
  }
}

module.exports = {
  ROLES,
  requireAuth,
  requireAdmin,
  requireUser
};