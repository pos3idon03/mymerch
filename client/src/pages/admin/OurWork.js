import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaEye, FaTimes, FaUpload } from 'react-icons/fa';
import axios from 'axios';
import './Admin.css';

const OurWork = () => {
  const [ourWork, setOurWork] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    customerName: '',
    description: '',
    order: 0
  });
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchOurWork();
  }, []);

  const fetchOurWork = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/our-work/admin', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setOurWork(response.data);
    } catch (error) {
      console.error('Error fetching our work:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setSubmitting(true);
    
    try {
      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();
      
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('customerName', formData.customerName);
      formDataToSend.append('order', formData.order);
      
      // Add new images
      images.forEach(image => {
        formDataToSend.append('images', image);
      });
      
      // Add existing images if editing
      if (editingId && existingImages.length > 0) {
        formDataToSend.append('existingImages', JSON.stringify(existingImages));
      }

      if (editingId) {
        await axios.put(`/api/our-work/${editingId}`, formDataToSend, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } else {
        await axios.post('/api/our-work', formDataToSend, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }

      resetForm();
      fetchOurWork();
    } catch (error) {
      console.error('Error saving our work:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setFormData({
      title: item.title,
      customerName: item.customerName,
      description: item.description,
      order: item.order
    });
    setExistingImages(item.images || []);
    setImages([]);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this work post?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/our-work/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        fetchOurWork();
      } catch (error) {
        console.error('Error deleting our work:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      customerName: '',
      description: '',
      order: 0
    });
    setImages([]);
    setExistingImages([]);
    setEditingId(null);
    setShowForm(false);
    setSubmitting(false);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
  };

  const removeExistingImage = (index) => {
    setExistingImages(existingImages.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="admin-ourwork">
      <div className="page-header">
        <h1>Our Work</h1>
        <button 
          className="btn btn-primary" 
          onClick={() => setShowForm(true)}
        >
          <FaPlus /> Add Post
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="form-overlay">
          <div className="form-modal">
            <div className="form-header">
              <h2>{editingId ? 'Edit Work Post' : 'Add Work Post'}</h2>
              <button onClick={resetForm} className="close-btn">&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} className="admin-form">
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="form-input"
                  placeholder="Enter work post title"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Customer Name *</label>
                <input
                  type="text"
                  value={formData.customerName}
                  onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                  className="form-input"
                  placeholder="Enter customer name"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="form-textarea"
                  placeholder="Enter work description"
                  rows="3"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Order</label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({...formData, order: parseInt(e.target.value) || 0})}
                  className="form-input"
                  min="0"
                  placeholder="0"
                />
              </div>

              {/* Existing Images */}
              {existingImages.length > 0 && (
                <div className="form-group">
                  <label>Existing Images</label>
                  <div className="existing-images">
                    {existingImages.map((image, index) => (
                      <div key={index} className="existing-image">
                        <img src={image} alt={`Existing ${index + 1}`} />
                        <button
                          type="button"
                          className="remove-image"
                          onClick={() => removeExistingImage(index)}
                        >
                          <FaTimes />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New Images */}
              <div className="form-group">
                <label>Upload Images</label>
                <div className="file-upload">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className="file-input"
                    id="work-images"
                  />
                  <label htmlFor="work-images" className="file-label">
                    <FaUpload /> Choose Images
                  </label>
                </div>
                {images.length > 0 && (
                  <p className="file-info">Selected: {images.length} image(s)</p>
                )}
                <small>You can select multiple images. Max 10 images.</small>
              </div>

              <div className="form-actions">
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Saving...' : (editingId ? 'Update' : 'Create') + ' Work Post'}
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

      {/* Table */}
      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Title</th>
              <th>Customer</th>
              <th>Description</th>
              <th>Images</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {ourWork.map((item) => (
              <tr key={item._id}>
                <td>{item.order}</td>
                <td>{item.title}</td>
                <td>{item.customerName}</td>
                <td>
                  <div className="description-cell">
                    {item.description.length > 100 
                      ? `${item.description.substring(0, 100)}...` 
                      : item.description
                    }
                  </div>
                </td>
                <td>
                  <div className="images-preview">
                    {item.images && item.images.slice(0, 3).map((image, index) => (
                      <img 
                        key={index} 
                        src={image} 
                        alt={`Preview ${index + 1}`}
                        className="image-thumbnail"
                      />
                    ))}
                    {item.images && item.images.length > 3 && (
                      <span className="more-images">+{item.images.length - 3}</span>
                    )}
                  </div>
                </td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="btn btn-sm btn-secondary" 
                      onClick={() => handleEdit(item)}
                      title="Edit"
                    >
                      <FaEdit />
                    </button>
                    <button 
                      className="btn btn-sm btn-danger" 
                      onClick={() => handleDelete(item._id)}
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OurWork;
