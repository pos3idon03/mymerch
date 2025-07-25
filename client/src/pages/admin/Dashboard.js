import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaBox, FaNewspaper, FaImages, FaComments, FaPlus, FaEdit, FaEye, FaTags, FaCalendarAlt } from 'react-icons/fa';
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
    customOrders: 0
  });
  const [recentProducts, setRecentProducts] = useState([]);
  const [recentBlogs, setRecentBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [productsRes, categoriesRes, blogsRes, bannersRes, testimonialsRes, eventsRes, customOrdersRes] = await Promise.all([
          axios.get('/api/products'),
          axios.get('/api/categories'),
          axios.get('/api/blog'),
          axios.get('/api/banner'),
          axios.get('/api/testimonials'),
          axios.get('/api/events'),
          axios.get('/api/custom-order', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } })
        ]);

        setStats({
          products: productsRes.data.length,
          categories: categoriesRes.data.length,
          blogs: blogsRes.data.length,
          banners: bannersRes.data.length,
          testimonials: testimonialsRes.data.length,
          events: eventsRes.data.length,
          customOrders: customOrdersRes.data.length
        });

        setRecentProducts(productsRes.data.slice(0, 5));
        setRecentBlogs(blogsRes.data.slice(0, 5));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
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