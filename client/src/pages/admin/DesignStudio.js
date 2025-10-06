import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Admin.css';

const DesignStudio = () => {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('products');
  const [showProductForm, setShowProductForm] = useState(false);
  const [showColorForm, setShowColorForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    category: 'tshirt',
    active: true,
    displayOrder: 0
  });
  const [colorForm, setColorForm] = useState({
    colorName: '',
    colorCode: '#ffffff',
    frontImage: null,
    backImage: null
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (activeTab === 'products') {
      fetchProducts();
    } else {
      fetchOrders();
    }
  }, [activeTab]);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/design-studio/products', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(res.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/design-studio/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(res.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const handleProductFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProductForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleColorFormChange = (e) => {
    const { name, value, files } = e.target;
    setColorForm(prev => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/design-studio/products', productForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setMessage('Product created successfully!');
      setShowProductForm(false);
      setProductForm({
        name: '',
        category: 'tshirt',
        active: true,
        displayOrder: 0
      });
      fetchProducts();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error creating product');
    } finally {
      setLoading(false);
    }
  };

  const handleAddColorVariant = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('colorName', colorForm.colorName);
      formData.append('colorCode', colorForm.colorCode);
      formData.append('frontImage', colorForm.frontImage);
      if (colorForm.backImage) {
        formData.append('backImage', colorForm.backImage);
      }

      await axios.post(
        `/api/design-studio/products/${selectedProduct._id}/color-variants`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setMessage('Color variant added successfully!');
      setShowColorForm(false);
      setColorForm({
        colorName: '',
        colorCode: '#ffffff',
        frontImage: null,
        backImage: null
      });
      fetchProducts();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error adding color variant');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Delete this product?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/design-studio/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Product deleted successfully');
      fetchProducts();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error deleting product');
    }
  };

  const handleDeleteColorVariant = async (productId, variantId) => {
    if (!window.confirm('Delete this color variant?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `/api/design-studio/products/${productId}/color-variants/${variantId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage('Color variant deleted successfully');
      fetchProducts();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error deleting variant');
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `/api/design-studio/orders/${orderId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage('Order status updated successfully');
      fetchOrders();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error updating status');
    }
  };

  return (
    <div className="admin-section">
      <h2>Design Studio Management</h2>

      {message && (
        <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          Products
        </button>
        <button
          className={`tab ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          Orders
        </button>
      </div>

      {activeTab === 'products' && (
        <div className="products-tab">
          <button
            className="btn btn-primary"
            onClick={() => setShowProductForm(!showProductForm)}
          >
            {showProductForm ? 'Cancel' : 'Add New Product'}
          </button>

          {showProductForm && (
            <form className="admin-form" onSubmit={handleCreateProduct}>
              <div className="form-group">
                <label>Product Name</label>
                <input
                  type="text"
                  name="name"
                  value={productForm.name}
                  onChange={handleProductFormChange}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Category</label>
                <select
                  name="category"
                  value={productForm.category}
                  onChange={handleProductFormChange}
                  className="form-input"
                >
                  <option value="tshirt">T-Shirt</option>
                  <option value="hoodie">Hoodie</option>
                  <option value="mug">Mug</option>
                  <option value="phone-case">Phone Case</option>
                  <option value="tote-bag">Tote Bag</option>
                  <option value="cap">Cap</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Display Order</label>
                <input
                  type="number"
                  name="displayOrder"
                  value={productForm.displayOrder}
                  onChange={handleProductFormChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    name="active"
                    checked={productForm.active}
                    onChange={handleProductFormChange}
                  />
                  Active
                </label>
              </div>

              <button type="submit" className="btn btn-success" disabled={loading}>
                {loading ? 'Creating...' : 'Create Product'}
              </button>
            </form>
          )}

          <div className="products-list">
            {products.map(product => (
              <div key={product._id} className="product-item">
                <div className="product-header">
                  <h3>{product.name}</h3>
                  <span className={`badge ${product.active ? 'active' : 'inactive'}`}>
                    {product.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p>Category: {product.category}</p>
                
                <div className="color-variants">
                  <h4>Color Variants ({product.colorVariants?.length || 0})</h4>
                  <div className="variants-grid">
                    {product.colorVariants?.map(variant => (
                      <div key={variant._id} className="variant-item">
                        <div
                          className="color-swatch"
                          style={{ backgroundColor: variant.colorCode }}
                        />
                        <span>{variant.colorName}</span>
                        {variant.frontImage && (
                          <img
                            src={variant.frontImage}
                            alt={`${variant.colorName} front`}
                            className="variant-thumbnail"
                          />
                        )}
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteColorVariant(
                            product._id,
                            variant._id
                          )}
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <button
                    className="btn btn-secondary"
                    onClick={() => {
                      setSelectedProduct(product);
                      setShowColorForm(true);
                    }}
                  >
                    Add Color Variant
                  </button>
                </div>

                <button
                  className="btn btn-danger"
                  onClick={() => handleDeleteProduct(product._id)}
                >
                  Delete Product
                </button>
              </div>
            ))}
          </div>

          {showColorForm && selectedProduct && (
            <div className="modal">
              <div className="modal-content">
                <h3>Add Color Variant to {selectedProduct.name}</h3>
                <form onSubmit={handleAddColorVariant}>
                  <div className="form-group">
                    <label>Color Name</label>
                    <input
                      type="text"
                      name="colorName"
                      value={colorForm.colorName}
                      onChange={handleColorFormChange}
                      required
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>Color Code</label>
                    <input
                      type="color"
                      name="colorCode"
                      value={colorForm.colorCode}
                      onChange={handleColorFormChange}
                      required
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>Front Image *</label>
                    <input
                      type="file"
                      name="frontImage"
                      onChange={handleColorFormChange}
                      accept="image/*"
                      required
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>Back Image (Optional)</label>
                    <input
                      type="file"
                      name="backImage"
                      onChange={handleColorFormChange}
                      accept="image/*"
                      className="form-input"
                    />
                  </div>

                  <div className="modal-actions">
                    <button
                      type="submit"
                      className="btn btn-success"
                      disabled={loading}
                    >
                      {loading ? 'Adding...' : 'Add Variant'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        setShowColorForm(false);
                        setSelectedProduct(null);
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="orders-tab">
          <div className="orders-list">
            {orders.map(order => (
              <div key={order._id} className="order-item">
                <div className="order-header">
                  <h3>Order #{order._id.slice(-6)}</h3>
                  <span className="order-date">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="order-details">
                  <p><strong>Email:</strong> {order.customerEmail}</p>
                  <p><strong>Phone:</strong> {order.customerPhone}</p>
                  <p><strong>Total Quantity:</strong> {order.totalQuantity}</p>
                  <p><strong>Mockups:</strong> {order.mockups?.length || 0}</p>
                  <p><strong>Status:</strong> {order.orderStatus}</p>
                </div>

                <div className="order-mockups">
                  {order.mockups?.map((mockup, idx) => (
                    <div key={idx} className="mockup-item">
                      <img
                        src={mockup.mockupImage}
                        alt={`Mockup ${idx + 1}`}
                        className="mockup-thumbnail"
                      />
                      <div className="mockup-details">
                        <p>{mockup.productName}</p>
                        <p>Color: {mockup.colorName}</p>
                        <p>View: {mockup.view}</p>
                        <p>Qty: {mockup.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="form-group">
                  <label>Update Status:</label>
                  <select
                    value={order.orderStatus}
                    onChange={(e) => handleUpdateOrderStatus(
                      order._id,
                      e.target.value
                    )}
                    className="form-input"
                  >
                    <option value="Submitted">Submitted</option>
                    <option value="In Review">In Review</option>
                    <option value="Quoted">Quoted</option>
                    <option value="Approved">Approved</option>
                    <option value="In Production">In Production</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            ))}
            {orders.length === 0 && (
              <p>No orders found.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DesignStudio;

