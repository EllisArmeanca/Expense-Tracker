// allUsersQuery.js
// Fetches a list of all users in the system.
// Access is restricted to users with the 'admin' role.
// Returns user profiles without sensitive data (e.g., password).
// Includes nested settings but excludes expenses for performance (can be added if needed).

const { GraphQLList } = require('graphql');
const UserType = require("../types/UserType");
const db = require("../../models");
const { requireAdmin } = require("../../utils/auth");
const { GraphQLError } = require("graphql");

const allUsersQuery = {
  type: new GraphQLList(UserType),
  resolve: async (_, __, context) => {
    // Only admins can access this query
    requireAdmin(context);

    try {
      const users = await db.User.findAll({
        attributes: ['id', 'username', 'role'], // ← exclude password
        include: [
          {
            model: db.Settings,
            as: 'Setting',
            attributes: ['id', 'currency', 'timezone']
          }
          // Expenses are excluded here for performance — can be added per user if needed
        ],
        order: [['username', 'ASC']]
      });

      return users;
    } catch (error) {
      console.error("Error fetching all users:", error);
      throw new GraphQLError("Failed to fetch users");
    }
  }
};

module.exports = allUsersQuery;