const { GraphQLObjectType } = require('graphql');
const studentCreatedSubscription = require('../subscriptions/studentCreatedSubscription');

const SubscriptionType = new GraphQLObjectType({
    name: 'Subscription',
    fields: {
        studentCreated: studentCreatedSubscription,
    }
});

module.exports = SubscriptionType;