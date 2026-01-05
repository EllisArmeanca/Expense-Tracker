// FailedAuthenticationType.js
const { GraphQLObjectType, GraphQLString } = require('graphql');

const FailedAuthenticationType = new GraphQLObjectType({
  name: 'FailedAuthentication',
  fields: {
    reason: { type: GraphQLString }
  }
});

module.exports = FailedAuthenticationType;