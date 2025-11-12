const LoggedInUserType = require("../types/LoggedInUserType");
const LoginCredentialsInputType = require("../inputTypes/LoginCredentialsInputType");
const jwt = require("jsonwebtoken");
const { JWT_SECRET_KEY } = require("../../constants");
const { findUserByUsername } = require("../../fakeDb");

const loginMutation = {
    type: LoggedInUserType,
    args: {
        input: {
            type: LoginCredentialsInputType
        }
    },
    resolve: (_, args) => {
        const { username, password } = args.input;
        const user = findUserByUsername(username);

        if(!user) {
            return {
                id: 0,
                token: "invalid_token",
            }
        }

        if (user.password === password) {
            const token = jwt.sign({
                sub: user.id,
            }, JWT_SECRET_KEY);

            return {
                id: user.id,
                token,
            };
        }

        return {
            id: 0,
            token: "invalid_token",
        }
    }
}

module.exports = loginMutation;