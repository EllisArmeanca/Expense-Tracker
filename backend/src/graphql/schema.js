import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLFloat,
  GraphQLList,
  GraphQLNonNull,
  GraphQLID,
  GraphQLBoolean
} from 'graphql';
import { userResolvers } from './resolvers/user.resolver.js';
import { expenseResolvers } from './resolvers/expense.resolver.js';

// Define types using GraphQL schema definition language
const AuthResponseType = new GraphQLObjectType({
  name: 'AuthResponse',
  fields: () => ({
    token: { type: new GraphQLNonNull(GraphQLString) },
    user: { type: new GraphQLNonNull(UserType) }
  })
});

const LogoutResponseType = new GraphQLObjectType({
  name: 'LogoutResponse',
  fields: () => ({
    success: { type: new GraphQLNonNull(GraphQLBoolean) }
  })
});

const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    email: { type: new GraphQLNonNull(GraphQLString) },
    isAdmin: { type: new GraphQLNonNull(GraphQLBoolean) },
    expenses: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(ExpenseType))) },
    createdAt: { type: new GraphQLNonNull(GraphQLString) },
    updatedAt: { type: new GraphQLNonNull(GraphQLString) }
  })
});

const TagType = new GraphQLObjectType({
  name: 'Tag',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    icon: { type: GraphQLString },
    expenses: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(ExpenseType))) },
    createdAt: { type: new GraphQLNonNull(GraphQLString) },
    updatedAt: { type: new GraphQLNonNull(GraphQLString) }
  })
});

const ExpenseType = new GraphQLObjectType({
  name: 'Expense',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    title: { type: new GraphQLNonNull(GraphQLString) },
    amount: { type: new GraphQLNonNull(GraphQLFloat) },
    date: { type: new GraphQLNonNull(GraphQLString) },
    userId: { type: new GraphQLNonNull(GraphQLID) },
    user: { type: new GraphQLNonNull(UserType) },
    tags: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(TagType))) },
    createdAt: { type: new GraphQLNonNull(GraphQLString) },
    updatedAt: { type: new GraphQLNonNull(GraphQLString) }
  })
});

// Regular user schema - contains only user-level operations
const UserQueryType = new GraphQLObjectType({
  name: 'Query',
  fields: {
    // User queries
    users: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(UserType))),
      resolve: userResolvers.queries.users
    },
    user: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) }
      },
      resolve: userResolvers.queries.user
    },
    me: {
      type: new GraphQLNonNull(UserType),
      resolve: userResolvers.queries.me
    },
    // Expense queries
    expenses: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(ExpenseType))),
      args: {
        userId: { type: GraphQLID },
        tagIds: { type: new GraphQLList(GraphQLID) }, // Include expense only if it has these tags
        excludeTagIds: { type: new GraphQLList(GraphQLID) }, // Exclude expense if it has these tags
        dateFrom: { type: GraphQLString }, // Filter from this date
        dateTo: { type: GraphQLString }, // Filter to this date
        withoutTags: { type: GraphQLBoolean } // Include only expenses without any tags
      },
      resolve: expenseResolvers.queries.expenses
    },
    expense: {
      type: ExpenseType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) }
      },
      resolve: expenseResolvers.queries.expense
    },
    // Tag queries
    tags: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(TagType))),
      resolve: expenseResolvers.queries.tags
    },
    tag: {
      type: TagType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) }
      },
      resolve: expenseResolvers.queries.tag
    }
  }
});

