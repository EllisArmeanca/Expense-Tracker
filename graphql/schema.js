const { GraphQLSchema } = require('graphql');

const QueryType = require('./rootType/queryType');
const MutationType = require('./rootType/MutationType');
const SubscriptionType = require('./rootType/SubscriptionType');

const schema = new GraphQLSchema({
  query: QueryType,
  mutation: MutationType,
  subscription: SubscriptionType,
});

module.exports = schema;