// src/controllers/expense.controller.js
import db from '../../models/index.js';
const { Expense, User } = db;

// Get all expenses
export const getExpenses = async () => {
  try {
    // Temporarily removing include to troubleshoot
    return await Expense.findAll({
      order: [['date', 'DESC']]
    });
  } catch (error) {
    throw new Error(`Failed to fetch expenses: ${error.message}`);
  }
};

// Get expenses for authenticated user
export const getUserExpenses = async (userId) => {
  try {
    // Temporarily removing include to troubleshoot
    return await Expense.findAll({
      where: { userId },
      order: [['date', 'DESC']]
    });
  } catch (error) {
    throw new Error(`Failed to fetch user expenses: ${error.message}`);
  }
};

// Get expense by ID
export const getExpenseById = async (id, userId) => {
  try {
    const expense = await Expense.findByPk(id);

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

    // Return expense without reloading with associations for troubleshooting
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

    const updatedExpense = await Expense.findByPk(id); // Removed include for troubleshooting

    return updatedExpense;
  } catch (error) {
    throw new Error(`Failed to update expense: ${error.message}`);
  }
};

// Helper function to generate IDs similar to Prisma's cuid()
function generateExpenseId() {
  // console.log('DEBUG: generateExpenseId function called');
  const id = 'expense_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  // console.log('DEBUG: Generated expense ID:', id);
  return id;
}

function generateTagId() {
  const id = 'tag_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  return id;
}

function generateExpenseTagId() {
  const id = 'exp_tag_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  return id;
}

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
// Note: generateExpenseId is defined later in the file to avoid duplication

// Get expenses with filtering options
export const getExpensesWithFilters = async ({ userId, tagIds, excludeTagIds, dateFrom, dateTo, withoutTags }) => {
  try {
    // Build a raw SQL query with proper JOINs for efficient filtering
    let query = `
      SELECT DISTINCT e.*
      FROM expenses e
      LEFT JOIN expense_tags et ON e.id = et.expense_id
      LEFT JOIN tags t ON et.tag_id = t.id
    `;

    const conditions = [];
    const params = [];

    // Add conditions based on filters
    if (userId) {
      conditions.push(`e.user_id = ?`);
      params.push(userId);
    }

    // Date filtering
    if (dateFrom && dateTo) {
      conditions.push(`e.date BETWEEN ? AND ?`);
      params.push(new Date(dateFrom), new Date(dateTo));
    } else if (dateFrom) {
      conditions.push(`e.date >= ?`);
      params.push(new Date(dateFrom));
    } else if (dateTo) {
      conditions.push(`e.date <= ?`);
      params.push(new Date(dateTo));
    }

    // Include tag filtering (all specified tags must be present)
    if (tagIds && tagIds.length > 0) {
      for (let i = 0; i < tagIds.length; i++) {
        const tagId = tagIds[i];
        // For each required tag, join the junction table again to enforce ALL tags condition
        query += ` INNER JOIN expense_tags et_req_${i} ON e.id = et_req_${i}.expense_id AND et_req_${i}.tag_id = ?`;
        params.push(tagId);
      }
    }

    // Exclude tag filtering
    if (excludeTagIds && excludeTagIds.length > 0) {
      // Using NOT EXISTS to exclude expenses that have any of the excluded tags
      query += ` WHERE NOT EXISTS (
        SELECT 1 FROM expense_tags et_excl
        WHERE et_excl.expense_id = e.id
        AND et_excl.tag_id IN (${excludeTagIds.map(() => '?').join(',')})
      )`;
      params.push(...excludeTagIds);
    }

    // Combine conditions
    if (conditions.length > 0) {
      const whereClause = conditions.join(' AND ');
      query += (excludeTagIds && excludeTagIds.length > 0) ? ` AND ${whereClause}` : ` WHERE ${whereClause}`;
    }

    query += ` ORDER BY e.date DESC`;

    // Execute the main query to get filtered expense IDs
    const filteredExpenseIds = await db.sequelize.query(query, {
      replacements: params,
      type: db.sequelize.QueryTypes.SELECT
    });

    // If we need expenses WITHOUT any tags
    if (withoutTags) {
      // Modify the query to get expenses with no tags
      let noTagQuery = `
        SELECT e.*
        FROM expenses e
        LEFT JOIN expense_tags et ON e.id = et.expense_id
        WHERE et.expense_id IS NULL
      `;

      const noTagParams = [];

      if (userId) {
        noTagQuery += ` AND e.user_id = ?`;
        noTagParams.push(userId);
      }

      if (dateFrom && dateTo) {
        noTagQuery += ` AND e.date BETWEEN ? AND ?`;
        noTagParams.push(new Date(dateFrom), new Date(dateTo));
      } else if (dateFrom) {
        noTagQuery += ` AND e.date >= ?`;
        noTagParams.push(new Date(dateFrom));
      } else if (dateTo) {
        noTagQuery += ` AND e.date <= ?`;
        noTagParams.push(new Date(dateTo));
      }

      noTagQuery += ` ORDER BY e.date DESC`;

      const noTagExpenses = await db.sequelize.query(noTagQuery, {
        replacements: noTagParams,
        type: db.sequelize.QueryTypes.SELECT
      });

      // Now get full details for these expenses with their (non-existent) tags
      if (noTagExpenses.length > 0) {
        const expenseIds = noTagExpenses.map(e => e.id);
        // Fetch with includes for tags
        return await Expense.findAll({
          where: { id: expenseIds },
          include: [{
            model: db.Tag,
            as: 'tags',
            through: { attributes: [] },
            attributes: ['id', 'name', 'createdAt', 'updatedAt']
          }],
          order: [['date', 'DESC']]
        });
      }
      return [];
    }

    // Now fetch the detailed expenses with their tags for the filtered IDs
    if (filteredExpenseIds.length > 0) {
      const expenseIds = filteredExpenseIds.map(e => e.id);
      return await Expense.findAll({
        where: { id: expenseIds },
        include: [{
          model: db.Tag,
          as: 'tags',
          through: { attributes: [] },
          attributes: ['id', 'name', 'createdAt', 'updatedAt']
        }],
        order: [['date', 'DESC']]
      });
    }

    return [];
  } catch (error) {
    throw new Error(`Failed to fetch expenses with filters: ${error.message}`);
  }
};