const UserMutationType = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    // Auth mutations
    login: {
      type: AuthResponseType,
      args: {
        email: { type: new GraphQLNonNull(GraphQLString) },
        password: { type: new GraphQLNonNull(GraphQLString) }
      },
      resolve: userResolvers.mutations.login
    },
    register: {
      type: AuthResponseType,
      args: {
        name: { type: new GraphQLNonNull(GraphQLString) },
        email: { type: new GraphQLNonNull(GraphQLString) },
        password: { type: new GraphQLNonNull(GraphQLString) }
      },
      resolve: userResolvers.mutations.register
    },
    logout: {
      type: new GraphQLNonNull(LogoutResponseType),
      resolve: userResolvers.mutations.logout
    },
    updateProfile: {
      type: new GraphQLNonNull(UserType),
      args: {
        name: { type: GraphQLString },
        email: { type: GraphQLString },
        password: { type: GraphQLString }
      },
      resolve: userResolvers.mutations.updateProfile
    },
    // User mutations (self operations only)
    updateUser: {
      type: new GraphQLNonNull(UserType),
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        name: { type: GraphQLString },
        email: { type: GraphQLString }
      },
      resolve: userResolvers.mutations.updateUser
    },
    deleteUser: {
      type: new GraphQLNonNull(GraphQLBoolean),
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) }
      },
      resolve: userResolvers.mutations.deleteUser
    },
    // Expense mutations
    createExpense: {
      type: new GraphQLNonNull(ExpenseType),
      args: {
        title: { type: new GraphQLNonNull(GraphQLString) },
        amount: { type: new GraphQLNonNull(GraphQLFloat) },
        date: { type: new GraphQLNonNull(GraphQLString) },
        tagIds: { type: new GraphQLList(GraphQLID) } // Array of tag IDs to associate with the expense
      },
      resolve: expenseResolvers.mutations.createExpense
    },
    updateExpense: {
      type: new GraphQLNonNull(ExpenseType),
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        title: { type: GraphQLString },
        amount: { type: GraphQLFloat },
        date: { type: GraphQLString },
        tagIds: { type: new GraphQLList(GraphQLID) } // Array of tag IDs to associate with the expense
      },
      resolve: expenseResolvers.mutations.updateExpense
    },
    deleteExpense: {
      type: new GraphQLNonNull(GraphQLBoolean),
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) }
      },
      resolve: expenseResolvers.mutations.deleteExpense
    },
    // Tag mutations
    createTag: {
      type: new GraphQLNonNull(TagType),
      args: {
        name: { type: new GraphQLNonNull(GraphQLString) },
        icon: { type: GraphQLString }
      },
      resolve: expenseResolvers.mutations.createTag
    },
    updateTag: {
      type: new GraphQLNonNull(TagType),
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        name: { type: GraphQLString },
        icon: { type: GraphQLString }
      },
      resolve: expenseResolvers.mutations.updateTag
    },
    deleteTag: {
      type: new GraphQLNonNull(GraphQLBoolean),
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) }
      },
      resolve: expenseResolvers.mutations.deleteTag
    },
    // Expense tag management mutations
    addTagToExpense: {
      type: new GraphQLNonNull(ExpenseType),
      args: {
        expenseId: { type: new GraphQLNonNull(GraphQLID) },
        tagId: { type: new GraphQLNonNull(GraphQLID) }
      },
      resolve: expenseResolvers.mutations.addTagToExpense
    },
    removeTagFromExpense: {
      type: new GraphQLNonNull(ExpenseType),
      args: {
        expenseId: { type: new GraphQLNonNull(GraphQLID) },
        tagId: { type: new GraphQLNonNull(GraphQLID) }
      },
      resolve: expenseResolvers.mutations.removeTagFromExpense
    }
  }
});

// Admin-only schema - completely separate with extended functionality
const AdminQueryType = new GraphQLObjectType({
  name: 'AdminQuery',
  fields: {
    // All user queries are available to admin as well
    users: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(UserType))),
      resolve: userResolvers.queries.users
    },
    user: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) }
      },
      resolve: userResolvers.queries.user
    },
    me: {
      type: new GraphQLNonNull(UserType),
      resolve: userResolvers.queries.me
    },
    expenses: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(ExpenseType))),
      args: {
        userId: { type: GraphQLID },
        tagIds: { type: new GraphQLList(GraphQLID) },
        excludeTagIds: { type: new GraphQLList(GraphQLID) },
        dateFrom: { type: GraphQLString },
        dateTo: { type: GraphQLString },
        withoutTags: { type: GraphQLBoolean }
      },
      resolve: expenseResolvers.queries.expenses
    },
    expense: {
      type: ExpenseType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) }
      },
      resolve: expenseResolvers.queries.expense
    },
    tags: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(TagType))),
      resolve: expenseResolvers.queries.tags
    },
    tag: {
      type: TagType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) }
      },
      resolve: expenseResolvers.queries.tag
    },
    // Additional admin-specific queries
    adminUsers: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(UserType))),
      resolve: userResolvers.queries.adminUsers
    }
  }
});

