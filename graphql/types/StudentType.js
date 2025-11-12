const { GraphQLObjectType, GraphQLInt, GraphQLString } = require('graphql');

const StudentType = new GraphQLObjectType({
    name: "Student",
    fields: {
        id: {
            type: GraphQLInt,
        },
        firstName: {
            type: GraphQLString,
        },
        lastName: {
            type: GraphQLString,
        },
        age: {
            type: GraphQLInt,
        }
    }
});

module.exports = StudentType;