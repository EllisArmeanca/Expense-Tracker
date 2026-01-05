// graphql/mutations/loginMutation.js
const { GraphQLUnionType, GraphQLString } = require("graphql");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { JWT_SECRET_KEY } = require("../../constants");
const db = require("../../models");

const LoggedInUserType = require("../types/LoggedInUserType");
const FailedAuthenticationType = require("../types/FailedAuthenticationType");

const loginMutation = {
  type: new GraphQLUnionType({
    name: 'LoginMutationUnion',
    types: [LoggedInUserType, FailedAuthenticationType],
    resolveType: (value) => {
      if (value.token) {
        return 'LoggedInUser';
      }
      return 'FailedAuthentication';
    }
  }),
  args: {
    username: { type: GraphQLString },
    password: { type: GraphQLString }
  },
  resolve: async (_, { username, password }) => {
    const user = await db.User.findOne({ where: { username } });

    if (!user) {
      return { reason: "Invalid username or password" };
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return { reason: "Invalid username or password" };
    }

    const token = jwt.sign({ sub: user.id }, JWT_SECRET_KEY, { expiresIn: '7d' });

    return {
      id: user.id,
      username: user.username,
      role: user.role,
      token
    };
  }
};

module.exports = loginMutation;