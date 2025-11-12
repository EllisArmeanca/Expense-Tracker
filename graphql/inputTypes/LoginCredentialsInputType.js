const { GraphQLInputObjectType, GraphQLString, GraphQLInt  } = require("graphql");

const LoginCredentialsInputType = new GraphQLInputObjectType({
    name: 'LoginCredentialsInputType',
    fields: {
        username: {
            type: GraphQLString,
        },
        password: {
            type: GraphQLString
        },
    }
})

module.exports = LoginCredentialsInputType;