// UserType.js
const { GraphQLObjectType, GraphQLInt, GraphQLString, GraphQLList } = require('graphql');
const SettingsType = require('./SettingsType');

// Import lazy
const ExpenseType = () => require('./ExpenseType');

const UserType = new GraphQLObjectType({
  name: "User",
  fields: () => ({
    id: { type: GraphQLInt },
    username: { type: GraphQLString },
    role: { type: GraphQLString },
    settings: {
      type: SettingsType,
      resolve: (parent) => parent.Setting // ← cheia: mappează "Setting" → "settings"
    },
    expenses: {
      type: new GraphQLList(ExpenseType()),
      resolve: (parent) => parent.Expenses // ← cheia: mappează "Expenses" → "expenses"
    }
  })
});

module.exports = UserType;