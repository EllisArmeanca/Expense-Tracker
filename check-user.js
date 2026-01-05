// check-user.js
const db = require('./models');

async function checkUser() {
  const user = await db.User.findByPk(3);
  if (user) {
    console.log('✅ User cu ID 3 există:', user.username);
  } else {
    console.log('❌ User cu ID 3 NU există!');
  }
  process.exit();
}

checkUser();