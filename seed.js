const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect(process.env.MONGODB_URI, {
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