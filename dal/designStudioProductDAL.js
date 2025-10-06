const DesignStudioProduct = require('../models/DesignStudioProduct');

const getAllProducts = async (filters = {}) => {
  const query = { ...filters };
  return await DesignStudioProduct.find(query).sort({ displayOrder: 1, name: 1 });
};

const getProductById = async (productId) => {
  return await DesignStudioProduct.findById(productId);
};

const createProduct = async (productData) => {
  const product = new DesignStudioProduct(productData);
  return await product.save();
};

const updateProduct = async (productId, updateData) => {
  return await DesignStudioProduct.findByIdAndUpdate(
    productId,
    updateData,
    { new: true, runValidators: true }
  );
};

const deleteProduct = async (productId) => {
  return await DesignStudioProduct.findByIdAndDelete(productId);
};

const addColorVariant = async (productId, variantData) => {
  return await DesignStudioProduct.findByIdAndUpdate(
    productId,
    { $push: { colorVariants: variantData } },
    { new: true, runValidators: true }
  );
};

const updateColorVariant = async (productId, variantId, variantData) => {
  return await DesignStudioProduct.findOneAndUpdate(
    { _id: productId, 'colorVariants._id': variantId },
    { $set: { 'colorVariants.$': variantData } },
    { new: true, runValidators: true }
  );
};

const deleteColorVariant = async (productId, variantId) => {
  return await DesignStudioProduct.findByIdAndUpdate(
    productId,
    { $pull: { colorVariants: { _id: variantId } } },
    { new: true }
  );
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  addColorVariant,
  updateColorVariant,
  deleteColorVariant
};

