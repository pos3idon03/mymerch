const mongoose = require('mongoose');
const DesignStudioOrder = require('../models/DesignStudioOrder');
const DesignStudioProduct = require('../models/DesignStudioProduct');
const designStudioOrderFeatures = require('../features/designStudioOrderFeatures');

describe('DesignStudioOrder Features', () => {
  let testProduct;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/test', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    }

    testProduct = await DesignStudioProduct.create({
      name: 'Test Product',
      category: 'tshirt',
      colorVariants: [{
        colorName: 'White',
        colorCode: '#ffffff',
        frontImage: '/uploads/white-front.png'
      }]
    });
  });

  afterAll(async () => {
    await DesignStudioProduct.deleteMany({});
    await mongoose.connection.close();
  });

  afterEach(async () => {
    await DesignStudioOrder.deleteMany({});
  });

  describe('submitNewOrder', () => {
    test('should submit valid order', async () => {
      const orderData = {
        mockups: [{
          productId: testProduct._id,
          productName: testProduct.name,
          colorName: 'White',
          view: 'front',
          designData: '{"objects":[]}',
          mockupImage: '/uploads/mockup1.png',
          quantity: 5
        }],
        customerEmail: 'test@example.com',
        customerPhone: '1234567890'
      };

      const order = await designStudioOrderFeatures.submitNewOrder(orderData);

      expect(order._id).toBeDefined();
      expect(order.totalQuantity).toBe(5);
      expect(order.mockups.length).toBe(1);
      expect(order.customerEmail).toBe('test@example.com');
    });

    test('should calculate total quantity correctly', async () => {
      const orderData = {
        mockups: [
          {
            productId: testProduct._id,
            productName: testProduct.name,
            colorName: 'White',
            view: 'front',
            designData: '{"objects":[]}',
            mockupImage: '/uploads/mockup1.png',
            quantity: 5
          },
          {
            productId: testProduct._id,
            productName: testProduct.name,
            colorName: 'White',
            view: 'back',
            designData: '{"objects":[]}',
            mockupImage: '/uploads/mockup2.png',
            quantity: 3
          }
        ],
        customerEmail: 'test@example.com',
        customerPhone: '1234567890'
      };

      const order = await designStudioOrderFeatures.submitNewOrder(orderData);

      expect(order.totalQuantity).toBe(8);
    });

    test('should fail without mockups', async () => {
      const orderData = {
        mockups: [],
        customerEmail: 'test@example.com',
        customerPhone: '1234567890'
      };

      await expect(
        designStudioOrderFeatures.submitNewOrder(orderData)
      ).rejects.toThrow('At least one mockup is required');
    });

    test('should fail with invalid quantity', async () => {
      const orderData = {
        mockups: [{
          productId: testProduct._id,
          productName: testProduct.name,
          colorName: 'White',
          view: 'front',
          designData: '{"objects":[]}',
          mockupImage: '/uploads/mockup1.png',
          quantity: 0
        }],
        customerEmail: 'test@example.com',
        customerPhone: '1234567890'
      };

      await expect(
        designStudioOrderFeatures.submitNewOrder(orderData)
      ).rejects.toThrow();
    });
  });

  describe('fetchAllOrders', () => {
    test('should fetch all orders', async () => {
      await DesignStudioOrder.create([
        {
          mockups: [{
            productId: testProduct._id,
            productName: 'Product 1',
            colorName: 'White',
            designData: '{}',
            mockupImage: '/test.png',
            quantity: 1
          }],
          customerEmail: 'test1@example.com',
          customerPhone: '1111111111',
          totalQuantity: 1
        },
        {
          mockups: [{
            productId: testProduct._id,
            productName: 'Product 2',
            colorName: 'Black',
            designData: '{}',
            mockupImage: '/test2.png',
            quantity: 2
          }],
          customerEmail: 'test2@example.com',
          customerPhone: '2222222222',
          totalQuantity: 2
        }
      ]);

      const orders = await designStudioOrderFeatures.fetchAllOrders();

      expect(orders.length).toBe(2);
    });

    test('should filter orders by status', async () => {
      await DesignStudioOrder.create([
        {
          mockups: [{
            productId: testProduct._id,
            productName: 'Product 1',
            colorName: 'White',
            designData: '{}',
            mockupImage: '/test.png',
            quantity: 1
          }],
          customerEmail: 'test1@example.com',
          customerPhone: '1111111111',
          totalQuantity: 1,
          orderStatus: 'Submitted'
        },
        {
          mockups: [{
            productId: testProduct._id,
            productName: 'Product 2',
            colorName: 'Black',
            designData: '{}',
            mockupImage: '/test2.png',
            quantity: 2
          }],
          customerEmail: 'test2@example.com',
          customerPhone: '2222222222',
          totalQuantity: 2,
          orderStatus: 'Completed'
        }
      ]);

      const completedOrders = await designStudioOrderFeatures.fetchAllOrders(
        'Completed'
      );

      expect(completedOrders.length).toBe(1);
      expect(completedOrders[0].orderStatus).toBe('Completed');
    });
  });

  describe('changeOrderStatus', () => {
    test('should update order status', async () => {
      const order = await DesignStudioOrder.create({
        mockups: [{
          productId: testProduct._id,
          productName: 'Product',
          colorName: 'White',
          designData: '{}',
          mockupImage: '/test.png',
          quantity: 1
        }],
        customerEmail: 'test@example.com',
        customerPhone: '1234567890',
        totalQuantity: 1,
        orderStatus: 'Submitted'
      });

      const updatedOrder = await designStudioOrderFeatures.changeOrderStatus(
        order._id,
        'In Review'
      );

      expect(updatedOrder.orderStatus).toBe('In Review');
    });

    test('should fail with invalid status', async () => {
      const order = await DesignStudioOrder.create({
        mockups: [{
          productId: testProduct._id,
          productName: 'Product',
          colorName: 'White',
          designData: '{}',
          mockupImage: '/test.png',
          quantity: 1
        }],
        customerEmail: 'test@example.com',
        customerPhone: '1234567890',
        totalQuantity: 1
      });

      await expect(
        designStudioOrderFeatures.changeOrderStatus(order._id, 'InvalidStatus')
      ).rejects.toThrow('Invalid order status');
    });
  });
});

