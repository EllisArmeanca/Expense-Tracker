// src/controllers/expense.controller.js
import db from '../../models/index.js';
import { Op } from 'sequelize';
const { Expense, User } = db;

// Get all expenses
export const getExpenses = async () => {
  try {
    const expenses = await Expense.findAll({
      include: [
        {
          model: db.User,
          as: 'user',
          attributes: ['id', 'name']
        },
        {
          model: db.Tag,
          as: 'tags',
          through: { attributes: [] },
          attributes: ['id', 'name', 'icon', 'createdAt', 'updatedAt']
        }
      ],
      order: [['date', 'DESC']]
    });

    // Format dates properly to ensure they are in ISO string format rather than timestamps
    return expenses.map(expense => ({
      ...expense.toJSON(),
      date: expense.date ? new Date(expense.date).toISOString() : null,
      createdAt: expense.createdAt ? new Date(expense.createdAt).toISOString() : null,
      updatedAt: expense.updatedAt ? new Date(expense.updatedAt).toISOString() : null
    }));
  } catch (error) {
    throw new Error(`Failed to fetch expenses: ${error.message}`);
  }
};

// Get expenses for authenticated user
export const getUserExpenses = async (userId) => {
  try {
    const expenses = await Expense.findAll({
      where: { userId },
      include: [
        {
          model: db.User,
          as: 'user',
          attributes: ['id', 'name']
        },
        {
          model: db.Tag,
          as: 'tags',
          through: { attributes: [] },
          attributes: ['id', 'name', 'icon', 'createdAt', 'updatedAt']
        }
      ],
      order: [['date', 'DESC']]
    });

    // Format dates properly to ensure they are in ISO string format rather than timestamps
    return expenses.map(expense => ({
      ...expense.toJSON(),
      date: expense.date ? new Date(expense.date).toISOString() : null,
      createdAt: expense.createdAt ? new Date(expense.createdAt).toISOString() : null,
      updatedAt: expense.updatedAt ? new Date(expense.updatedAt).toISOString() : null
    }));
  } catch (error) {
    throw new Error(`Failed to fetch user expenses: ${error.message}`);
  }
};

// Get expense by ID
export const getExpenseById = async (id, userId) => {
  try {
    const expense = await Expense.findByPk(id, {
      include: [
        {
          model: db.User,
          as: 'user',
          attributes: ['id', 'name']
        },
        {
          model: db.Tag,
          as: 'tags',
          through: { attributes: [] },
          attributes: ['id', 'name', 'icon', 'createdAt', 'updatedAt']
        }
      ]
    });

    if (!expense) {
      throw new Error('Expense not found');
    }

    // Check if the expense belongs to the user making the request
    if (userId && expense.userId !== userId) {
      throw new Error('Unauthorized: You can only view your own expenses');
    }

    // Format dates properly to ensure they are in ISO string format rather than timestamps
    return {
      ...expense.toJSON(),
      date: expense.date ? new Date(expense.date).toISOString() : null,
      createdAt: expense.createdAt ? new Date(expense.createdAt).toISOString() : null,
      updatedAt: expense.updatedAt ? new Date(expense.updatedAt).toISOString() : null
    };
  } catch (error) {
    throw new Error(`Failed to fetch expense: ${error.message}`);
  }
};

