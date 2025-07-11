const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();


const volumeMountPath = '/app/uploads'; // Replace with your actual mount path

try {
    // Check if the directory exists
    if (fs.existsSync(volumeMountPath)) {
        console.log(`Volume mounted successfully at: ${volumeMountPath}`);

        // Try to write a test file
        const testFilePath = path.join(volumeMountPath, 'volume_test.txt');
        fs.writeFileSync(testFilePath, `Test data from ${new Date().toISOString()}`);
        console.log(`Successfully wrote test file to volume: ${testFilePath}`);

        // Clean up the test file (optional)
        // fs.unlinkSync(testFilePath);
        // console.log('Cleaned up test file.');

    } else {
        console.error(`Volume mount path does NOT exist: ${volumeMountPath}`);
    }
} catch (error) {
    console.error(`Error interacting with volume at ${volumeMountPath}:`, error.message);
}



const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

mongouri = process.env.MONGO_URI;

// MongoDB Connection
mongoose.connect(mongouri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log('MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/blog', require('./routes/blog'));
app.use('/api/banner', require('./routes/banner'));
app.use('/api/testimonials', require('./routes/testimonials'));
app.use('/api/about', require('./routes/about'));
app.use('/api/faq', require('./routes/faq'));
app.use('/api/company', require('./routes/company'));
app.use('/api/events', require('./routes/events'));
app.use('/api/custom-order', require('./routes/customOrder'));

// Serve React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}


// Ensure uploads subdirectories exist
const uploadDirs = [
  'uploads/assets',
  'uploads/banners',
  'uploads/testimonials',
  'uploads/products',
  'uploads/events',
  'uploads/customOrders',
  'uploads/categories',
  'uploads/blogs',
  'uploads/about',
];
uploadDirs.forEach(dir => {
  fs.mkdirSync(path.join(__dirname, dir), { recursive: true });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 