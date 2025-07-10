const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect('mongodb+srv://mymerch:stG2vB6A8Ydos3jS@mymerch.lrrohu2.mongodb.net/b2b-ecommerce?retryWrites=true&w=majority&appName=mymerch', {
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