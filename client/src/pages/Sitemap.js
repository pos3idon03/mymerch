import React from 'react';
import { Link } from 'react-router-dom';
import './Sitemap.css';

const Sitemap = () => {
  return (
    <div className="sitemap-page">
      <div className="container">
        <div className="page-header">
          <h1>Sitemap</h1>
          <p>Complete overview of our website structure</p>
        </div>

        <div className="sitemap-content">
          <div className="sitemap-section">
            <h2>Main Pages</h2>
            <ul className="sitemap-list">
              <li><Link to="/">Home</Link> - Welcome to MyMerch</li>
              <li><Link to="/products">Products</Link> - Browse all products</li>
              <li><Link to="/categories">Categories</Link> - Product categories</li>
              <li><Link to="/events">Events</Link> - Special events and offers</li>
              <li><Link to="/custom-order">Custom Order</Link> - Request a custom order</li>
              <li><Link to="/about">About Us</Link> - Learn about our company</li>
              <li><Link to="/contact">Contact</Link> - Get in touch with us</li>
              <li><Link to="/faq">FAQ</Link> - Frequently Asked Questions</li>
              <li><Link to="/testimonials">Testimonials</Link> - Customer reviews</li>
              <li><Link to="/banners">Banners</Link> - Promotional banners</li>
              <li><Link to="/blog">Blog</Link> - Latest news and insights</li>
              <li><Link to="/privacy">Privacy Policy</Link> - How we protect your data</li>
              <li><Link to="/terms">Terms of Service</Link> - Our terms and conditions</li>
              {/* <li><Link to="/company">Company Info</Link> - Company assets and information</li> */}
            </ul>
          </div>

          {/* <div className="sitemap-section">
            <h2>Admin Panel</h2>
            <ul className="sitemap-list">
              <li><Link to="/admin">Dashboard</Link> - Admin overview and stats</li>
              <li><Link to="/admin/products">Manage Products</Link> - Add, edit, or remove products</li>
              <li><Link to="/admin/categories">Manage Categories</Link> - Add, edit, or remove categories</li>
              <li><Link to="/admin/events">Manage Events</Link> - Add, edit, or remove events</li>
              <li><Link to="/admin/custom-orders">Custom Orders</Link> - View and manage custom orders</li>
              <li><Link to="/admin/banners">Manage Banners</Link> - Add, edit, or remove banners</li>
              <li><Link to="/admin/testimonials">Manage Testimonials</Link> - Add, edit, or remove testimonials</li>
              <li><Link to="/admin/blog">Manage Blog</Link> - Add, edit, or remove blog posts</li>
              <li><Link to="/admin/faq">Manage FAQ</Link> - Add, edit, or remove FAQs</li>
              <li><Link to="/admin/assets">Company Assets</Link> - Manage company logo, favicon, and info</li>
              <li><Link to="/admin/about">About Page</Link> - Edit about page content</li>
              <li><Link to="/admin/customers">Our Customers</Link> - Manage customer logos and information</li>
            </ul>
          </div> */}

          <div className="sitemap-section">
            <h2>Products</h2>
            <ul className="sitemap-list">
              <li><Link to="/products">All Products</Link> - Browse our complete product catalog</li>
              {/* <li><Link to="/products?category=electronics">Electronics</Link> - Electronic products and devices</li>
              <li><Link to="/products?category=office">Office Supplies</Link> - Office equipment and supplies</li>
              <li><Link to="/products?category=industrial">Industrial</Link> - Industrial equipment and tools</li>
              <li><Link to="/products?category=software">Software</Link> - Software solutions and licenses</li> */}
            </ul>
          </div>

          <div className="sitemap-section">
            <h2>Blog</h2>
            <ul className="sitemap-list">
              <li><Link to="/blog">Blog</Link> - Latest news and insights</li>
              {/* <li><Link to="/blog/category/business">Business Tips</Link> - Business advice and strategies</li>
              <li><Link to="/blog/category/technology">Technology</Link> - Tech trends and updates</li>
              <li><Link to="/blog/category/industry">Industry News</Link> - Industry insights and analysis</li> */}
            </ul>
          </div>

          <div className="sitemap-section">
            <h2>Legal Pages</h2>
            <ul className="sitemap-list">
              <li><Link to="/privacy">Privacy Policy</Link> - How we protect your data</li>
              <li><Link to="/terms">Terms of Service</Link> - Our terms and conditions</li>
            </ul>
          </div>

          <div className="sitemap-section">
            <h2>Support</h2>
            <ul className="sitemap-list">
              <li><Link to="/faq">FAQ</Link> - Frequently Asked Questions</li>
              <li><Link to="/contact">Contact Support</Link> - Get help from our team</li>
              {/* <li><Link to="/shipping">Shipping Information</Link> - Delivery and shipping details</li>
              <li><Link to="/returns">Returns & Refunds</Link> - Return policy and procedures</li> */}
            </ul>
          </div>

          <div className="sitemap-section">
            <h2>Company Information</h2>
            <ul className="sitemap-list">
              <li><Link to="/about">About MyMerch</Link> - Our story and mission</li>
              {/* <li><Link to="/about#team">Our Team</Link> - Meet our leadership team</li>
              <li><Link to="/about#careers">Careers</Link> - Job opportunities</li>
              <li><Link to="/about#press">Press Room</Link> - Media resources and news</li> */}
            </ul>
          </div>
        </div>

        <div className="sitemap-footer">
          <p>
            This sitemap provides a comprehensive overview of all pages on our website. 
            If you can't find what you're looking for, please <Link to="/contact">contact us</Link> for assistance.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Sitemap; 