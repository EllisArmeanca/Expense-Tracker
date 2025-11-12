const { GraphQLInputObjectType, GraphQLString, GraphQLInt  } = require("graphql");

const CreateStudentInputType = new GraphQLInputObjectType({
    name: 'CreateStudentInputType',
    fields: {
        firstName: {
            type: GraphQLString,
        },
        lastName: {
            type: GraphQLString
        },
        age: {
            type: GraphQLInt
        }
    }
})

module.exports = CreateStudentInputType;