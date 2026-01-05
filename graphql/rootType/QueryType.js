// graphql/rootType/QueryType.js (actualizat complet)

const { GraphQLObjectType } = require('graphql');

const meQuery = require('../queries/meQuery');
const expensesQuery = require('../queries/expensesQuery');
const categoriesQuery = require('../queries/categoriesQuery');
const allUsersQuery = require('../queries/allUsersQuery');
const budgetsQuery = require('../queries/budgetsQuery');

const QueryType = new GraphQLObjectType({
  name: 'Query',
  fields: {
    me: meQuery,
    expenses: expensesQuery,
    categories: categoriesQuery,
    allUsers: allUsersQuery,
    budgets: budgetsQuery,
  },
});

module.exports = QueryType;