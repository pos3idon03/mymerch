import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaBox, FaNewspaper, FaImages, FaComments, FaPlus, FaEdit, FaEye, FaTags, FaCalendarAlt, FaBriefcase } from 'react-icons/fa';
import axios from 'axios';
import './Admin.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    products: 0,
    categories: 0,
    blogs: 0,
    banners: 0,
    testimonials: 0,
    events: 0,
    customOrders: 0,
    ourWork: 0,
    customers: 0
  });
  const [recentProducts, setRecentProducts] = useState([]);
  const [recentBlogs, setRecentBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      
      try {
        const [productsRes, categoriesRes, blogsRes, bannersRes, testimonialsRes, eventsRes, customOrdersRes, ourWorkRes, customersRes] = await Promise.all([
          axios.get('/api/products/all', { headers: { 'Authorization': `Bearer ${token}` } }),
          axios.get('/api/categories/all', { headers: { 'Authorization': `Bearer ${token}` } }),
          axios.get('/api/blog/admin', { headers: { 'Authorization': `Bearer ${token}` } }),
          axios.get('/api/banner/admin', { headers: { 'Authorization': `Bearer ${token}` } }),
          axios.get('/api/testimonials/admin', { headers: { 'Authorization': `Bearer ${token}` } }),
          axios.get('/api/events/all', { headers: { 'Authorization': `Bearer ${token}` } }),
          axios.get('/api/custom-order', { headers: { 'Authorization': `Bearer ${token}` } }),
          axios.get('/api/our-work/admin', { headers: { 'Authorization': `Bearer ${token}` } }),
          axios.get('/api/customers/admin', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        setStats({
          products: productsRes.data.length,
          categories: categoriesRes.data.length,
          blogs: blogsRes.data.length,
          banners: bannersRes.data.length,
          testimonials: testimonialsRes.data.length,
          events: eventsRes.data.length,
          customOrders: customOrdersRes.data.length,
          ourWork: ourWorkRes.data.length,
          customers: customersRes.data.length
        });

        setRecentProducts(productsRes.data.slice(0, 5));
        setRecentBlogs(blogsRes.data.slice(0, 5));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // If we get a 401 error, the token might be invalid
        if (error.response && error.response.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/admin/login';
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  // Check if user is authenticated
  const token = localStorage.getItem('token');
  if (!token) {
    return (
      <div className="admin-dashboard">
        <div className="dashboard-header">
          <h1>Access Denied</h1>
          <p>Please log in to access the admin panel</p>
        </div>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p>You need to be authenticated to view this page.</p>
          <button 
            onClick={() => window.location.href = '/admin/login'} 
            className="btn btn-primary"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Welcome to the admin panel</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <FaBox />
          </div>
          <div className="stat-content">
            <h3>{stats.products}</h3>
            <p>Products</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FaTags />
          </div>
          <div className="stat-content">
            <h3>{stats.categories}</h3>
            <p>Categories</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FaNewspaper />
          </div>
          <div className="stat-content">
            <h3>{stats.blogs}</h3>
            <p>Blog Posts</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FaImages />
          </div>
          <div className="stat-content">
            <h3>{stats.banners}</h3>
            <p>Banners</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FaComments />
          </div>
          <div className="stat-content">
            <h3>{stats.testimonials}</h3>
            <p>Testimonials</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FaCalendarAlt />
          </div>
          <div className="stat-content">
            <h3>{stats.events}</h3>
            <p>Events</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FaBox />
          </div>
          <div className="stat-content">
            <h3>{stats.customOrders}</h3>
            <p>Custom Orders</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FaBriefcase />
          </div>
          <div className="stat-content">
            <h3>{stats.ourWork}</h3>
            <p>Our Work</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FaBriefcase />
          </div>
          <div className="stat-content">
            <h3>{stats.customers}</h3>
            <p>Customers</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="actions-grid">
          <Link to="/admin/categories" className="action-card">
            <FaPlus />
            <span>Add Category</span>
          </Link>
          <Link to="/admin/products" className="action-card">
            <FaPlus />
            <span>Add Product</span>
          </Link>
          <Link to="/admin/blog" className="action-card">
            <FaPlus />
            <span>Add Blog Post</span>
          </Link>
          <Link to="/admin/banners" className="action-card">
            <FaPlus />
            <span>Add Banner</span>
          </Link>
          <Link to="/admin/testimonials" className="action-card">
            <FaPlus />
            <span>Add Testimonial</span>
          </Link>
          <Link to="/admin/events" className="action-card">
            <FaPlus />
            <span>Add Event</span>
          </Link>
          <Link to="/admin/custom-orders" className="action-card">
            <FaPlus />
            <span>Add Custom Order</span>
          </Link>
          <Link to="/admin/our-work" className="action-card">
            <FaPlus />
            <span>Add Work Post</span>
          </Link>
        </div>
      </div>

      {/* Recent Content */}
      <div className="recent-content">
        <div className="recent-section">
          <div className="section-header">
            <h2>Recent Products</h2>
            <Link to="/admin/products" className="view-all">View All</Link>
          </div>
          <div className="recent-list">
            {recentProducts.map(product => (
              <div key={product._id} className="recent-item">
                <div className="item-info">
                  <h4>{product.title}</h4>
                  <p>{product.category?.name || 'Uncategorized'}</p>
                </div>
                <div className="item-actions">
                  <Link to={`/admin/products/edit/${product._id}`} className="btn btn-sm">
                    <FaEdit />
                  </Link>
                  <Link to={`/products/${product._id}`} className="btn btn-sm">
                    <FaEye />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="recent-section">
          <div className="section-header">
            <h2>Recent Blog Posts</h2>
            <Link to="/admin/blog" className="view-all">View All</Link>
          </div>
          <div className="recent-list">
            {recentBlogs.map(blog => (
              <div key={blog._id} className="recent-item">
                <div className="item-info">
                  <h4>{blog.title}</h4>
                  <p>By {blog.author}</p>
                </div>
                <div className="item-actions">
                  <Link to={`/admin/blog/edit/${blog._id}`} className="btn btn-sm">
                    <FaEdit />
                  </Link>
                  <Link to={`/blog/${blog._id}`} className="btn btn-sm">
                    <FaEye />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 