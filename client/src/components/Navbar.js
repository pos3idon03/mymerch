import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaChevronDown } from 'react-icons/fa';
import axios from 'axios';
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [logo, setLogo] = useState(null);
  const [favicon, setFavicon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [showCategoriesDropdown, setShowCategoriesDropdown] = useState(false);
  const location = useLocation();

  useEffect(() => {
    fetchLogo();
    fetchFavicon();
    fetchCategories();
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

  const fetchCategories = async () => {
    try {
      // First try to get categories with products
      const response = await axios.get('/api/categories/with-products');
      if (response.data && response.data.length > 0) {
        setCategories(response.data);
      } else {
        // If no categories with products, get all active categories
        const allCategoriesResponse = await axios.get('/api/categories');
        setCategories(allCategoriesResponse.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Fallback to getting all categories if the first request fails
      try {
        const fallbackResponse = await axios.get('/api/categories');
        setCategories(fallbackResponse.data);
      } catch (fallbackError) {
        console.error('Error fetching fallback categories:', fallbackError);
      }
    }
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
    setShowCategoriesDropdown(false);
  };

  const toggleCategoriesDropdown = () => {
    setShowCategoriesDropdown(!showCategoriesDropdown);
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
                loading='lazy'
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
          <div className={`navbar-dropdown ${showCategoriesDropdown ? 'show-dropdown' : ''}`}>
            <button 
              className={`navbar-link dropdown-toggle ${isActive('/products') ? 'active' : ''}`}
              onClick={toggleCategoriesDropdown}
            >
              Products <FaChevronDown className="dropdown-icon" />
            </button>
            {showCategoriesDropdown && (
              <div className="dropdown-menu">
                <Link 
                  to="/products" 
                  className="dropdown-item"
                  onClick={closeMenu}
                >
                  All Products
                </Link>
                {categories.map(category => (
                  <Link 
                    key={category._id}
                    to={`/products/category/${category._id}`}
                    className="dropdown-item"
                    onClick={closeMenu}
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
          {/* Test Your Idea Link - HIDDEN FOR NOW */}
          {/* 
          <Link 
            to="/test-your-idea" 
            className={`navbar-link ${isActive('/test-your-idea') ? 'active' : ''}`}
            onClick={closeMenu}
          >
            Test Your Idea
          </Link>
          */}
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
          <button className={`navbar-toggle ${isOpen ? 'active' : ''}`} onClick={toggleMenu}>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 