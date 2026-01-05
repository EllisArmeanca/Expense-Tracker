// CategoryType.js
// Defines the GraphQL representation of a Category.
// Includes basic info (id, name) and nested expenses (1:M relation).
// Ensures clients receive full expense objects instead of raw expense IDs.

const { GraphQLObjectType, GraphQLInt, GraphQLString, GraphQLList } = require('graphql');
const ExpenseType = require('./ExpenseType');

const CategoryType = new GraphQLObjectType({
  name: "Category",
  fields: {
    id: {
      type: GraphQLInt,
    },
    name: {
      type: GraphQLString,
    },
    expenses: {
      type: new GraphQLList(ExpenseType), // ← full expense objects, not IDs
    }
  }
});

module.exports = CategoryType;