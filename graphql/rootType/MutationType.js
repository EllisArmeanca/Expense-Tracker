const { GraphQLObjectType } = require("graphql");
const createStudentMutation = require("../mutations/createStudentMutation");
const loginMutation = require("../mutations/loginMutation");

const MutationType = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        createStudent: createStudentMutation,
        login: loginMutation,
    }
});

module.exports = MutationType;