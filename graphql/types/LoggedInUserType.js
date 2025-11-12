const { GraphQLObjectType, GraphQLInt, GraphQLString } = require('graphql');

const LoggedInUserType = new GraphQLObjectType({
    name: "LoggedInUser",
    fields: {
        id: {
            type: GraphQLInt,
        },
        token: {
            type: GraphQLString,
        }
    }
});

module.exports = LoggedInUserType;