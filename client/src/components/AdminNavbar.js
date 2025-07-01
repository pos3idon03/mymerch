import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaSignOutAlt, FaHome, FaBox, FaTags, FaNewspaper, FaImages, FaComments, FaInfoCircle, FaQuestionCircle, FaImage } from 'react-icons/fa';
import './AdminNavbar.css';

const AdminNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/admin/login');
  };

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-brand">
        <Link to="/admin" className="admin-sidebar-logo">
          Admin Panel
        </Link>
      </div>
      <nav className="admin-sidebar-menu">
        <Link to="/admin" className={`admin-sidebar-link${isActive('/admin') ? ' active' : ''}`}><FaHome /><span>Home</span></Link>
        <Link to="/admin/categories" className={`admin-sidebar-link${isActive('/admin/categories') ? ' active' : ''}`}><FaTags /><span>Categories</span></Link>
        <Link to="/admin/products" className={`admin-sidebar-link${isActive('/admin/products') ? ' active' : ''}`}><FaBox /><span>Products</span></Link>
        <Link to="/admin/events" className={`admin-sidebar-link${isActive('/admin/events') ? ' active' : ''}`}><FaTags /><span>Events</span></Link>
        <Link to="/admin/blog" className={`admin-sidebar-link${isActive('/admin/blog') ? ' active' : ''}`}><FaNewspaper /><span>Blog Posts</span></Link>
        <Link to="/admin/banners" className={`admin-sidebar-link${isActive('/admin/banners') ? ' active' : ''}`}><FaImages /><span>Banners</span></Link>
        <Link to="/admin/testimonials" className={`admin-sidebar-link${isActive('/admin/testimonials') ? ' active' : ''}`}><FaComments /><span>Testimonials</span></Link>
        <Link to="/admin/about" className={`admin-sidebar-link${isActive('/admin/about') ? ' active' : ''}`}><FaInfoCircle /><span>About</span></Link>
        <Link to="/admin/faq" className={`admin-sidebar-link${isActive('/admin/faq') ? ' active' : ''}`}><FaQuestionCircle /><span>FAQ</span></Link>
        <Link to="/admin/assets" className={`admin-sidebar-link${isActive('/admin/assets') ? ' active' : ''}`}><FaImage /><span>Company</span></Link>
        <Link to="/admin/custom-orders" className={`admin-sidebar-link${isActive('/admin/custom-orders') ? ' active' : ''}`}><FaBox /><span>Custom Orders</span></Link>
      </nav>
      <div className="admin-sidebar-actions">
        <button className="admin-sidebar-logout" onClick={handleLogout}>
          <FaSignOutAlt />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminNavbar; 