import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaUpload } from 'react-icons/fa';
import axios from 'axios';
import './Admin.css';

const AdminTestimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState(null);
  const [formData, setFormData] = useState({
    customerName: '',
    testimonial: '',
    active: true
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const response = await axios.get('/api/testimonials');
      setTestimonials(response.data);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      setError('Failed to fetch testimonials');
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
    if (!formData.customerName.trim()) {
      setError('Customer name is required');
      return false;
    }
    
    if (!formData.testimonial.trim()) {
      setError('Testimonial content is required');
      return false;
    }
    
    if (!editingTestimonial && !selectedFile) {
      setError('Please select a company logo for new testimonials');
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
      formDataToSend.append('customerName', formData.customerName);
      formDataToSend.append('testimonial', formData.testimonial);
      formDataToSend.append('active', formData.active);
      
      if (selectedFile) {
        formDataToSend.append('companyLogo', selectedFile);
      }

      if (editingTestimonial) {
        await axios.put(`/api/testimonials/${editingTestimonial._id}`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
      } else {
        await axios.post('/api/testimonials', formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
      }
      
      fetchTestimonials();
      resetForm();
    } catch (error) {
      console.error('Error saving testimonial:', error);
      setError(error.response?.data?.message || 'Failed to save testimonial');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this testimonial?')) {
      try {
        await axios.delete(`/api/testimonials/${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        fetchTestimonials();
      } catch (error) {
        console.error('Error deleting testimonial:', error);
        setError('Failed to delete testimonial');
      }
    }
  };

  const handleEdit = (testimonial) => {
    setEditingTestimonial(testimonial);
    setFormData({
      customerName: testimonial.customerName,
      testimonial: testimonial.testimonial,
      active: testimonial.active
    });
    setImagePreview(testimonial.companyLogo ? `http://localhost:5000${testimonial.companyLogo}` : '');
    setSelectedFile(null);
    setError('');
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      customerName: '',
      testimonial: '',
      active: true
    });
    setEditingTestimonial(null);
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
    <div className="admin-testimonials">
      <div className="page-header">
        <h1>Manage Testimonials</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
        >
          <FaPlus /> Add Testimonial
        </button>
      </div>

      {showForm && (
        <div className="form-overlay">
          <div className="form-modal">
            <div className="form-header">
              <h2>{editingTestimonial ? 'Edit Testimonial' : 'Add Testimonial'}</h2>
              <button onClick={resetForm} className="close-btn">&times;</button>
            </div>
            
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="admin-form">
              <div className="form-group">
                <label>Customer Name *</label>
                <input
                  type="text"
                  value={formData.customerName}
                  onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                  //required
                  className="form-input"
                  placeholder="Enter customer name"
                />
              </div>

              <div className="form-group">
                <label>Company Logo {!editingTestimonial && '*'}</label>
                <div className="file-upload">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="file-input"
                    id="company-logo"
                  />
                  <label htmlFor="company-logo" className="file-label">
                    <FaUpload /> Choose Logo
                  </label>
                </div>
                {selectedFile && (
                  <p className="file-info">Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</p>
                )}
                {editingTestimonial && !selectedFile && (
                  <p className="file-info">Current logo will be kept</p>
                )}
              </div>

              {imagePreview && (
                <div className="form-group">
                  <label>Logo Preview</label>
                  <div className="image-preview">
                    <img src={imagePreview} alt="Company logo preview" />
                  </div>
                </div>
              )}

              <div className="form-group">
                <label>Testimonial *</label>
                <textarea
                  value={formData.testimonial}
                  onChange={(e) => setFormData({...formData, testimonial: e.target.value})}
                  required
                  className="form-textarea"
                  rows="6"
                  placeholder="Enter customer testimonial"
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
                  {submitting ? 'Saving...' : (editingTestimonial ? 'Update' : 'Create') + ' Testimonial'}
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
              <th>Logo</th>
              <th>Customer Name</th>
              <th>Testimonial</th>
              <th>Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {testimonials.map(testimonial => (
              <tr key={testimonial._id}>
                <td>
                  {testimonial.companyLogo && (
                    <img 
                      src={`http://localhost:5000${testimonial.companyLogo}`} 
                      alt="Company logo"
                      className="testimonial-logo"
                    />
                  )}
                </td>
                <td>{testimonial.customerName}</td>
                <td>
                  <div className="testimonial-preview">
                    {testimonial.testimonial.length > 100 
                      ? `${testimonial.testimonial.substring(0, 100)}...` 
                      : testimonial.testimonial
                    }
                  </div>
                </td>
                <td>{testimonial.active ? 'Yes' : 'No'}</td>
                <td>
                  <div className="action-buttons">
                    <button 
                      onClick={() => handleEdit(testimonial)}
                      className="btn btn-sm btn-secondary"
                    >
                      <FaEdit />
                    </button>
                    <button 
                      onClick={() => handleDelete(testimonial._id)}
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
        
        {testimonials.length === 0 && (
          <div className="empty-state">
            <p>No testimonials found. Create your first testimonial to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminTestimonials; 