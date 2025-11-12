const { 
    GraphQLInt,
} = require('graphql');
const StudentType = require('../types/StudentType');
const { findEntity } = require('../../fakeDb');

const studentQuery = {
    type: StudentType,
    args: {
        id: {
            type: GraphQLInt,
        },
    },
    resolve: (_, args) => {
        const { id } = args;
        return findEntity('students', id);
    }
}

module.exports = studentQuery;