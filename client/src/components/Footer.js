import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import axios from 'axios';
import './Footer.css';

const Footer = () => {
  const [settings, setSettings] = useState({});

  useEffect(() => {
    axios.get('/api/company/settings').then(res => setSettings(res.data));
  }, []);

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          {/* Company Info */}
          <div className="footer-section">
            <h3 className="footer-title">MyMerch</h3>
            <p className="footer-description">
              Your trusted partner for quality business solutions. We provide innovative products and exceptional service to help your business grow.
            </p>
            <div className="social-links">
              {settings.facebook && (
                <a href={settings.facebook} className="social-link" target="_blank" rel="noopener noreferrer">
                  <FaFacebook />
                </a>
              )}
              {settings.twitter && (
                <a href={settings.twitter} className="social-link" target="_blank" rel="noopener noreferrer">
                  <FaTwitter />
                </a>
              )}
              {settings.linkedin && (
                <a href={settings.linkedin} className="social-link" target="_blank" rel="noopener noreferrer">
                  <FaLinkedin />
                </a>
              )}
              {settings.instagram && (
                <a href={settings.instagram} className="social-link" target="_blank" rel="noopener noreferrer">
                  <FaInstagram />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h4 className="footer-heading">Quick Links</h4>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/products">Products</Link></li>
              <li><Link to="/blog">Blog</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div className="footer-section">
            <h4 className="footer-heading">Support</h4>
            <ul className="footer-links">
              <li><Link to="/faq">FAQ</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="footer-section">
            <h4 className="footer-heading">Contact Us</h4>
            <div className="contact-info">
              {settings.location && (
                <div className="contact-item">
                  <FaMapMarkerAlt />
                  <span>{settings.location}</span>
                </div>
              )}
              {settings.telephone && (
                <div className="contact-item">
                  <FaPhone />
                  <span>{settings.telephone}</span>
                </div>
              )}
              {settings.email && (
                <div className="contact-item">
                  <FaEnvelope />
                  <span>{settings.email}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p>&copy; 2025 MyMerch. All rights reserved.</p>
            <div className="footer-bottom-links">
              <Link to="/privacy">Privacy Policy</Link>
              <Link to="/terms">Terms of Service</Link>
              <Link to="/sitemap">Sitemap</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 