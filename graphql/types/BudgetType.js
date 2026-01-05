// BudgetType.js
// Defines the GraphQL representation of a Budget.
// Includes basic info (name, amount, date range) and nested users (M:M relation).
// Instead of exposing raw user IDs, it returns full User objects for participants.

const { GraphQLObjectType, GraphQLInt, GraphQLString, GraphQLFloat, GraphQLList } = require('graphql');
const UserType = require('./UserType');

const BudgetType = new GraphQLObjectType({
  name: "Budget",
  fields: {
    id: {
      type: GraphQLInt,
    },
    name: {
      type: GraphQLString,
    },
    amount: {
      type: GraphQLFloat,
    },
    startDate: {
      type: GraphQLString, // DATEONLY → string (e.g., "2026-01-01")
    },
    endDate: {
      type: GraphQLString,
    },
    users: {
      type: new GraphQLList(UserType), // ← full User objects, not userIds
    }
  }
});

module.exports = BudgetType;