// CreateCategoryInput.js
// Input type for creating a new expense category.
// Includes only the category name, which must be unique.
// No ID or user context needed — categories are global (not user-specific).

const { GraphQLInputObjectType, GraphQLString } = require('graphql');

const CreateCategoryInputType = new GraphQLInputObjectType({
  name: 'CreateCategoryInput',
  fields: {
    name: {
      type: GraphQLString,
    }
  }
});

module.exports = CreateCategoryInputType;