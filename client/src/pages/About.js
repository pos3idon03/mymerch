import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './About.css';
import Contact from './Contact';

const About = () => {
  const [aboutContent, setAboutContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    company: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    fetchAboutContent();
  }, []);

  const fetchAboutContent = async () => {
    try {
      const response = await axios.get('/api/about');
      setAboutContent(response.data);
    } catch (error) {
      console.error('Error fetching about content:', error);
      setError('Failed to load about content');
    } finally {
      setLoading(false);
    }
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      // Here you would typically send the contact form data to your backend
      // For now, we'll just simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSubmitSuccess(true);
      setContactForm({
        name: '',
        email: '',
        company: '',
        message: ''
      });
      
      // Reset success message after 5 seconds
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (error) {
      setError('Failed to send message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    setContactForm({
      ...contactForm,
      [e.target.name]: e.target.value
    });
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error && !aboutContent) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="about-page">
      {/* Banner Section */}
      {aboutContent?.bannerImage && (
        <section className="about-banner">
          <div className="banner-image">
            <img 
              src={aboutContent.bannerImage} 
              alt="About Us"
            />
          </div>
          <div className="banner-overlay">
            <div className="container">
              <h1>{aboutContent?.title || 'About Us'}</h1>
            </div>
          </div>
        </section>
      )}

      {/* Content Section */}
      <section className="about-content">
        <div className="container">
          {aboutContent ? (
            <div className="content-wrapper">
              <h2>{aboutContent.title}</h2>
              <div className="content-text">
                {aboutContent.content.split('\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </div>
          ) : (
            <div className="content-wrapper">
              <h2>About Us</h2>
              <div className="content-text">
                <p>
                  Welcome to MyMerch. We are dedicated to providing high-quality 
                  products and services to businesses worldwide. Our commitment to excellence 
                  and customer satisfaction drives everything we do.
                </p>
                <p>
                  With years of experience in the industry, we understand the unique needs 
                  of businesses and strive to deliver solutions that help you succeed. 
                  Our team of experts is always ready to assist you with your requirements.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="contact-section">
        <Contact />
      </section>
    </div>
  );
};

export default About; 