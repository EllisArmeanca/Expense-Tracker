// check-associations.js
const db = require('./models');

console.log('User associations:');
console.log(db.User.associations);

process.exit();