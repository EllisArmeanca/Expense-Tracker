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
      type: GraphQLFloat,
    },
    date: {
      type: GraphQLString,
    },
    user: {
      type: UserType, 
    },
    category: {
      type: CategoryType, 
    }
  }
});

module.exports = ExpenseType;