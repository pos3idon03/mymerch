const mongoose = require('mongoose');
const User = require('./models/User');


mongouri = process.env.MONGO_URI;

mongoose.connect(mongouri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  await User.create({ username: 'testuser', email: 'test@example.com', password: 'password' });
  console.log('Test user created');
  mongoose.disconnect();
})
.catch(err => {
  console.error(err);
  mongoose.disconnect();
}); 