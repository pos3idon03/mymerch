import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaUpload } from 'react-icons/fa';
import axios from 'axios';
import './Admin.css';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    active: true
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [selectedFavicon, setSelectedFavicon] = useState(null);
  const [faviconPreview, setFaviconPreview] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/categories/all', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Category name is required');
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
      let imageUrl = formData.image;
      if (selectedFile) {
        const formDataImg = new FormData();
        formDataImg.append('image', selectedFile);
        const res = await axios.post('/api/categories/upload', formDataImg, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        imageUrl = res.data.imageUrl;
      }
      let faviconUrl = formData.favicon;
      if (selectedFavicon) {
        const formDataFavicon = new FormData();
        formDataFavicon.append('image', selectedFavicon);
        const res = await axios.post('/api/categories/upload', formDataFavicon, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        faviconUrl = res.data.imageUrl;
      }
      const payload = { ...formData, image: imageUrl, favicon: faviconUrl };
      if (editingCategory) {
        await axios.put(`/api/categories/${editingCategory._id}`, payload, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
      } else {
        await axios.post('/api/categories', payload, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
      }
      
      fetchCategories();
      resetForm();
    } catch (error) {
      console.error('Error saving category:', error);
      setError(error.response?.data?.message || 'Failed to save category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await axios.delete(`/api/categories/${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        fetchCategories();
      } catch (error) {
        console.error('Error deleting category:', error);
        setError('Failed to delete category');
      }
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      active: category.active,
      image: category.image || '',
      favicon: category.favicon || ''
    });
    setImagePreview(category.image ? category.image : '');
    setFaviconPreview(category.favicon ? category.favicon : '');
    setSelectedFile(null);
    setSelectedFavicon(null);
    setError('');
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      active: true,
      image: '',
      favicon: ''
    });
    setEditingCategory(null);
    setSelectedFile(null);
    setImagePreview('');
    setSelectedFavicon(null);
    setFaviconPreview('');
    setError('');
    setShowForm(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setError('');
    if (file) {
      if (file.type !== 'image/png') {
        setError('Only PNG images are allowed');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      setSelectedFile(file);
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

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="admin-categories">
      <div className="page-header">
        <h1>Manage Categories</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
        >
          <FaPlus /> Add Category
        </button>
      </div>

      {showForm && (
        <div className="form-overlay">
          <div className="form-modal">
            <div className="form-header">
              <h2>{editingCategory ? 'Edit Category' : 'Add Category'}</h2>
              <button onClick={resetForm} className="close-btn">&times;</button>
            </div>
            
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="admin-form">
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="form-input"
                  placeholder="Enter category name"
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="form-textarea"
                  placeholder="Enter category description"
                  rows="3"
                />
              </div>

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

              <div className="form-group">
                <label>Category Image {!editingCategory && '*'}</label>
                <div className="file-upload">
                  <input
                    type="file"
                    accept="image/png"
                    onChange={handleFileChange}
                    className="file-input"
                    id="category-image"
                  />
                  <label htmlFor="category-image" className="file-label">
                    <FaUpload /> Choose PNG Image
                  </label>
                </div>
                {selectedFile && (
                  <p className="file-info">Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</p>
                )}
                {editingCategory && !selectedFile && formData.image && (
                  <p className="file-info">Current image will be kept</p>
                )}
              </div>

              {imagePreview && (
                <div className="form-group">
                  <label>Image Preview</label>
                  <div className="image-preview">
                    <img src={imagePreview} alt="Category preview" />
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
                    id="category-favicon"
                  />
                  <label htmlFor="category-favicon" className="file-label">
                    <FaUpload /> Choose Favicon
                  </label>
                </div>
                {selectedFavicon && (
                  <p className="file-info">Selected: {selectedFavicon.name} ({(selectedFavicon.size / 1024).toFixed(1)} KB)</p>
                )}
                {editingCategory && !selectedFavicon && formData.favicon && (
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

              <div className="form-actions">
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Saving...' : (editingCategory ? 'Update' : 'Create') + ' Category'}
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
              <th>Name</th>
              <th>Description</th>
              <th>Active</th>
              <th>Favicon</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map(category => (
              <tr key={category._id}>
                <td>
                  {category.image && (
                    <img 
                      src={category.image} 
                      alt={category.name}
                      className="category-thumbnail"
                    />
                  )}
                </td>
                <td>{category.name}</td>
                <td>{category.description}</td>
                <td>{category.active ? 'Yes' : 'No'}</td>
                <td>
                  {category.favicon && (
                    <img 
                      src={category.favicon} 
                      alt="favicon" 
                      style={{ width: 24, height: 24, borderRadius: 4, border: '1px solid #eee' }} 
                    />
                  )}
                </td>
                <td>
                  <div className="action-buttons">
                    <button 
                      onClick={() => handleEdit(category)}
                      className="btn btn-sm btn-secondary"
                    >
                      <FaEdit />
                    </button>
                    <button 
                      onClick={() => handleDelete(category._id)}
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
        
        {categories.length === 0 && (
          <div className="empty-state">
            <p>No categories found. Create your first category to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCategories; 