const AdminMutationType = new GraphQLObjectType({
  name: 'AdminMutation',
  fields: {
    // All user mutations are available to admin as well
    login: {
      type: AuthResponseType,
      args: {
        email: { type: new GraphQLNonNull(GraphQLString) },
        password: { type: new GraphQLNonNull(GraphQLString) }
      },
      resolve: userResolvers.mutations.login
    },
    register: {
      type: AuthResponseType,
      args: {
        name: { type: new GraphQLNonNull(GraphQLString) },
        email: { type: new GraphQLNonNull(GraphQLString) },
        password: { type: new GraphQLNonNull(GraphQLString) }
      },
      resolve: userResolvers.mutations.register
    },
    logout: {
      type: new GraphQLNonNull(LogoutResponseType),
      resolve: userResolvers.mutations.logout
    },
    updateProfile: {
      type: new GraphQLNonNull(UserType),
      args: {
        name: { type: GraphQLString },
        email: { type: GraphQLString },
        password: { type: GraphQLString }
      },
      resolve: userResolvers.mutations.updateProfile
    },
    updateUser: {
      type: new GraphQLNonNull(UserType),
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        name: { type: GraphQLString },
        email: { type: GraphQLString }
      },
      resolve: userResolvers.mutations.updateUser
    },
    deleteUser: {
      type: new GraphQLNonNull(GraphQLBoolean),
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) }
      },
      resolve: userResolvers.mutations.deleteUser
    },
    createExpense: {
      type: new GraphQLNonNull(ExpenseType),
      args: {
        title: { type: new GraphQLNonNull(GraphQLString) },
        amount: { type: new GraphQLNonNull(GraphQLFloat) },
        date: { type: new GraphQLNonNull(GraphQLString) },
        tagIds: { type: new GraphQLList(GraphQLID) }
      },
      resolve: expenseResolvers.mutations.createExpense
    },
    updateExpense: {
      type: new GraphQLNonNull(ExpenseType),
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        title: { type: GraphQLString },
        amount: { type: GraphQLFloat },
        date: { type: GraphQLString },
        tagIds: { type: new GraphQLList(GraphQLID) }
      },
      resolve: expenseResolvers.mutations.updateExpense
    },
    deleteExpense: {
      type: new GraphQLNonNull(GraphQLBoolean),
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) }
      },
      resolve: expenseResolvers.mutations.deleteExpense
    },
    createTag: {
      type: new GraphQLNonNull(TagType),
      args: {
        name: { type: new GraphQLNonNull(GraphQLString) },
        icon: { type: GraphQLString }
      },
      resolve: expenseResolvers.mutations.createTag
    },
    updateTag: {
      type: new GraphQLNonNull(TagType),
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        name: { type: GraphQLString },
        icon: { type: GraphQLString }
      },
      resolve: expenseResolvers.mutations.updateTag
    },
    deleteTag: {
      type: new GraphQLNonNull(GraphQLBoolean),
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) }
      },
      resolve: expenseResolvers.mutations.deleteTag
    },
    addTagToExpense: {
      type: new GraphQLNonNull(ExpenseType),
      args: {
        expenseId: { type: new GraphQLNonNull(GraphQLID) },
        tagId: { type: new GraphQLNonNull(GraphQLID) }
      },
      resolve: expenseResolvers.mutations.addTagToExpense
    },
    removeTagFromExpense: {
      type: new GraphQLNonNull(ExpenseType),
      args: {
        expenseId: { type: new GraphQLNonNull(GraphQLID) },
        tagId: { type: new GraphQLNonNull(GraphQLID) }
      },
      resolve: expenseResolvers.mutations.removeTagFromExpense
    },
    // Admin-specific mutations
    createUser: {
      type: new GraphQLNonNull(UserType),
      args: {
        name: { type: new GraphQLNonNull(GraphQLString) },
        email: { type: new GraphQLNonNull(GraphQLString) },
        password: { type: new GraphQLNonNull(GraphQLString) }
      },
      resolve: userResolvers.mutations.createUser
    },
    promoteToAdmin: {
      type: new GraphQLNonNull(UserType),
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) }
      },
      resolve: userResolvers.mutations.promoteToAdmin
    },
    demoteFromAdmin: {
      type: new GraphQLNonNull(UserType),
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) }
      },
      resolve: userResolvers.mutations.demoteFromAdmin
    },
    // Direct database operations for admin
    executeSQL: {
      type: GraphQLString,
      args: {
        query: { type: new GraphQLNonNull(GraphQLString) }
      },
      resolve: userResolvers.mutations.executeSQL
    }
  }
});

const userSchema = new GraphQLSchema({
  query: UserQueryType,
  mutation: UserMutationType
});

const adminSchema = new GraphQLSchema({
  query: AdminQueryType,
  mutation: AdminMutationType
});

export { userSchema, adminSchema };