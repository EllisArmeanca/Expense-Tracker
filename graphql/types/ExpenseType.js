// ExpenseType.js
// Defines the GraphQL representation of an Expense.
// Includes nested relations to avoid exposing raw IDs:
// - user: the owner of the expense (1:1 relation)
// - category: the category this expense belongs to (optional, 1:1 relation)
// Ensures clients receive full objects (e.g., category { id, name }) instead of just IDs.

const { GraphQLObjectType, GraphQLInt, GraphQLString, GraphQLFloat } = require('graphql');
const UserType = require('./UserType');
const CategoryType = require('./CategoryType');

const ExpenseType = new GraphQLObjectType({
  name: "Expense",
  fields: {
    id: {
      type: GraphQLInt,
    },
    description: {
      type: GraphQLString,
    },
    amount: {
      type: GraphQLFloat, // DECIMAL(10,2) maps well to Float in GraphQL
    },
    date: {
      type: GraphQLString, // DATEONLY is typically serialized as string (YYYY-MM-DD)
    },
    user: {
      type: UserType, // ← full user object, not just userId
    },
    category: {
      type: CategoryType, // ← full category object, not just categoryId
    }
  }
});

module.exports = ExpenseType;