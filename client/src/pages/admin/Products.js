import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaUpload } from 'react-icons/fa';
import axios from 'axios';
import './Admin.css';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categories: [],
    events: [],
    active: true,
    image: '',
    favicon: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [selectedFavicon, setSelectedFavicon] = useState(null);
  const [faviconPreview, setFaviconPreview] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetchData();
    fetchEvents();
  }, []);

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        axios.get('/api/products'),
        axios.get('/api/categories/all', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
      ]);
      setProducts(productsRes.data);
      setCategories(categoriesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const res = await axios.get('/api/events', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setEvents(res.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setError('');
    
    if (file) {
      // Validate file type
      if (!file.type.includes('image/')) {
        setError('Please select an image file');
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      
      setSelectedFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFaviconChange = (e) => {
    const file = e.target.files[0];
    setError('');
    if (file) {
      if (file.type !== 'image/png') {
        setError('Only PNG favicons are allowed');
        return;
      }
      if (file.size > 1024 * 1024) {
        setError('Favicon size must be less than 1MB');
        return;
      }
      setSelectedFavicon(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setFaviconPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => {
      if (prev.categories.includes(value)) {
        return { ...prev, categories: prev.categories.filter((id) => id !== value) };
      } else {
        return { ...prev, categories: [...prev.categories, value] };
      }
    });
  };

  const handleEventChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => {
      if (prev.events.includes(value)) {
        return { ...prev, events: prev.events.filter((id) => id !== value) };
      } else {
        return { ...prev, events: [...prev.events, value] };
      }
    });
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Title is required');
      return false;
    }
    
    if (!formData.description.trim()) {
      setError('Description is required');
      return false;
    }
    
    if (!formData.categories.length) {
      setError('Please select at least one category');
      return false;
    }
    
    if (!editingProduct && !selectedFile) {
      setError('Please select an image for new products');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('categories', JSON.stringify(formData.categories));
      formDataToSend.append('events', JSON.stringify(formData.events));
      formDataToSend.append('active', formData.active);
      if (selectedFile) {
        formDataToSend.append('image', selectedFile);
      }
      if (selectedFavicon) {
        formDataToSend.append('favicon', selectedFavicon);
      }
      if (editingProduct) {
        await axios.put(`/api/products/${editingProduct._id}`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
      } else {
        await axios.post('/api/products', formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
      }
      fetchData();
      resetForm();
    } catch (error) {
      console.error('Error saving product:', error);
      setError(error.response?.data?.message || 'Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`/api/products/${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        fetchData();
      } catch (error) {
        console.error('Error deleting product:', error);
        setError('Failed to delete product');
      }
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      title: product.title,
      description: product.description || '',
      categories: product.categories ? product.categories.map(c => c._id || c) : [],
      events: product.events ? product.events.map(e => e._id || e) : [],
      active: product.active,
      image: product.image || '',
      favicon: product.favicon || ''
    });
    setImagePreview(product.image ? product.image : '');
    setFaviconPreview(product.favicon ? product.favicon : '');
    setSelectedFile(null);
    setSelectedFavicon(null);
    setError('');
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      categories: [],
      events: [],
      active: true,
      image: '',
      favicon: ''
    });
    setEditingProduct(null);
    setSelectedFile(null);
    setImagePreview('');
    setSelectedFavicon(null);
    setFaviconPreview('');
    setError('');
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="admin-products">
      <div className="page-header">
        <h1>Manage Products</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
        >
          <FaPlus /> Add Product
        </button>
      </div>

      {showForm && (
        <div className="form-overlay">
          <div className="form-modal">
            <div className="form-header">
              <h2>{editingProduct ? 'Edit Product' : 'Add Product'}</h2>
              <button onClick={resetForm} className="close-btn">&times;</button>
            </div>
            
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="admin-form">
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                  className="form-input"
                  placeholder="Enter product title"
                />
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required
                  className="form-textarea"
                  placeholder="Enter product description"
                  rows="4"
                />
              </div>

              <div className="form-group">
                <label>Categories *</label>
                <div className="checklist-group prettier-checklist">
                  {categories.map(category => (
                    <label key={category._id} className="checklist-item prettier-checklist-item">
                      <input
                        type="checkbox"
                        value={category._id}
                        checked={formData.categories.includes(category._id)}
                        onChange={handleCategoryChange}
                        className="prettier-checkbox"
                      />
                      <span className="prettier-checkbox-custom"></span>
                      {category.name}
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Events</label>
                <div className="checklist-group prettier-checklist">
                  {events.map(event => (
                    <label key={event._id} className="checklist-item prettier-checklist-item">
                      <input
                        type="checkbox"
                        value={event._id}
                        checked={formData.events.includes(event._id)}
                        onChange={handleEventChange}
                        className="prettier-checkbox"
                      />
                      <span className="prettier-checkbox-custom"></span>
                      {event.name}
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Product Image {!editingProduct && '*'}</label>
                <div className="file-upload">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="file-input"
                    id="product-image"
                  />
                  <label htmlFor="product-image" className="file-label">
                    <FaUpload /> Choose Image
                  </label>
                </div>
                {selectedFile && (
                  <p className="file-info">Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</p>
                )}
                {editingProduct && !selectedFile && (
                  <p className="file-info">Current image will be kept</p>
                )}
              </div>

              {imagePreview && (
                <div className="form-group">
                  <label>Image Preview</label>
                  <div className="image-preview">
                    <img src={imagePreview} alt="Product preview" />
                  </div>
                </div>
              )}

              <div className="form-group">
                <label>Favicon (PNG, ≤1MB, square recommended)</label>
                <div className="file-upload">
                  <input
                    type="file"
                    accept="image/png"
                    onChange={handleFaviconChange}
                    className="file-input"
                    id="product-favicon"
                  />
                  <label htmlFor="product-favicon" className="file-label">
                    <FaUpload /> Choose Favicon
                  </label>
                </div>
                {selectedFavicon && (
                  <p className="file-info">Selected: {selectedFavicon.name} ({(selectedFavicon.size / 1024).toFixed(1)} KB)</p>
                )}
                {editingProduct && !selectedFavicon && faviconPreview && (
                  <p className="file-info">Current favicon will be kept</p>
                )}
              </div>
              {faviconPreview && (
                <div className="form-group">
                  <label>Favicon Preview</label>
                  <div className="image-preview">
                    <img src={faviconPreview} alt="Favicon preview" style={{ width: 32, height: 32, borderRadius: 4, border: '1px solid #eee' }} />
                  </div>
                </div>
              )}

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData({...formData, active: e.target.checked})}
                  />
                  Active
                </label>
              </div>

              <div className="form-actions">
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Saving...' : (editingProduct ? 'Update' : 'Create') + ' Product'}
                </button>
                <button 
                  type="button" 
                  onClick={resetForm} 
                  className="btn btn-secondary"
                  disabled={submitting}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Title</th>
              <th>Categories</th>
              <th>Events</th>
              <th>Favicon</th>
              <th>Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product._id}>
                <td>
                  {product.image && (
                    <img 
                      src={`http://localhost:5000${product.image}`} 
                      alt={product.title}
                      className="product-thumbnail"
                    />
                  )}
                </td>
                <td>{product.title}</td>
                <td>{product.categories?.map(c => c.name).join(', ') || 'N/A'}</td>
                <td>{product.events?.map(e => e.name).join(', ') || 'N/A'}</td>
                <td>
                  {product.favicon && (
                    <img src={product.favicon} alt="favicon" style={{ width: 24, height: 24, borderRadius: 4, border: '1px solid #eee' }} />
                  )}
                </td>
                <td>{product.active ? 'Yes' : 'No'}</td>
                <td>
                  <div className="action-buttons">
                    <button 
                      onClick={() => handleEdit(product)}
                      className="btn btn-sm btn-secondary"
                    >
                      <FaEdit />
                    </button>
                    <button 
                      onClick={() => handleDelete(product._id)}
                      className="btn btn-sm btn-danger"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {products.length === 0 && (
          <div className="empty-state">
            <p>No products found. Create your first product to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProducts; 