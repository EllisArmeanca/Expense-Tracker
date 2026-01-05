// LoggedInUserType.js
const { GraphQLObjectType, GraphQLInt, GraphQLString } = require('graphql');

const LoggedInUserType = new GraphQLObjectType({
  name: "LoggedInUser",
  fields: {
    id: { type: GraphQLInt },
    username: { type: GraphQLString },
    role: { type: GraphQLString }, // ← adăugat
    token: { type: GraphQLString }
  }
});

module.exports = LoggedInUserType;