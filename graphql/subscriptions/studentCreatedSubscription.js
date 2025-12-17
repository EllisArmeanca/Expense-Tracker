const StudentType = require("../types/StudentType");
const { pubsub, STUDENT_CREATED } = require('../../websocket/pubsub');

const studentCreatedSubscription = {
    type: StudentType,
    subscribe: () => pubsub.asyncIterableIterator([STUDENT_CREATED]),
    resolve: (payload) => payload.student,
}

module.exports = studentCreatedSubscription;