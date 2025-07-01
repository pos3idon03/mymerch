import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaUpload } from 'react-icons/fa';
import axios from 'axios';
import './Admin.css';

const AdminAbout = () => {
  const [aboutContent, setAboutContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAbout, setEditingAbout] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    active: true
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAboutContent();
  }, []);

  const fetchAboutContent = async () => {
    try {
      const response = await axios.get('/api/about/admin', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setAboutContent(response.data);
    } catch (error) {
      console.error('Error fetching about content:', error);
      setError('Failed to fetch about content');
    } finally {
      setLoading(false);
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

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Title is required');
      return false;
    }
    
    if (!formData.content.trim()) {
      setError('Content is required');
      return false;
    }
    
    if (!editingAbout && !selectedFile) {
      setError('Please select a banner image for new about content');
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
      formDataToSend.append('content', formData.content);
      formDataToSend.append('active', formData.active);
      
      if (selectedFile) {
        formDataToSend.append('bannerImage', selectedFile);
      }

      if (editingAbout) {
        await axios.put(`/api/about/${editingAbout._id}`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
      } else {
        await axios.post('/api/about', formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
      }
      
      fetchAboutContent();
      resetForm();
    } catch (error) {
      console.error('Error saving about content:', error);
      setError(error.response?.data?.message || 'Failed to save about content');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this about content?')) {
      try {
        await axios.delete(`/api/about/${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        fetchAboutContent();
      } catch (error) {
        console.error('Error deleting about content:', error);
        setError('Failed to delete about content');
      }
    }
  };

  const handleEdit = (about) => {
    setEditingAbout(about);
    setFormData({
      title: about.title,
      content: about.content,
      active: about.active
    });
    setImagePreview(about.bannerImage ? `http://localhost:5000${about.bannerImage}` : '');
    setSelectedFile(null);
    setError('');
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      active: true
    });
    setEditingAbout(null);
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
    <div className="admin-about">
      <div className="page-header">
        <h1>Manage About Page</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
        >
          <FaPlus /> Add About Content
        </button>
      </div>

      {showForm && (
        <div className="form-overlay">
          <div className="form-modal">
            <div className="form-header">
              <h2>{editingAbout ? 'Edit About Content' : 'Add About Content'}</h2>
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
                  placeholder="Enter about page title"
                />
              </div>

              <div className="form-group">
                <label>Banner Image {!editingAbout && '*'}</label>
                <div className="file-upload">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="file-input"
                    id="banner-image"
                  />
                  <label htmlFor="banner-image" className="file-label">
                    <FaUpload /> Choose Banner Image
                  </label>
                </div>
                {selectedFile && (
                  <p className="file-info">Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</p>
                )}
                {editingAbout && !selectedFile && (
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
                <label>Content *</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  required
                  className="form-textarea"
                  rows="12"
                  placeholder="Enter about page content"
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

              <div className="form-actions">
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Saving...' : (editingAbout ? 'Update' : 'Create') + ' Content'}
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
              <th>Banner Image</th>
              <th>Title</th>
              <th>Content Preview</th>
              <th>Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {aboutContent.map(about => (
              <tr key={about._id}>
                <td>
                  {about.bannerImage && (
                    <img 
                      src={`http://localhost:5000${about.bannerImage}`} 
                      alt="Banner"
                      className="about-banner-thumbnail"
                    />
                  )}
                </td>
                <td>{about.title}</td>
                <td>
                  <div className="content-preview">
                    {about.content.length > 100 
                      ? `${about.content.substring(0, 100)}...` 
                      : about.content
                    }
                  </div>
                </td>
                <td>{about.active ? 'Yes' : 'No'}</td>
                <td>
                  <div className="action-buttons">
                    <button 
                      onClick={() => handleEdit(about)}
                      className="btn btn-sm btn-secondary"
                    >
                      <FaEdit />
                    </button>
                    <button 
                      onClick={() => handleDelete(about._id)}
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
        
        {aboutContent.length === 0 && (
          <div className="empty-state">
            <p>No about content found. Create your first about content to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAbout; 