const { PubSub } = require('graphql-subscriptions');

const pubsub = new PubSub();
const STUDENT_CREATED = 'STUDENT_CREATED';

module.exports = { 
    pubsub,
    STUDENT_CREATED,
}