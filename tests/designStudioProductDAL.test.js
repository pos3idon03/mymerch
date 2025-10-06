const mongoose = require('mongoose');
const DesignStudioProduct = require('../models/DesignStudioProduct');
const designStudioProductDAL = require('../dal/designStudioProductDAL');

describe('DesignStudioProduct DAL', () => {
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

  describe('getAllProducts', () => {
    test('should retrieve all products', async () => {
      await DesignStudioProduct.create([
        { name: 'Product 1', category: 'tshirt' },
        { name: 'Product 2', category: 'mug' }
      ]);

      const products = await designStudioProductDAL.getAllProducts();

      expect(products.length).toBe(2);
    });

    test('should filter active products', async () => {
      await DesignStudioProduct.create([
        { name: 'Active Product', category: 'tshirt', active: true },
        { name: 'Inactive Product', category: 'mug', active: false }
      ]);

      const activeProducts = await designStudioProductDAL.getAllProducts(
        { active: true }
      );

      expect(activeProducts.length).toBe(1);
      expect(activeProducts[0].name).toBe('Active Product');
    });
  });

  describe('getProductById', () => {
    test('should retrieve product by ID', async () => {
      const product = await DesignStudioProduct.create({
        name: 'Test Product',
        category: 'tshirt'
      });

      const foundProduct = await designStudioProductDAL.getProductById(
        product._id
      );

      expect(foundProduct).toBeDefined();
      expect(foundProduct.name).toBe('Test Product');
    });

    test('should return null for non-existent ID', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const product = await designStudioProductDAL.getProductById(fakeId);

      expect(product).toBeNull();
    });
  });

  describe('createProduct', () => {
    test('should create a new product', async () => {
      const productData = {
        name: 'New Product',
        category: 'hoodie'
      };

      const createdProduct = await designStudioProductDAL.createProduct(
        productData
      );

      expect(createdProduct._id).toBeDefined();
      expect(createdProduct.name).toBe('New Product');
    });
  });

  describe('updateProduct', () => {
    test('should update existing product', async () => {
      const product = await DesignStudioProduct.create({
        name: 'Original Name',
        category: 'tshirt'
      });

      const updatedProduct = await designStudioProductDAL.updateProduct(
        product._id,
        { name: 'Updated Name' }
      );

      expect(updatedProduct.name).toBe('Updated Name');
    });
  });

  describe('deleteProduct', () => {
    test('should delete product', async () => {
      const product = await DesignStudioProduct.create({
        name: 'To Delete',
        category: 'tshirt'
      });

      await designStudioProductDAL.deleteProduct(product._id);

      const foundProduct = await DesignStudioProduct.findById(product._id);
      expect(foundProduct).toBeNull();
    });
  });

  describe('Color Variant Operations', () => {
    test('should add color variant', async () => {
      const product = await DesignStudioProduct.create({
        name: 'Test Product',
        category: 'tshirt'
      });

      const variantData = {
        colorName: 'Blue',
        colorCode: '#0000ff',
        frontImage: '/uploads/blue-front.png'
      };

      const updatedProduct = await designStudioProductDAL.addColorVariant(
        product._id,
        variantData
      );

      expect(updatedProduct.colorVariants.length).toBe(1);
      expect(updatedProduct.colorVariants[0].colorName).toBe('Blue');
    });

    test('should delete color variant', async () => {
      const product = await DesignStudioProduct.create({
        name: 'Test Product',
        category: 'tshirt',
        colorVariants: [{
          colorName: 'Red',
          colorCode: '#ff0000',
          frontImage: '/uploads/red-front.png'
        }]
      });

      const variantId = product.colorVariants[0]._id;

      const updatedProduct = await designStudioProductDAL.deleteColorVariant(
        product._id,
        variantId
      );

      expect(updatedProduct.colorVariants.length).toBe(0);
    });
  });
});

