// budgetsQuery.js
// Fetches all budgets associated with the authenticated user.
// Returns full budget objects with nested user participants.

const { GraphQLList } = require('graphql');
const BudgetType = require("../types/BudgetType");
const db = require("../../models");
const { requireUser } = require("../../utils/auth");
const { GraphQLError } = require("graphql");

const budgetsQuery = {
  type: new GraphQLList(BudgetType),
  resolve: async (_, __, context) => {
    requireUser(context);

    const userId = context.user.id;

    try {
      const budgets = await db.Budget.findAll({
        include: [
          {
            model: db.User,
            as: 'users',
            attributes: ['id', 'username']
          }
        ],
        where: {
          '$users.id$': userId // Only budgets where this user is a participant
        }
      });

      return budgets;
    } catch (error) {
      console.error("Error fetching budgets:", error);
      throw new GraphQLError("Failed to fetch budgets");
    }
  }
};

module.exports = budgetsQuery;