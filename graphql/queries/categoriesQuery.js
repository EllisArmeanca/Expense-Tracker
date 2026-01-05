// categoriesQuery.js
// Fetches all available expense categories (global, not user-specific).
// No authentication required, but we allow it for consistency.
// Returns full category objects with nested expenses (optional).

const { GraphQLList } = require('graphql');
const CategoryType = require("../types/CategoryType");
const db = require("../../models");

const categoriesQuery = {
  type: new GraphQLList(CategoryType),
  resolve: async (_, __, context) => {
    // Authentication is optional for categories (they are public)
    // But if user is logged in, we could later add user-specific stats

    try {
      const categories = await db.Category.findAll({
        order: [['name', 'ASC']]
      });
      return categories;
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw new GraphQLError("Failed to fetch categories");
    }
  }
};

module.exports = categoriesQuery;