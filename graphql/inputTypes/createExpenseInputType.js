// CreateExpenseInput.js
// Input type for creating a new expense.
// Does NOT include userId — it is inferred from the authenticated user's context (JWT).
// Includes optional categoryId (as an ID), description, amount, and date.

const { GraphQLInputObjectType, GraphQLInt, GraphQLString, GraphQLFloat } = require('graphql');

const CreateExpenseInputType = new GraphQLInputObjectType({
  name: 'CreateExpenseInput',
  fields: {
    categoryId: {
      type: GraphQLInt, // ID of the category (optional)
    },
    description: {
      type: GraphQLString,
    },
    amount: {
      type: GraphQLFloat, // e.g., 15.99
    },
    date: {
      type: GraphQLString, // format: "YYYY-MM-DD"
    }
  }
});

module.exports = CreateExpenseInputType;