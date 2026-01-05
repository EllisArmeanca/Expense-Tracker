// SettingsType.js
// Defines the GraphQL representation of user settings (1:1 with User).
// Includes preferences like currency and timezone.
// Ensures no raw user ID is exposed — the parent User object provides context.

const { GraphQLObjectType, GraphQLInt, GraphQLString } = require('graphql');

const SettingsType = new GraphQLObjectType({
  name: "Settings",
  fields: {
    id: {
      type: GraphQLInt,
    },
    currency: {
      type: GraphQLString,
    },
    timezone: {
      type: GraphQLString,
    }
    // Note: userId is NOT exposed here — it's inferred from the parent User
  }
});

module.exports = SettingsType;