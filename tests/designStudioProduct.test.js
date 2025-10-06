const mongoose = require('mongoose');
const DesignStudioProduct = require('../models/DesignStudioProduct');

describe('DesignStudioProduct Model', () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/test', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    }
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  afterEach(async () => {
    await DesignStudioProduct.deleteMany({});
  });

  describe('Model Validation', () => {
    test('should create a valid design studio product', async () => {
      const productData = {
        name: 'Test T-Shirt',
        category: 'tshirt',
        colorVariants: [{
          colorName: 'White',
          colorCode: '#ffffff',
          frontImage: '/uploads/test-front.png'
        }],
        active: true
      };

      const product = new DesignStudioProduct(productData);
      const savedProduct = await product.save();

      expect(savedProduct._id).toBeDefined();
      expect(savedProduct.name).toBe(productData.name);
      expect(savedProduct.category).toBe(productData.category);
      expect(savedProduct.colorVariants.length).toBe(1);
      expect(savedProduct.active).toBe(true);
    });

    test('should fail without required name field', async () => {
      const productData = {
        category: 'tshirt'
      };

      const product = new DesignStudioProduct(productData);

      await expect(product.save()).rejects.toThrow();
    });

    test('should fail with invalid category', async () => {
      const productData = {
        name: 'Test Product',
        category: 'invalid-category'
      };

      const product = new DesignStudioProduct(productData);

      await expect(product.save()).rejects.toThrow();
    });

    test('should set default printable areas', async () => {
      const productData = {
        name: 'Test Product',
        category: 'tshirt'
      };

      const product = new DesignStudioProduct(productData);
      const savedProduct = await product.save();

      expect(savedProduct.printableAreas.front).toBeDefined();
      expect(savedProduct.printableAreas.back).toBeDefined();
      expect(savedProduct.printableAreas.front.width).toBe(300);
    });
  });

  describe('Color Variants', () => {
    test('should add color variant to product', async () => {
      const product = new DesignStudioProduct({
        name: 'Test Product',
        category: 'tshirt'
      });

      await product.save();

      product.colorVariants.push({
        colorName: 'Black',
        colorCode: '#000000',
        frontImage: '/uploads/test-black-front.png'
      });

      const updatedProduct = await product.save();

      expect(updatedProduct.colorVariants.length).toBe(1);
      expect(updatedProduct.colorVariants[0].colorName).toBe('Black');
    });

    test('should fail when color variant missing required fields', async () => {
      const product = new DesignStudioProduct({
        name: 'Test Product',
        category: 'tshirt',
        colorVariants: [{
          colorName: 'Red'
        }]
      });

      await expect(product.save()).rejects.toThrow();
    });
  });
});

