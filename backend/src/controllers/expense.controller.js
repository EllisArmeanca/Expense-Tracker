// src/controllers/expense.controller.js
import db from '../../models/index.js';
const { Expense, User } = db;

// Get all expenses
export const getExpenses = async () => {
  try {
    return await Expense.findAll({
      include: [{
        model: User,
        as: 'user'
      }],
      order: [['date', 'DESC']]
    });
  } catch (error) {
    throw new Error(`Failed to fetch expenses: ${error.message}`);
  }
};

// Get expenses for authenticated user
export const getUserExpenses = async (userId) => {
  try {
    return await Expense.findAll({
      where: { userId },
      include: [{
        model: User,
        as: 'user'
      }],
      order: [['date', 'DESC']]
    });
  } catch (error) {
    throw new Error(`Failed to fetch user expenses: ${error.message}`);
  }
};

// Get expense by ID
export const getExpenseById = async (id, userId) => {
  try {
    const expense = await Expense.findByPk(id, {
      include: [{
        model: User,
        as: 'user'
      }]
    });

    if (!expense) {
      throw new Error('Expense not found');
    }

    // Check if the expense belongs to the user making the request
    if (userId && expense.userId !== userId) {
      throw new Error('Unauthorized: You can only view your own expenses');
    }

    return expense;
  } catch (error) {
    throw new Error(`Failed to fetch expense: ${error.message}`);
  }
};

// Create a new expense
export const createExpense = async ({ title, amount, category, date, userId }) => {
  try {
    // Validate that user exists
    const user = await User.findByPk(userId);

    if (!user) {
      throw new Error('User not found');
    }

    // Create the expense
    const expense = await Expense.create({
      id: generateExpenseId(),
      title,
      amount: parseFloat(amount),
      category,
      date: new Date(date),
      userId
    });

    // Include the user in the response
    await expense.reload({
      include: [{
        model: User,
        as: 'user'
      }]
    });

    return expense;
  } catch (error) {
    throw new Error(`Failed to create expense: ${error.message}`);
  }
};

// Update an expense
export const updateExpense = async (id, updates, userId) => {
  try {
    // Check if the expense belongs to the user (for authorization)
    const expense = await Expense.findByPk(id);
    if (!expense) {
      throw new Error('Expense not found');
    }

    if (expense.userId !== userId) {
      throw new Error('Unauthorized: You can only update your own expenses');
    }

    const [updatedRowsCount] = await Expense.update({
      ...updates,
      amount: updates.amount ? parseFloat(updates.amount) : undefined,
      date: updates.date ? new Date(updates.date) : undefined
    }, {
      where: { id }
    });

    if (updatedRowsCount === 0) {
      throw new Error('Expense not found');
    }

    const updatedExpense = await Expense.findByPk(id, {
      include: [{
        model: User,
        as: 'user'
      }]
    });

    return updatedExpense;
  } catch (error) {
    throw new Error(`Failed to update expense: ${error.message}`);
  }
};

// Delete an expense
export const deleteExpense = async (id, userId) => {
    try {
      // Check if the expense belongs to the user (for authorization)
      const expense = await Expense.findByPk(id);
      if (!expense) {
        throw new Error('Expense not found');
      }

      if (expense.userId !== userId) {
        throw new Error('Unauthorized: You can only delete your own expenses');
      }

      const deletedRowCount = await Expense.destroy({
        where: { id }
      });
      return deletedRowCount > 0;
    } catch (error) {
      throw new Error(`Failed to delete expense: ${error.message}`);
    }
  };

// Helper function to generate IDs similar to Prisma's cuid()
function generateExpenseId() {
  return 'expense_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}