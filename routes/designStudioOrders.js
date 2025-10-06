const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const designStudioOrderFeatures = require('../features/designStudioOrderFeatures');
const { DesignStudioOrderDTO } = require('../dtos/designStudioOrderDTO');
const auth = require('../middleware/auth');

const router = express.Router();

const PUBLIC_UPLOADS_URL_PATH = '/uploads/prod';
const ORDERS_SUBDIR = 'designStudioOrders';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = '/app/uploads/prod/designStudioOrders';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'mockup-' + uniqueSuffix + '.png');
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }
});

router.post('/submit', upload.array('mockupImages', 20), async (req, res) => {
  try {
    const { mockupsData, customerEmail, customerPhone, notes } = req.body;

    if (!mockupsData) {
      return res.status(400).json({
        message: 'Mockups data is required'
      });
    }

    const parsedMockups = JSON.parse(mockupsData);

    if (!req.files || req.files.length !== parsedMockups.length) {
      return res.status(400).json({
        message: 'Mockup images must match mockup data'
      });
    }

    const mockupsWithImages = parsedMockups.map((mockup, index) => {
      const imagePath = path
        .join(PUBLIC_UPLOADS_URL_PATH, ORDERS_SUBDIR, req.files[index].filename)
        .replace(/\\/g, '/');
      
      return {
        ...mockup,
        mockupImage: imagePath
      };
    });

    const orderDTO = new DesignStudioOrderDTO({
      mockups: mockupsWithImages,
      customerEmail,
      customerPhone,
      notes
    });

    orderDTO.validate();

    const order = await designStudioOrderFeatures.submitNewOrder(orderDTO);

    res.status(201).json({
      message: 'Order submitted successfully',
      orderId: order._id,
      order: {
        id: order._id,
        totalQuantity: order.totalQuantity,
        mockupsCount: order.mockups.length,
        orderStatus: order.orderStatus,
        createdAt: order.createdAt
      }
    });
  } catch (error) {
    console.error('Design Studio order submission error:', error);
    res.status(400).json({ message: error.message });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const status = req.query.status || null;
    const orders = await designStudioOrderFeatures.fetchAllOrders(status);
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Error fetching orders' });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const order = await designStudioOrderFeatures.fetchOrderDetails(
      req.params.id
    );
    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    const status = error.message === 'Order not found' ? 404 : 500;
    res.status(status).json({ message: error.message });
  }
});

router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const order = await designStudioOrderFeatures.changeOrderStatus(
      req.params.id,
      status
    );

    res.json(order);
  } catch (error) {
    console.error('Error updating order status:', error);
    const statusCode = error.message === 'Order not found' ? 404 : 400;
    res.status(statusCode).json({ message: error.message });
  }
});

module.exports = router;