// Get all tags
export const getAllTags = async () => {
  try {
    return await db.Tag.findAll({
      include: [{
        model: db.Expense,
        as: 'expenses',
        attributes: [] // Don't include expense data, just for counting
      }],
      order: [['name', 'ASC']]
    });
  } catch (error) {
    throw new Error(`Failed to fetch tags: ${error.message}`);
  }
};

// Get tag by ID
export const getTagById = async (id) => {
  try {
    const tag = await db.Tag.findByPk(id, {
      include: [{
        model: db.Expense,
        as: 'expenses',
        attributes: ['id', 'title', 'amount', 'date', 'category']
      }]
    });

    if (!tag) {
      throw new Error('Tag not found');
    }

    return tag;
  } catch (error) {
    throw new Error(`Failed to fetch tag: ${error.message}`);
  }
};

// Create a new tag
export const createTag = async ({ name, icon }) => {
  try {
    // Check if a tag with this name already exists
    const existingTag = await db.Tag.findOne({
      where: { name: name.trim() }
    });

    if (existingTag) {
      throw new Error('A tag with this name already exists');
    }

    const tag = await db.Tag.create({
      id: generateTagId(),
      name: name.trim(),
      icon: icon || null  // Allow icon to be optional
    });

    return tag;
  } catch (error) {
    throw new Error(`Failed to create tag: ${error.message}`);
  }
};

// Update a tag
export const updateTag = async (id, updates) => {
  try {
    const updateData = { ...updates };

    // Process the updates
    if (updates.name) {
      updateData.name = updates.name.trim();
    }

    if (updates.icon !== undefined) {
      updateData.icon = updates.icon;
    }

    const [updatedRowsCount] = await db.Tag.update(updateData, { where: { id } });

    if (updatedRowsCount === 0) {
      throw new Error('Tag not found');
    }

    const updatedTag = await db.Tag.findByPk(id);
    return updatedTag;
  } catch (error) {
    throw new Error(`Failed to update tag: ${error.message}`);
  }
};

// Delete a tag
export const deleteTag = async (id) => {
  try {
    const deletedRowCount = await db.Tag.destroy({
      where: { id }
    });

    return deletedRowCount > 0;
  } catch (error) {
    throw new Error(`Failed to delete tag: ${error.message}`);
  }
};

// Add a tag to an expense
export const addTagToExpense = async (expenseId, tagId) => {
  try {
    // Verify that both expense and tag exist
    const expense = await Expense.findByPk(expenseId);
    const tag = await db.Tag.findByPk(tagId);

    if (!expense) {
      throw new Error('Expense not found');
    }

    if (!tag) {
      throw new Error('Tag not found');
    }

    // Add the tag to the expense (this creates the junction record)
    await expense.addTag(tagId, { through: { id: generateExpenseTagId() }});

    // Return the updated expense with tags
    const updatedExpense = await Expense.findByPk(expenseId, {
      include: [{
        model: db.Tag,
        as: 'tags',
        through: { attributes: [] },
        attributes: ['id', 'name', 'createdAt', 'updatedAt']
      }]
    });

    return updatedExpense;
  } catch (error) {
    throw new Error(`Failed to add tag to expense: ${error.message}`);
  }
};

// Remove a tag from an expense
export const removeTagFromExpense = async (expenseId, tagId) => {
  try {
    // Verify that both expense and tag exist
    const expense = await Expense.findByPk(expenseId);
    const tag = await db.Tag.findByPk(tagId);

    if (!expense) {
      throw new Error('Expense not found');
    }

    if (!tag) {
      throw new Error('Tag not found');
    }

    // Remove the tag from the expense (this removes the junction record)
    await expense.removeTag(tagId);

    // Return the updated expense with remaining tags
    const updatedExpense = await Expense.findByPk(expenseId, {
      include: [{
        model: db.Tag,
        as: 'tags',
        through: { attributes: [] },
        attributes: ['id', 'name', 'createdAt', 'updatedAt']
      }]
    });

    return updatedExpense;
  } catch (error) {
    throw new Error(`Failed to remove tag from expense: ${error.message}`);
  }
};