const { 
    GraphQLObjectType, 
} = require('graphql');
const studentsQuery = require('../queries/studentsQuery');
const studentQuery = require('../queries/studentQuery')

const QueryType = new GraphQLObjectType({
    name: 'Query',
    fields: {
      students: studentsQuery,
      student: studentQuery,
    },
  });

module.exports = QueryType;