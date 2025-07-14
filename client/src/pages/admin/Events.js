import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaUpload } from 'react-icons/fa';
import axios from 'axios';
import './Admin.css';

const AdminEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    active: true,
    image: '',
    favicon: ''
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [selectedFavicon, setSelectedFavicon] = useState(null);
  const [faviconPreview, setFaviconPreview] = useState('');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get('/api/events/all', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
      setError('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Event name is required');
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
        const res = await axios.post('/api/events/upload', formDataImg, {
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
        const res = await axios.post('/api/events/upload', formDataFavicon, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        faviconUrl = res.data.imageUrl;
      }
      const payload = { ...formData, image: imageUrl, favicon: faviconUrl };
      if (editingEvent) {
        await axios.put(`/api/events/${editingEvent._id}`, payload, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
      } else {
        await axios.post('/api/events', payload, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
      }
      
      fetchEvents();
      resetForm();
    } catch (error) {
      console.error('Error saving event:', error);
      setError(error.response?.data?.message || 'Failed to save event');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await axios.delete(`/api/events/${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        fetchEvents();
      } catch (error) {
        console.error('Error deleting event:', error);
        setError('Failed to delete event');
      }
    }
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setFormData({
      name: event.name,
      description: event.description || '',
      active: event.active,
      image: event.image || '',
      favicon: event.favicon || ''
    });
    setImagePreview(event.image ? event.image : '');
    setFaviconPreview(event.favicon ? event.favicon : '');
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
    setEditingEvent(null);
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
        <h1>Manage Events</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
        >
          <FaPlus /> Add Event
        </button>
      </div>

      {showForm && (
        <div className="form-overlay">
          <div className="form-modal">
            <div className="form-header">
              <h2>{editingEvent ? 'Edit Event' : 'Add Event'}</h2>
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
                  //required
                  className="form-input"
                  placeholder="Enter event name"
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="form-textarea"
                  placeholder="Enter event description"
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Event Image *</label>
                <div className="file-upload">
                  <input
                    type="file"
                    accept="image/png"
                    onChange={handleFileChange}
                    className="file-input"
                    id="event-image"
                  />
                  <label htmlFor="event-image" className="file-label">
                    <FaUpload /> Choose PNG
                  </label>
                </div>
                {selectedFile && (
                  <p className="file-info">Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</p>
                )}
                {editingEvent && !selectedFile && (
                  <p className="file-info">Current image will be kept</p>
                )}
              </div>

              {imagePreview && (
                <div className="form-group">
                  <label>Image Preview</label>
                  <div className="image-preview">
                    <img src={imagePreview} alt="Event preview" loading='lazy'/>
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
                    id="event-favicon"
                  />
                  <label htmlFor="event-favicon" className="file-label">
                    <FaUpload /> Choose Favicon
                  </label>
                </div>
                {selectedFavicon && (
                  <p className="file-info">Selected: {selectedFavicon.name} ({(selectedFavicon.size / 1024).toFixed(1)} KB)</p>
                )}
                {editingEvent && !selectedFavicon && faviconPreview && (
                  <p className="file-info">Current favicon will be kept</p>
                )}
              </div>
              {faviconPreview && (
                <div className="form-group">
                  <label>Favicon Preview</label>
                  <div className="image-preview">
                    <img src={faviconPreview} alt="Favicon preview" style={{ width: 32, height: 32, borderRadius: 4, border: '1px solid #eee' }} loading='lazy'/>
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
                  {submitting ? 'Saving...' : (editingEvent ? 'Update' : 'Create') + ' Event'}
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
              <th>Name</th>
              <th>Description</th>
              <th>Image</th>
              <th>Favicon</th>
              <th>Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.map(event => (
              <tr key={event._id}>
                <td>{event.name}</td>
                <td>{event.description}</td>
                <td>{event.image ? <img src={event.image} alt={event.name} style={{width: '60px', height: '40px', objectFit: 'cover'}} loading='lazy'/> : 'No image'}</td>
                <td>
                  {event.favicon && (
                    <img src={event.favicon} alt="favicon" style={{ width: 24, height: 24, borderRadius: 4, border: '1px solid #eee' }} loading='lazy'/>
                  )}
                </td>
                <td>{event.active ? 'Yes' : 'No'}</td>
                <td>
                  <div className="action-buttons">
                    <button 
                      onClick={() => handleEdit(event)}
                      className="btn btn-sm btn-secondary"
                    >
                      <FaEdit />
                    </button>
                    <button 
                      onClick={() => handleDelete(event._id)}
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
        
        {events.length === 0 && (
          <div className="empty-state">
            <p>No events found. Create your first event to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminEvents; 