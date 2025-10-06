const designStudioOrderDAL = require('../dal/designStudioOrderDAL');

const calculateTotalQuantity = (mockups) => {
  return mockups.reduce((total, mockup) => total + mockup.quantity, 0);
};

const validateMockupData = (mockup) => {
  if (!mockup.productId || !mockup.productName || !mockup.colorName) {
    throw new Error('Missing required mockup fields');
  }
  if (!mockup.designData || !mockup.mockupImage) {
    throw new Error('Missing design data or mockup image');
  }
  if (!mockup.quantity || mockup.quantity < 1) {
    throw new Error('Invalid quantity');
  }
  return true;
};

const submitNewOrder = async (orderData) => {
  // Validate mockups
  if (!orderData.mockups || orderData.mockups.length === 0) {
    throw new Error('At least one mockup is required');
  }

  orderData.mockups.forEach(validateMockupData);

  // Calculate total quantity
  orderData.totalQuantity = calculateTotalQuantity(orderData.mockups);

  return await designStudioOrderDAL.createOrder(orderData);
};

const fetchAllOrders = async (status = null) => {
  const filters = status ? { orderStatus: status } : {};
  return await designStudioOrderDAL.getAllOrders(filters);
};

const fetchOrderDetails = async (orderId) => {
  const order = await designStudioOrderDAL.getOrderById(orderId);
  if (!order) {
    throw new Error('Order not found');
  }
  return order;
};

const changeOrderStatus = async (orderId, newStatus) => {
  const validStatuses = [
    'Submitted',
    'In Review',
    'Quoted',
    'Approved',
    'In Production',
    'Completed',
    'Cancelled'
  ];
  
  if (!validStatuses.includes(newStatus)) {
    throw new Error('Invalid order status');
  }

  const order = await designStudioOrderDAL.updateOrderStatus(
    orderId,
    newStatus
  );
  if (!order) {
    throw new Error('Order not found');
  }
  return order;
};

module.exports = {
  submitNewOrder,
  fetchAllOrders,
  fetchOrderDetails,
  changeOrderStatus
};

