import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaUpload } from 'react-icons/fa';
import axios from 'axios';
import './Admin.css';

const AdminBanners = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    link: '',
    order: 0,
    active: true,
    placement: 'homepage'
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const response = await axios.get('/api/banner');
      setBanners(response.data);
    } catch (error) {
      console.error('Error fetching banners:', error);
      setError('Failed to fetch banners');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setError('');
    
    if (file) {
      // Validate file type
      if (!file.type.includes('image/png')) {
        setError('Please select a PNG image file');
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

  const validateForm = () => {
    // if (!formData.title.trim()) {
    //   setError('Title is required');
    //   return false;
    // }
    
    if (!editingBanner && !selectedFile) {
      setError('Please select an image for new banners');
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
      formDataToSend.append('subtitle', formData.subtitle);
      formDataToSend.append('link', formData.link);
      formDataToSend.append('order', formData.order);
      formDataToSend.append('active', formData.active);
      formDataToSend.append('placement', formData.placement);
      
      if (selectedFile) {
        formDataToSend.append('image', selectedFile);
      }

      if (editingBanner) {
        await axios.put(`/api/banner/${editingBanner._id}`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
      } else {
        await axios.post('/api/banner', formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
      }
      
      fetchBanners();
      resetForm();
    } catch (error) {
      console.error('Error saving banner:', error);
      setError(error.response?.data?.message || 'Failed to save banner');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this banner?')) {
      try {
        await axios.delete(`/api/banner/${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        fetchBanners();
      } catch (error) {
        console.error('Error deleting banner:', error);
        setError('Failed to delete banner');
      }
    }
  };

  const handleEdit = (banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle || '',
      link: banner.link || '',
      order: banner.order,
      active: banner.active,
      placement: banner.placement || 'homepage'
    });
    setImagePreview(banner.image ? `${banner.image}` : '');
    setSelectedFile(null);
    setError('');
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      subtitle: '',
      link: '',
      order: 0,
      active: true,
      placement: 'homepage'
    });
    setEditingBanner(null);
    setSelectedFile(null);
    setImagePreview('');
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
    <div className="admin-banners">
      <div className="page-header">
        <h1>Manage Banners</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
        >
          <FaPlus /> Add Banner
        </button>
      </div>

      {showForm && (
        <div className="form-overlay">
          <div className="form-modal">
            <div className="form-header">
              <h2>{editingBanner ? 'Edit Banner' : 'Add Banner'}</h2>
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
                  //required
                  className="form-input"
                  placeholder="Enter banner title"
                />
              </div>

              <div className="form-group">
                <label>Subtitle</label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
                  className="form-input"
                  placeholder="Enter banner subtitle"
                />
              </div>

              <div className="form-group">
                <label>Link</label>
                <input
                  type="text"
                  value={formData.link}
                  onChange={(e) => setFormData({...formData, link: e.target.value})}
                  className="form-input"
                  placeholder="Enter link URL (optional)"
                />
              </div>

              <div className="form-group">
                <label>Order</label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({...formData, order: parseInt(e.target.value) || 0})}
                  className="form-input"
                  placeholder="Display order"
                />
              </div>

              <div className="form-group">
                <label>Placement</label>
                <select
                  className="form-input"
                  value={formData.placement}
                  onChange={e => setFormData({ ...formData, placement: e.target.value })}
                >
                  <option value="homepage">Homepage</option>
                  <option value="custom-order">Custom Order Section</option>
                  <option value="offer-banner">Offer Banner</option>
                  <option value="customers-banner">Customers Banner</option>
                  <option value="categories">Categories Section</option>
                  <option value="event-banner">Event Banner</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Banner Image {!editingBanner && '*'}</label>
                <div className="file-upload">
                  <input
                    type="file"
                    accept="image/png"
                    onChange={handleFileChange}
                    className="file-input"
                    id="banner-image"
                  />
                  <label htmlFor="banner-image" className="file-label">
                    <FaUpload /> Choose PNG Image
                  </label>
                </div>
                {selectedFile && (
                  <p className="file-info">Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</p>
                )}
                {editingBanner && !selectedFile && (
                  <p className="file-info">Current image will be kept</p>
                )}
              </div>

              {imagePreview && (
                <div className="form-group">
                  <label>Image Preview</label>
                  <div className="image-preview">
                    <img src={imagePreview} alt="Banner preview" />
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
                  {submitting ? 'Saving...' : (editingBanner ? 'Update' : 'Create') + ' Banner'}
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
              <th>Subtitle</th>
              <th>Order</th>
              <th>Placement</th>
              <th>Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {banners.map(banner => (
              <tr key={banner._id}>
                <td>
                  {banner.image && (
                    <img 
                      //src={`http://localhost:5000${banner.image}`} 
                      src={banner.image} 
                      alt={banner.title}
                      className="banner-thumbnail"
                    />
                  )}
                </td>
                <td>{banner.title}</td>
                <td>{banner.subtitle}</td>
                <td>{banner.order}</td>
                <td>{banner.placement}</td>
                <td>{banner.active ? 'Yes' : 'No'}</td>
                <td>
                  <div className="action-buttons">
                    <button 
                      onClick={() => handleEdit(banner)}
                      className="btn btn-sm btn-secondary"
                    >
                      <FaEdit />
                    </button>
                    <button 
                      onClick={() => handleDelete(banner._id)}
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
        
        {banners.length === 0 && (
          <div className="empty-state">
            <p>No banners found. Create your first banner to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBanners; 