// Create a new expense
export const createExpense = async ({ title, amount, date, tagIds }, authenticatedUserId) => {
  try {
    // Validate that user exists
    const user = await User.findByPk(authenticatedUserId);

    if (!user) {
      throw new Error('User not found');
    }

    // Create the expense
    const expense = await Expense.create({
      id: generateExpenseId(),
      title,
      amount: parseFloat(amount),
      date: new Date(date),
      userId: authenticatedUserId
    });

    // If tagIds were provided (not null), verify they belong to the user and associate them
    if (tagIds !== undefined && tagIds !== null && tagIds.length > 0) {
      // Validate that the tags belong to the current user
      const userTags = await db.Tag.findAll({
        where: {
          id: tagIds,
          userId: authenticatedUserId
        }
      });

      if (userTags.length !== tagIds.length) {
        // Some tags don't belong to the user
        const validTagIds = userTags.map(tag => tag.id);
        const invalidTagIds = tagIds.filter(id => !validTagIds.includes(id));
        throw new Error(`Invalid tag IDs provided. You don't own these tags: ${invalidTagIds.join(', ')}`);
      }

      // Create associations manually in the junction table to ensure proper ID generation
      if (userTags.length > 0) {
        for (const tag of userTags) {
          await db.sequelize.query(
            `INSERT INTO expense_tags (id, expense_id, tag_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?)`,
            {
              replacements: [generateExpenseTagId(), expense.id, tag.id, new Date(), new Date()],
              type: db.sequelize.QueryTypes.INSERT
            }
          );
        }
      }
    }

    // Return the expense with tags and user
    const expenseWithTags = await Expense.findByPk(expense.id, {
      include: [
        {
          model: db.User,
          as: 'user',
          attributes: ['id', 'name'] // Only include necessary user fields
        },
        {
          model: db.Tag,
          as: 'tags',
          through: { attributes: [] },
          attributes: ['id', 'name', 'icon', 'createdAt', 'updatedAt']
        }
      ]
    });

    return expenseWithTags;
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

    // Extract tagIds if provided, and other updates separately
    const { tagIds, ...otherUpdates } = updates;

    // Remove category from updates if it's included (since we removed the field)
    const { category, ...cleanedUpdates } = otherUpdates;

    // Update the expense with other fields
    const [updatedRowsCount] = await Expense.update({
      ...cleanedUpdates,
      amount: cleanedUpdates.amount ? parseFloat(cleanedUpdates.amount) : undefined,
      date: cleanedUpdates.date ? new Date(cleanedUpdates.date) : undefined
    }, {
      where: { id }
    });

    if (updatedRowsCount === 0) {
      throw new Error('Expense not found');
    }

    // If tagIds were provided (not undefined/null), update the tags
    if (tagIds !== undefined && tagIds !== null) {
      if (Array.isArray(tagIds)) {
        // Validate that the tags belong to the current user
        if (tagIds.length > 0) {
          const userTags = await db.Tag.findAll({
            where: {
              id: tagIds,
              userId: userId
            }
          });

          if (userTags.length !== tagIds.length) {
            // Some tags don't belong to the user
            const validTagIds = userTags.map(tag => tag.id);
            const invalidTagIds = tagIds.filter(id => !validTagIds.includes(id));
            throw new Error(`Invalid tag IDs provided. You don't own these tags: ${invalidTagIds.join(', ')}`);
          }

          // Clear existing tags first
          await expense.setTags([]); // This removes all current tag associations
          // Manually create the many-to-many associations to ensure junction table IDs are properly set
          if (userTags.length > 0) {
            for (const tag of userTags) {
              await db.sequelize.query(
                `INSERT INTO expense_tags (id, expense_id, tag_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?)`,
                {
                  replacements: [generateExpenseTagId(), expense.id, tag.id, new Date(), new Date()],
                  type: db.sequelize.QueryTypes.INSERT
                }
              );
            }
          }
        } else {
          // Empty array means remove all tags
          await expense.setTags([]);
        }
      }
    }

    // Return the updated expense with tags and user
    const updatedExpense = await Expense.findByPk(id, {
      include: [
        {
          model: db.User,
          as: 'user',
          attributes: ['id', 'name'] // Only include necessary user fields
        },
        {
          model: db.Tag,
          as: 'tags',
          through: { attributes: [] },
          attributes: ['id', 'name', 'icon', 'createdAt', 'updatedAt']
        }
      ]
    });

    // Format dates properly to ensure they are in ISO string format rather than timestamps
    return {
      ...updatedExpense.toJSON(),
      date: updatedExpense.date ? new Date(updatedExpense.date).toISOString() : null,
      createdAt: updatedExpense.createdAt ? new Date(updatedExpense.createdAt).toISOString() : null,
      updatedAt: updatedExpense.updatedAt ? new Date(updatedExpense.updatedAt).toISOString() : null
    };
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
    // Validate that the tags being used belong to the current user
    if (userId) {
      if (tagIds && tagIds.length > 0) {
        const validTags = await db.Tag.findAll({
          where: {
            id: tagIds,
            userId: userId
          },
          attributes: ['id']
        });

        const validTagIds = validTags.map(tag => tag.id);

        // If there are invalid tag IDs, filter to only valid ones
        if (validTagIds.length !== tagIds.length) {
          console.warn(`Some requested tag IDs do not belong to user ${userId}. Valid tags: ${validTagIds}`);
          tagIds = validTagIds; // Use only valid tag IDs

          // If no valid tags remain, return empty result
          if (tagIds.length === 0) {
            return [];
          }
        }
      }

      if (excludeTagIds && excludeTagIds.length > 0) {
        const validExcludeTags = await db.Tag.findAll({
          where: {
            id: excludeTagIds,
            userId: userId
          },
          attributes: ['id']
        });

        const validExcludeTagIds = validExcludeTags.map(tag => tag.id);

        if (validExcludeTagIds.length !== excludeTagIds.length) {
          console.warn(`Some exclude tag IDs do not belong to user ${userId}. Valid exclude tags: ${validExcludeTagIds}`);
          excludeTagIds = validExcludeTagIds;
        }
      }
    }

    // Basic query without tags
    let queryOptions = {
      where: {},
      include: [
        {
          model: db.User,
          as: 'user',
          attributes: ['id', 'name']
        },
        {
          model: db.Tag,
          as: 'tags',
          through: { attributes: [] },
          attributes: ['id', 'name', 'createdAt', 'updatedAt']
        }
      ],
      order: [['date', 'DESC']]
    };

    // Apply user filter
    if (userId) {
      queryOptions.where.userId = userId;
    }

    // Apply date filters
    if (dateFrom && dateTo) {
      queryOptions.where.date = {
        [Op.between]: [new Date(dateFrom), new Date(dateTo)]
      };
    } else if (dateFrom) {
      queryOptions.where.date = {
        [Op.gte]: new Date(dateFrom)
      };
    } else if (dateTo) {
      queryOptions.where.date = {
        [Op.lte]: new Date(dateTo)
      };
    }

    // Handle expenses without tags
    if (withoutTags) {
      // First, find expenses without tags that match other criteria
      const expensesWithoutTags = await Expense.findAll({
        where: queryOptions.where,
        include: [{
          model: db.Tag,
          as: 'tags',
          required: false // LEFT JOIN to include expenses even without tags
        }],
        attributes: ['id', 'title', 'amount', 'date', 'createdAt', 'updatedAt'],
        order: [['date', 'DESC']],
        having: db.sequelize.where(
          db.sequelize.fn('COUNT', db.sequelize.col('tags.id')),
          0
        ),
        group: ['Expense.id']
      });

      // Then get the same expenses with user and tag associations
      const expenseIds = expensesWithoutTags.map(e => e.id);
      if (expenseIds.length === 0) {
        return [];
      }

      return await Expense.findAll({
        where: { id: expenseIds },
        include: queryOptions.include,
        order: [['date', 'DESC']]
      });
    }

    // Get all expenses that match base criteria (user, date)
    let baseExpenses = await Expense.findAll({
      where: queryOptions.where,
      attributes: ['id'],
      order: []
    });

    let baseExpenseIds = baseExpenses.map(e => e.id);

    // First apply tag EXCLUSION (remove expenses that have excluded tags)
    if (excludeTagIds && excludeTagIds.length > 0) {
      // Find all expenses that have any of the excluded tags
      const expensesWithExcludedTags = await Expense.findAll({
        where: { id: baseExpenseIds },
        include: [{
          model: db.Tag,
          as: 'tags',
          where: { id: excludeTagIds },
          required: true,
          attributes: []
        }],
        attributes: ['id'],
        order: []
      });

      const excludedExpenseIds = expensesWithExcludedTags.map(e => e.id);
      baseExpenseIds = baseExpenseIds.filter(id => !excludedExpenseIds.includes(id));
    }

    // Then apply tag INCLUSION (find expenses that have ALL required tags)
    if (tagIds && tagIds.length > 0) {
      // Find expenses that have ALL the required tags - using intersection
      if (baseExpenseIds.length > 0) {
        for (const tagId of tagIds) {
          const expensesWithThisTag = await Expense.findAll({
            where: { id: baseExpenseIds },
            include: [{
              model: db.Tag,
              as: 'tags',
              where: { id: tagId },
              required: true,
              attributes: []
            }],
            attributes: ['id'],
            order: []
          });

          const expenseIdsWithThisTag = expensesWithThisTag.map(e => e.id);
          // Keep only expenses that have this specific tag
          baseExpenseIds = baseExpenseIds.filter(id => expenseIdsWithThisTag.includes(id));

          // If no expenses match this tag requirement, there will be no results
          if (baseExpenseIds.length === 0) {
            return [];
          }
        }
      } else {
        // If no base expenses exist but tag filters were specified, try to get them directly
        const firstTagExpenses = await Expense.findAll({
          where: queryOptions.where, // Apply base filters like user and date
          include: [{
            model: db.Tag,
            as: 'tags',
            where: { id: tagIds[0] },
            required: true,
            attributes: []
          }],
          attributes: ['id'],
          order: []
        });

        let expenseIdsWithFirstTag = firstTagExpenses.map(e => e.id);

        // Now ensure these expenses have ALL the other tags too
        for (let i = 1; i < tagIds.length; i++) {
          const expensesWithThisOtherTag = await Expense.findAll({
            where: { id: expenseIdsWithFirstTag },
            include: [{
              model: db.Tag,
              as: 'tags',
              where: { id: tagIds[i] },
              required: true,
              attributes: []
            }],
            attributes: ['id'],
            order: []
          });

          const validIds = expensesWithThisOtherTag.map(e => e.id);
          expenseIdsWithFirstTag = expenseIdsWithFirstTag.filter(id => validIds.includes(id));

          if (expenseIdsWithFirstTag.length === 0) {
            return [];
          }
        }
        baseExpenseIds = expenseIdsWithFirstTag;
      }
    }

    // If no expenses match all criteria, return empty array
    if (baseExpenseIds.length === 0) {
      return [];
    }

    // Finally, return the expenses with all their detailed associations
    const expenses = await Expense.findAll({
      where: { id: baseExpenseIds },
      include: queryOptions.include,
      order: [['date', 'DESC']]
    });

    // Format dates properly to ensure they are in ISO string format rather than timestamps
    return expenses.map(expense => ({
      ...expense.toJSON(),
      date: expense.date ? new Date(expense.date).toISOString() : null,
      createdAt: expense.createdAt ? new Date(expense.createdAt).toISOString() : null,
      updatedAt: expense.updatedAt ? new Date(expense.updatedAt).toISOString() : null
    }));
  } catch (error) {
    throw new Error(`Failed to fetch expenses with filters: ${error.message}`);
  }
};

