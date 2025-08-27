import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Admin.css';

const AdminContact = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const response = await axios.get('/api/contact', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      setContacts(response.data);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      setError('Failed to fetch contacts');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this contact message?')) return;
    
    try {
      await axios.delete(`/api/contact/${id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      fetchContacts();
    } catch (error) {
      console.error('Error deleting contact:', error);
      setError('Failed to delete contact message');
    }
  };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div className="admin-contact">
      <div className="page-header">
        <h1>Contact Messages</h1>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Company</th>
              <th>Phone</th>
              <th>Subject</th>
              <th>Message</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map(contact => (
              <tr key={contact._id}>
                <td>{contact.name}</td>
                <td>{contact.email}</td>
                <td>{contact.company || '-'}</td>
                <td>{contact.phone || '-'}</td>
                <td>{contact.subject || '-'}</td>
                <td>
                  <div className="message-preview">
                    {contact.message.length > 100 
                      ? `${contact.message.substring(0, 100)}...` 
                      : contact.message
                    }
                  </div>
                </td>
                <td>{new Date(contact.createdAt).toLocaleString()}</td>
                <td>
                  <button 
                    className="btn btn-sm btn-danger" 
                    onClick={() => handleDelete(contact._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {contacts.length === 0 && (
          <div className="empty-state">
            <p>No contact messages found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminContact;
