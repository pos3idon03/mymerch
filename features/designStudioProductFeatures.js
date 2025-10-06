const designStudioProductDAL = require('../dal/designStudioProductDAL');

const fetchAllProducts = async (activeOnly = false) => {
  const filters = activeOnly ? { active: true } : {};
  return await designStudioProductDAL.getAllProducts(filters);
};

const fetchProductDetails = async (productId) => {
  const product = await designStudioProductDAL.getProductById(productId);
  if (!product) {
    throw new Error('Product not found');
  }
  return product;
};

const addNewProduct = async (productData) => {
  return await designStudioProductDAL.createProduct(productData);
};

const modifyProduct = async (productId, updateData) => {
  const product = await designStudioProductDAL.updateProduct(
    productId,
    updateData
  );
  if (!product) {
    throw new Error('Product not found');
  }
  return product;
};

const removeProduct = async (productId) => {
  const product = await designStudioProductDAL.deleteProduct(productId);
  if (!product) {
    throw new Error('Product not found');
  }
  return product;
};

module.exports = {
  fetchAllProducts,
  fetchProductDetails,
  addNewProduct,
  modifyProduct,
  removeProduct
};

