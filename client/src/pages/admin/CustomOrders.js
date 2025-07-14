import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Admin.css';

const statusOptions = ['Submitted', 'In Progress', 'Completed', 'Rejected'];

const AdminCustomOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [pendingStatus, setPendingStatus] = useState({});

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/custom-order', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      setOrders(res.data);
    } catch (err) {
      setError('Failed to fetch custom orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusSelect = (id, newStatus) => {
    setPendingStatus(prev => ({ ...prev, [id]: newStatus }));
  };

  const handleStatusUpdate = async (id) => {
    setUpdatingId(id);
    try {
      await axios.put(`/api/custom-order/${id}`, { orderStatus: pendingStatus[id] }, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      fetchOrders();
    } catch (err) {
      setError('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this custom order?')) return;
    try {
      await axios.delete(`/api/custom-order/${id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      fetchOrders();
    } catch (err) {
      setError('Failed to delete order');
    }
  };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div className="admin-custom-orders">
      <div className="page-header">
        <h1>Custom Orders</h1>
      </div>
      {error && <div className="error-message">{error}</div>}
      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Products</th>
              <th>Quantities</th>
              <th>Options</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Image</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order._id}>
                <td>{order._id}</td>
                <td>
                  {order.products.map(p => (
                    <div key={p._id} style={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
                      {p.favicon && <img src={p.favicon} alt="favicon" style={{ width: 20, height: 20, borderRadius: 4, border: '1px solid #eee', marginRight: 6 }} loading='lazy'/>}
                      {p.title}
                    </div>
                  ))}
                </td>
                <td>{order.quantities.join(', ')}</td>
                <td>{order.options && order.options.length ? order.options.join(', ') : '-'}</td>
                <td>{order.email}</td>
                <td>{order.phone}</td>
                <td>
                  {order.image && <a href={order.image} target="_blank" rel="noopener noreferrer">View</a>}
                </td>
                <td>
                  <select
                    value={pendingStatus[order._id] ?? order.orderStatus}
                    onChange={e => handleStatusSelect(order._id, e.target.value)}
                    disabled={updatingId === order._id}
                  >
                    {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                  <button
                    className="btn btn-sm btn-primary"
                    style={{ marginLeft: 8 }}
                    disabled={updatingId === order._id || (pendingStatus[order._id] ?? order.orderStatus) === order.orderStatus}
                    onClick={() => handleStatusUpdate(order._id)}
                  >
                    {updatingId === order._id ? 'Updating...' : 'Update'}
                  </button>
                </td>
                <td>{new Date(order.createdAt).toLocaleString()}</td>
                <td>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(order._id)} disabled={updatingId === order._id}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && <div className="empty-state"><p>No custom orders found.</p></div>}
      </div>
    </div>
  );
};

export default AdminCustomOrders; 