// createCategoryMutation.js
// Creates a new global expense category (e.g., "Food", "Transport").
// Does not require user context for ownership (categories are global).
// However, only authenticated users (user or admin) can create categories.
// Returns the full category object with its ID and name.

const CategoryType = require("../types/CategoryType");
const CreateCategoryInputType = require("../inputTypes/createCategoryInputType");
const db = require("../../models");
const { requireUser } = require("../../utils/auth");
const { GraphQLError } = require("graphql");

const createCategoryMutation = {
  type: CategoryType,
  args: {
    input: {
      type: CreateCategoryInputType,
    }
  },
  resolve: async (_, args, context) => {
    // Require authentication (user or admin) to prevent spam
    requireUser(context);

    const { name } = args.input;

    if (!name || name.trim() === "") {
      throw new GraphQLError("Category name is required");
    }

    try {
      // Create category (name is unique, so this may fail if duplicate)
      const category = await db.Category.create({
        name: name.trim()
      });

      return category;
    } catch (error) {
      if (error.name === "SequelizeUniqueConstraintError") {
        throw new GraphQLError("Category with this name already exists");
      }
      console.error("Error creating category:", error);
      throw new GraphQLError("Failed to create category");
    }
  }
};

module.exports = createCategoryMutation;