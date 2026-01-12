import { buildSchema } from 'graphql';
import { userResolvers } from './resolvers/user.resolver.js';
import { expenseResolvers } from './resolvers/expense.resolver.js';

// Import other resolvers as needed

const schemaString = `
  type AuthResponse {
    token: String!
    user: User!
  }

  type User {
    id: ID!
    name: String!
    email: String!
    expenses: [Expense!]!
    createdAt: String!
    updatedAt: String!
  }

  type Expense {
    id: ID!
    title: String!
    amount: Float!
    category: String!
    date: String!
    userId: ID!
    user: User!
    createdAt: String!
    updatedAt: String!
  }

  type LogoutResponse {
    success: Boolean!
  }

  type Query {
    users: [User!]!
    user(id: ID!): User
    me: User!
    expenses(userId: ID): [Expense!]!
    expense(id: ID!): Expense
  }

  type Mutation {
    login(email: String!, password: String!): AuthResponse
    register(name: String!, email: String!, password: String!): AuthResponse
    logout: LogoutResponse!
    updateProfile(name: String, email: String, password: String): User!
    createUser(name: String!, email: String!, password: String!): User!
    updateUser(id: ID!, name: String, email: String): User!
    deleteUser(id: ID!): Boolean!

    createExpense(title: String!, amount: Float!, category: String!, date: String!, userId: ID!): Expense!
    updateExpense(id: ID!, title: String, amount: Float, category: String, date: String): Expense!
    deleteExpense(id: ID!): Boolean!
  }
`;

const schema = buildSchema(schemaString);

const rootValue = {
  // User queries and mutations
  users: userResolvers.queries.users,
  user: userResolvers.queries.user,
  me: userResolvers.queries.me,
  createUser: userResolvers.mutations.createUser,
  updateUser: userResolvers.mutations.updateUser,
  deleteUser: userResolvers.mutations.deleteUser,

  // Expense queries and mutations
  expenses: expenseResolvers.queries.expenses,
  expense: expenseResolvers.queries.expense,
  createExpense: expenseResolvers.mutations.createExpense,
  updateExpense: expenseResolvers.mutations.updateExpense,
  deleteExpense: expenseResolvers.mutations.deleteExpense,

  // Auth mutations
  login: userResolvers.mutations.login,
  register: userResolvers.mutations.register,
  logout: userResolvers.mutations.logout,
  updateProfile: userResolvers.mutations.updateProfile,
};

export { schema, rootValue };