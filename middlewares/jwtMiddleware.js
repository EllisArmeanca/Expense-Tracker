const jwt = require("jsonwebtoken");

const { findEntity } = require("../fakeDb");

const { JWT_SECRET_KEY } = require('../constants');

const jwtMiddleware = (request, response, next) => {
    const authorizationHeader = request.headers.authorization;
    
    if(!authorizationHeader) {
        console.log("No authorization header found!");
        next();
        return;
    }

    const token = authorizationHeader.replace("Bearer ", "");

    try {
        const payload = jwt.verify(token, JWT_SECRET_KEY);
        const subjectId = payload.sub;
        const user = findEntity("users", subjectId);

        request.userData = user;

    } catch(e) {
        console.log("Invalid token encountered");
    }

    next();
}


module.exports = jwtMiddleware;