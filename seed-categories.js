const mongoose = require('mongoose');
const Category = require('./models/Category');

const mongouri = process.env.MONGO_URI;

mongoose.connect(mongouri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  // Create sample categories
  const sampleCategories = [
    {
      name: 'T-Shirts',
      description: 'Comfortable and stylish t-shirts for all occasions',
      active: true
    },
    {
      name: 'Hoodies',
      description: 'Warm and cozy hoodies for cold weather',
      active: true
    },
    {
      name: 'Hats',
      description: 'Trendy hats and caps for any style',
      active: true
    },
    {
      name: 'Accessories',
      description: 'Various accessories to complete your look',
      active: true
    }
  ];

  for (const categoryData of sampleCategories) {
    try {
      await Category.create(categoryData);
      console.log(`Created category: ${categoryData.name}`);
    } catch (error) {
      if (error.code === 11000) {
        console.log(`Category "${categoryData.name}" already exists`);
      } else {
        console.error(`Error creating category "${categoryData.name}":`, error.message);
      }
    }
  }

  console.log('Category seeding completed');
  mongoose.disconnect();
})
.catch(err => {
  console.error(err);
  mongoose.disconnect();
}); 