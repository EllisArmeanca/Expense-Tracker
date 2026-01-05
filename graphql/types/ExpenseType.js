// ExpenseType.js
const { GraphQLObjectType, GraphQLInt, GraphQLString, GraphQLFloat } = require('graphql');

const UserType = () => require('./UserType');
const CategoryType = () => require('./CategoryType');

const ExpenseType = new GraphQLObjectType({
  name: "Expense",
  fields: () => ({
    id: { type: GraphQLInt },
    description: { type: GraphQLString },
    amount: { type: GraphQLFloat },
    date: { type: GraphQLString },
    user: { 
      type: UserType(),
      resolve: (parent) => parent.User // ← adaugă și aici pentru consistență
    },
    category: { 
      type: CategoryType(),
      resolve: (parent) => parent.Category // ← CHEIA: mappează "Category" → "category"
    }
  })
});

module.exports = ExpenseType;