import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus, FaEdit, FaTrash, FaTimes } from 'react-icons/fa';
import './Admin.css';

const FAQ = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState(null);
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    order: 0
  });

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      const response = await axios.get('/api/faq');
      setFaqs(response.data);
    } catch (error) {
      setError('Failed to fetch FAQs');
      console.error('Error fetching FAQs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.question.trim() || !formData.answer.trim()) {
      setError('Question and answer are required');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      console.log('Token:', token); // Debug log
      
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      console.log('Headers:', headers); // Debug log

      if (editingFAQ) {
        console.log('Updating FAQ:', editingFAQ._id); // Debug log
        await axios.put(`/api/faq/${editingFAQ._id}`, formData, { headers });
      } else {
        console.log('Creating new FAQ'); // Debug log
        await axios.post('/api/faq', formData, { headers });
      }
      
      setShowForm(false);
      setEditingFAQ(null);
      setFormData({ question: '', answer: '', order: 0 });
      setError('');
      fetchFAQs();
    } catch (error) {
      console.error('FAQ Error:', error.response?.data || error.message); // Debug log
      setError(error.response?.data?.message || 'Failed to save FAQ');
    }
  };

  const handleEdit = (faq) => {
    setEditingFAQ(faq);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      order: faq.order
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this FAQ?')) {
      try {
        const token = localStorage.getItem('token');
        console.log('Delete Token:', token); // Debug log
        
        await axios.delete(`/api/faq/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        fetchFAQs();
      } catch (error) {
        console.error('Delete Error:', error.response?.data || error.message); // Debug log
        setError('Failed to delete FAQ');
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingFAQ(null);
    setFormData({ question: '', answer: '', order: 0 });
    setError('');
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Manage FAQs</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
        >
          <FaPlus /> Add New FAQ
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {showForm && (
        <div className="form-overlay">
          <div className="form-container">
            <div className="form-header">
              <h2>{editingFAQ ? 'Edit FAQ' : 'Add New FAQ'}</h2>
              <button className="close-btn" onClick={handleCancel}>
                <FaTimes />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="admin-form">
              <div className="form-group">
                <label htmlFor="question">Question *</label>
                <input
                  type="text"
                  id="question"
                  name="question"
                  value={formData.question}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                  placeholder="Enter the question"
                />
              </div>

              <div className="form-group">
                <label htmlFor="answer">Answer *</label>
                <textarea
                  id="answer"
                  name="answer"
                  value={formData.answer}
                  onChange={handleInputChange}
                  required
                  rows="4"
                  className="form-textarea"
                  placeholder="Enter the answer"
                />
              </div>

              <div className="form-group">
                <label htmlFor="order">Order Number</label>
                <input
                  type="number"
                  id="order"
                  name="order"
                  value={formData.order}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="0"
                  min="0"
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  {editingFAQ ? 'Update FAQ' : 'Add FAQ'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="content-section">
        {faqs.length === 0 ? (
          <div className="empty-state">
            <p>No FAQs found. Add your first FAQ to get started.</p>
          </div>
        ) : (
          <div className="faqs-list">
            {faqs.map((faq) => (
              <div key={faq._id} className="faq-item">
                <div className="faq-content">
                  <div className="faq-header">
                    <h3 className="faq-question">{faq.question}</h3>
                    <span className="faq-order">Order: {faq.order}</span>
                  </div>
                  <p className="faq-answer">{faq.answer}</p>
                </div>
                <div className="faq-actions">
                  <button 
                    className="btn btn-icon btn-edit"
                    onClick={() => handleEdit(faq)}
                    title="Edit FAQ"
                  >
                    <FaEdit />
                  </button>
                  <button 
                    className="btn btn-icon btn-delete"
                    onClick={() => handleDelete(faq._id)}
                    title="Delete FAQ"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FAQ; 