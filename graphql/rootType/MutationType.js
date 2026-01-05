// graphql/rootType/MutationType.js (actualizat complet)

const { GraphQLObjectType } = require("graphql");

const loginMutation = require("../mutations/loginMutation");
const createExpenseMutation = require("../mutations/createExpenseMutation");
const updateExpenseMutation = require("../mutations/updateExpenseMutation");
const deleteExpenseMutation = require("../mutations/deleteExpenseMutation");
const createCategoryMutation = require("../mutations/createCategoryMutation");
const createBudgetMutation = require("../mutations/createBudgetMutation");

const MutationType = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    login: loginMutation,
    createExpense: createExpenseMutation,
    updateExpense: updateExpenseMutation,
    deleteExpense: deleteExpenseMutation,
    createCategory: createCategoryMutation,
    createBudget: createBudgetMutation,
  }
});

module.exports = MutationType;