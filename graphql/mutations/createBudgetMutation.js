// createBudgetMutation.js
// Creates a new budget and associates it with the authenticated user.
// The budget can later be shared with other users (M:M relation).
// Returns the full budget object with the owning user.

const BudgetType = require("../types/BudgetType");
const { GraphQLString, GraphQLFloat } = require("graphql");
const db = require("../../models");
const { requireUser } = require("../../utils/auth");
const { GraphQLError } = require("graphql");

const createBudgetMutation = {
  type: BudgetType,
  args: {
    name: { type: GraphQLString },
    amount: { type: GraphQLFloat },
    startDate: { type: GraphQLString },
    endDate: { type: GraphQLString }
  },
  resolve: async (_, args, context) => {
    requireUser(context);

    const { name, amount, startDate, endDate } = args;
    const userId = context.user.id;

    if (!name || !amount) {
      throw new GraphQLError("Name and amount are required");
    }

    if (amount <= 0) {
      throw new GraphQLError("Amount must be positive");
    }

    const budget = await db.Budget.create({
      name,
      amount,
      startDate: startDate || null,
      endDate: endDate || null
    });

    // Associate with the current user
    await budget.addUser(userId);

    // Reload with user association
    return await budget.reload({
      include: [{ model: db.User, attributes: ['id', 'username'] }]
    });
  }
};

module.exports = createBudgetMutation;