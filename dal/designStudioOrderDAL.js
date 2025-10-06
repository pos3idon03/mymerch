const DesignStudioOrder = require('../models/DesignStudioOrder');

const createOrder = async (orderData) => {
  const order = new DesignStudioOrder(orderData);
  return await order.save();
};

const getAllOrders = async (filters = {}) => {
  const query = { ...filters };
  return await DesignStudioOrder.find(query)
    .populate('mockups.productId')
    .sort({ createdAt: -1 });
};

const getOrderById = async (orderId) => {
  return await DesignStudioOrder.findById(orderId)
    .populate('mockups.productId');
};

const updateOrderStatus = async (orderId, status) => {
  return await DesignStudioOrder.findByIdAndUpdate(
    orderId,
    { orderStatus: status },
    { new: true, runValidators: true }
  );
};

const deleteOrder = async (orderId) => {
  return await DesignStudioOrder.findByIdAndDelete(orderId);
};

module.exports = {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder
};

