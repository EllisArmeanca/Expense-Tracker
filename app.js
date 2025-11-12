const express = require('express');
const app = express();
const port = 3009;
const { createHandler } = require('graphql-http/lib/use/http');
const { 
    GraphQLSchema, 
} = require('graphql');


const QueryType = require('./graphql/rootType/queryType');
const MutationType = require('./graphql/rootType/MutationType');
const jwtMiddleware = require("./middlewares/jwtMiddleware");

const schema = new GraphQLSchema({
  query: QueryType,
  mutation: MutationType,
});

const graphQLHandler = createHandler({
    schema,
    context: (request) => {
        return {
            user: request.raw.userData,
        }
    }
});

app.post('/graphql', jwtMiddleware, graphQLHandler);

module.exports = {
    app,
    port,
};