// Get all tags for a specific user
export const getUserTags = async (userId) => {
  try {
    return await db.Tag.findAll({
      where: { userId },
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
export const createTag = async ({ name, icon, userId }) => {
  try {
    // Check if a tag with this name already exists for this user
    const existingTag = await db.Tag.findOne({
      where: {
        name: name.trim(),
        userId: userId
      }
    });

    if (existingTag) {
      throw new Error('A tag with this name already exists for this user');
    }

    const tag = await db.Tag.create({
      id: generateTagId(),
      name: name.trim(),
      icon: icon || null,  // Allow icon to be optional
      userId: userId
    });

    return tag;
  } catch (error) {
    throw new Error(`Failed to create tag: ${error.message}`);
  }
};

// Update a tag
export const updateTag = async (id, updates, userId) => {
  try {
    // First check if the tag exists and belongs to the user
    const existingTag = await db.Tag.findOne({
      where: { id, userId }
    });

    if (!existingTag) {
      throw new Error('Tag not found or unauthorized');
    }

    const updateData = { ...updates };

    // Process the updates
    if (updates.name) {
      updateData.name = updates.name.trim();

      // Check if a tag with this name already exists for this user (avoid duplicates)
      const duplicateTag = await db.Tag.findOne({
        where: {
          name: updateData.name,
          userId: userId,
          id: { [Op.ne]: id } // Exclude current tag from check
        }
      });

      if (duplicateTag) {
        throw new Error('A tag with this name already exists for this user');
      }
    }

    if (updates.icon !== undefined) {
      updateData.icon = updates.icon;
    }

    const [updatedRowsCount] = await db.Tag.update(updateData, {
      where: { id, userId }
    });

    if (updatedRowsCount === 0) {
      throw new Error('Tag not found or unauthorized');
    }

    const updatedTag = await db.Tag.findByPk(id);
    return updatedTag;
  } catch (error) {
    throw new Error(`Failed to update tag: ${error.message}`);
  }
};

// Delete a tag
export const deleteTag = async (id, userId) => {
  try {
    const deletedRowCount = await db.Tag.destroy({
      where: { id, userId }
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

    // Return the updated expense with tags and user
    const updatedExpense = await Expense.findByPk(expenseId, {
      include: [
        {
          model: db.User,
          as: 'user',
          attributes: ['id', 'name']
        },
        {
          model: db.Tag,
          as: 'tags',
          through: { attributes: [] },
          attributes: ['id', 'name', 'createdAt', 'updatedAt']
        }
      ]
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

    // Return the updated expense with remaining tags and user
    const updatedExpense = await Expense.findByPk(expenseId, {
      include: [
        {
          model: db.User,
          as: 'user',
          attributes: ['id', 'name']
        },
        {
          model: db.Tag,
          as: 'tags',
          through: { attributes: [] },
          attributes: ['id', 'name', 'createdAt', 'updatedAt']
        }
      ]
    });

    return updatedExpense;
  } catch (error) {
    throw new Error(`Failed to remove tag from expense: ${error.message}`);
  }
};