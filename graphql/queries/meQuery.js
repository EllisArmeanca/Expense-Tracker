// meQuery.js
// Returns the profile of the currently authenticated user.
// The user ID is inferred from the JWT token in the request context.
// Includes nested data: settings (1:1) and expenses (1:M).
// Requires the user to be authenticated (role: 'user' or 'admin').

const UserType = require("../types/UserType");
const db = require("../../models");
const { requireAuth } = require("../../utils/auth");
const { GraphQLError } = require("graphql");

const meQuery = {
  type: UserType,
  resolve: async (_, __, context) => {
    // Ensure user is authenticated
    requireAuth(context);

    const userId = context.user.id; // ← taken from context, NOT from arguments

    try {
      const user = await db.User.findByPk(userId, {
        include: [
          {
            model: db.Settings,
            as: 'Setting',
            attributes: ['id', 'currency', 'timezone']
          },
          {
            model: db.Expense,
            as: 'Expenses',
            attributes: ['id', 'description', 'amount', 'date'],
            include: [
              {
                model: db.Category,
                as: 'Category',
                attributes: ['id', 'name']
              }
            ]
          }
        ]
      });

      if (!user) {
        throw new GraphQLError("User not found");
      }

      return user;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      throw new GraphQLError("Failed to fetch user profile");
    }
  }
};

module.exports = meQuery;