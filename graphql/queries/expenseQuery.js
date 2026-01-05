// expensesQuery.js
// Fetches expenses for the currently authenticated user with simple offset-based pagination.
// The user ID is taken from the GraphQL context (JWT token), NOT from input arguments.
// Returns paginated expenses with nested category and user data.
// Requires the user to be authenticated (role: 'user' or 'admin').

const { GraphQLList, GraphQLInt } = require('graphql');
const ExpenseType = require("../types/ExpenseType");
const db = require("../../models");
const { requireUser } = require("../../utils/auth");
const { GraphQLError } = require("graphql");

const expensesQuery = {
  type: new GraphQLList(ExpenseType),
  args: {
    offset: {
      type: GraphQLInt,
      defaultValue: 0
    },
    limit: {
      type: GraphQLInt,
      defaultValue: 10
    }
  },
  resolve: async (_, args, context) => {
    // Enforce authentication and role (user or admin)
    requireUser(context);

    const userId = context.user.id; // ← taken from context, NOT from args
    const { offset = 0, limit = 10 } = args;

    // Safety: cap the limit to prevent abuse
    const safeLimit = Math.min(limit, 100);

    try {
      const expenses = await db.Expense.findAll({
        where: { userId },
        offset: offset,
        limit: safeLimit,
        include: [
          {
            model: db.User,
            as: 'user',
            attributes: ['id', 'username']
          },
          {
            model: db.Category,
            as: 'category',
            attributes: ['id', 'name']
          }
        ],
        order: [['date', 'DESC'], ['id', 'DESC']]
      });

      return expenses;
    } catch (error) {
      console.error("Error fetching expenses:", error);
      throw new GraphQLError("Failed to fetch expenses");
    }
  }
};

module.exports = expensesQuery;