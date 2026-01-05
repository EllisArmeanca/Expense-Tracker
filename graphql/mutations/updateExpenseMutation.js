// updateExpenseMutation.js
// Updates an existing expense belonging to the authenticated user.
// The user can only update their own expenses.
// Returns the updated expense with full nested objects.

const ExpenseType = require("../types/ExpenseType");
const { GraphQLInt, GraphQLString, GraphQLFloat } = require("graphql");
const db = require("../../models");
const { requireUser } = require("../../utils/auth");
const { GraphQLError } = require("graphql");

const updateExpenseMutation = {
  type: ExpenseType,
  args: {
    id: { type: GraphQLInt },
    categoryId: { type: GraphQLInt },
    description: { type: GraphQLString },
    amount: { type: GraphQLFloat },
    date: { type: GraphQLString }
  },
  resolve: async (_, args, context) => {
    requireUser(context);

    const { id, categoryId, description, amount, date } = args;
    const userId = context.user.id;

    if (!id) {
      throw new GraphQLError("Expense ID is required");
    }

    const expense = await db.Expense.findByPk(id);
    if (!expense) {
      throw new GraphQLError("Expense not found");
    }

    // Ensure user owns this expense
    if (expense.userId !== userId) {
      throw new GraphQLError("You can only update your own expenses");
    }

    // Update only provided fields
    const updateData = {};
    if (categoryId !== undefined) updateData.categoryId = categoryId || null;
    if (description !== undefined) updateData.description = description;
    if (amount !== undefined) {
      if (amount <= 0) throw new GraphQLError("Amount must be positive");
      updateData.amount = amount;
    }
    if (date !== undefined) updateData.date = date;

    await expense.update(updateData);

    // Reload with associations
    return await expense.reload({
      include: [
        { model: db.User, attributes: ['id', 'username'] },
        { model: db.Category, attributes: ['id', 'name'] }
      ]
    });
  }
};

module.exports = updateExpenseMutation;