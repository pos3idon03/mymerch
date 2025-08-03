const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { SitemapStream, streamToPromise } = require('sitemap');
const { createGzip } = require('zlib');
require('dotenv').config();

// Define the public URL path for your uploaded files
const PUBLIC_UPLOADS_URL_PATH = '/uploads/prod'; // This is what the browser will use

// Define the internal server path where the volume is mounted
const INTERNAL_VOLUME_PATH = '/app/uploads/prod'; // Matches your docker-compose and MongoDB path

try {
    // Check if the directory exists
    if (fs.existsSync(INTERNAL_VOLUME_PATH)) {
        console.log(`Volume mounted successfully at: ${INTERNAL_VOLUME_PATH}`);

        // Try to write a test file
        const testFilePath = path.join(INTERNAL_VOLUME_PATH, 'volume_test.txt');
        fs.writeFileSync(testFilePath, `Test data from ${new Date().toISOString()}`);
        console.log(`Successfully wrote test file to volume: ${testFilePath}`);

        // Clean up the test file (optional)
        // fs.unlinkSync(testFilePath);
        // console.log('Cleaned up test file.');

    } else {
        console.error(`Volume mount path does NOT exist: ${INTERNAL_VOLUME_PATH}`);
    }
} catch (error) {
    console.error(`Error interacting with volume at ${INTERNAL_VOLUME_PATH}:`, error.message);
}



const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the volume mount point
app.use(PUBLIC_UPLOADS_URL_PATH, express.static(INTERNAL_VOLUME_PATH));

// Backward compatibility: Serve old testimonials directory
// This ensures existing testimonials with old paths still work
const oldTestimonialsPath = '/app/uploads/testimonials';
if (fs.existsSync(oldTestimonialsPath)) {
  app.use('/app/uploads/testimonials', express.static(oldTestimonialsPath));
  console.log('Serving old testimonials directory for backward compatibility');
} else {
  console.log('Old testimonials directory does not exist, skipping backward compatibility route');
}

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
app.use('/api/test-your-idea', require('./routes/testYourIdea'));

const Product = require('./models/Product');
const Blog = require('./models/Blog');

app.get('/sitemap.xml', async (req, res) => {
  try {
    const smStream = new SitemapStream({ hostname: 'https://www.mymerch.gr' });

    // Static pages
    smStream.write({ url: '/', changefreq: 'weekly', priority: 1.0 });
    smStream.write({ url: '/products', changefreq: 'weekly', priority: 0.8 });
    smStream.write({ url: '/contact', changefreq: 'monthly', priority: 0.6 });
    smStream.write({ url: '/faq', changefreq: 'monthly', priority: 0.6 });
    smStream.write({ url: '/blog', changefreq: 'weekly', priority: 0.7 });

    // Dynamic product pages
    const products = await Product.find({}, '_id');
    products.forEach(product => {
      smStream.write({ url: `/products/${product._id}`, changefreq: 'weekly', priority: 0.7 });
    });

    // Dynamic blog pages
    const blogs = await Blog.find({}, '_id');
    blogs.forEach(blog => {
      smStream.write({ url: `/blog/${blog._id}`, changefreq: 'weekly', priority: 0.7 });
    });

    smStream.end();

    res.header('Content-Type', 'application/xml');
    streamToPromise(smStream).then(sm => res.send(sm.toString()));
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});

// Serve React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 