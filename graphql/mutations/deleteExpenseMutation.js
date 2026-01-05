// deleteExpenseMutation.js
// Deletes an expense belonging to the authenticated user.
// The user can only delete their own expenses.
// Returns the ID of the deleted expense.

const { GraphQLInt, GraphQLObjectType, GraphQLString } = require("graphql");
const db = require("../../models");
const { requireUser } = require("../../utils/auth");
const { GraphQLError } = require("graphql");

// Define a simple return type
const DeleteExpenseResultType = new GraphQLObjectType({
  name: "DeleteExpenseResult",
  fields: {
    id: { type: GraphQLInt },
    message: { type: GraphQLString }
  }
});

const deleteExpenseMutation = {
  type: DeleteExpenseResultType,
  args: {
    id: { type: GraphQLInt }
  },
  resolve: async (_, args, context) => {
    requireUser(context);

    const { id } = args;
    const userId = context.user.id;

    if (!id) {
      throw new GraphQLError("Expense ID is required");
    }

    const expense = await db.Expense.findByPk(id);
    if (!expense) {
      throw new GraphQLError("Expense not found");
    }

    if (expense.userId !== userId) {
      throw new GraphQLError("You can only delete your own expenses");
    }

    await expense.destroy();

    return {
      id,
      message: "Expense deleted successfully"
    };
  }
};

module.exports = deleteExpenseMutation;