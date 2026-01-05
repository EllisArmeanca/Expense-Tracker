// createExpenseMutation.js
// Creates a new expense for the currently authenticated user.
// The user ID is taken from the GraphQL context (JWT token), NOT from input arguments.
// Requires the user to be authenticated (role: 'user' or 'admin').
// Returns the full expense object with nested user and category.

const ExpenseType = require("../types/ExpenseType");
const CreateExpenseInputType = require("../inputTypes/CreateExpenseInputType");
const db = require("../../models");
const { requireUser } = require("../../utils/auth");
const { GraphQLError } = require("graphql");

const createExpenseMutation = {
  type: ExpenseType,
  args: {
    input: {
      type: CreateExpenseInputType,
    }
  },
  resolve: async (_, args, context) => {
    // Enforce authentication and role (user or admin)
    requireUser(context);

    const { categoryId, description, amount, date } = args.input;
    const userId = context.user.id; // ← taken from context, NOT from args

    // Validate required fields
    if (amount == null || amount <= 0) {
      throw new GraphQLError("Amount must be a positive number");
    }
    if (!date) {
      throw new GraphQLError("Date is required (format: YYYY-MM-DD)");
    }

    try {
      const expense = await db.Expense.create({
        userId,
        categoryId: categoryId || null, // optional
        description: description || null,
        amount,
        date,
      });

      // Reload to include associations (user, category) for nested response
      return await expense.reload({
        include: [
          { model: db.User, attributes: ['id', 'username'] },
          { model: db.Category, attributes: ['id', 'name'] }
        ]
      });
    } catch (error) {
      console.error("Error creating expense:", error);
      throw new GraphQLError("Failed to create expense");
    }
  }
};

module.exports = createExpenseMutation;