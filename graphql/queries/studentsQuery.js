const { 
    GraphQLList,
} = require('graphql');
const StudentType = require('../types/StudentType');
const { listEntities } = require('../../fakeDb');

const resolver = (_, args, context) => {
    const isAdminUser = context.user.role === "admin";

    if(!isAdminUser) {
        return [];
    }
    
    return listEntities('students');
}

const studentsQuery = {
    type: new GraphQLList(StudentType),
    resolve: resolver,
}

module.exports = studentsQuery;