import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';
import axios from 'axios';
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [logo, setLogo] = useState(null);
  const [favicon, setFavicon] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    fetchLogo();
    fetchFavicon();
  }, []);

  const fetchLogo = async () => {
    try {
      const response = await axios.get('/api/company/settings');
      if (response.data.logo) {
        setLogo({ image: response.data.logo, name: 'Logo' });
      }
    } catch (error) {
      console.error('Error fetching logo:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFavicon = async () => {
    try {
      const response = await axios.get('/api/company/settings');
      if (response.data.favicon) {
        setFavicon(response.data.favicon);
      }
    } catch (error) {
      // ignore favicon error
    }
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-brand">
          <Link to="/" className="navbar-logo">
            {logo ? (
              <img 
                src={logo.image} 
                alt={logo.name || 'MyMerch Logo'} 
                className="navbar-logo-image"
              />
            ) : (
              <span className="navbar-logo-text">MyMerch</span>
            )}
          </Link>
        </div>

        <div className={`navbar-menu ${isOpen ? 'active' : ''}`}>
          <Link 
            to="/" 
            className={`navbar-link ${isActive('/') ? 'active' : ''}`}
            onClick={closeMenu}
          >
            Home
          </Link>
          <Link 
            to="/products" 
            className={`navbar-link ${isActive('/products') ? 'active' : ''}`}
            onClick={closeMenu}
          >
            Products
          </Link>
          <Link 
            to="/about" 
            className={`navbar-link ${isActive('/about') ? 'active' : ''}`}
            onClick={closeMenu}
          >
            About
          </Link>
          <Link 
            to="/contact" 
            className={`navbar-link ${isActive('/contact') ? 'active' : ''}`}
            onClick={closeMenu}
          >
            Contact
          </Link>
        </div>

        <div className="navbar-actions">
          <button className="navbar-toggle" onClick={toggleMenu}>
            {isOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 