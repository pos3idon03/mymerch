import React, { useState, useEffect } from 'react';
import './Contact.css';
import { FaPaperPlane, FaFacebook, FaTwitter, FaLinkedin, FaInstagram, FaEnvelope, FaPhone, FaMapMarkerAlt, FaClock } from 'react-icons/fa';

const Contact = () => {
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [companyInfo, setCompanyInfo] = useState({
    email: '',
    telephone: '',
    location: '',
    facebook: '',
    instagram: '',
    twitter: '',
    linkedin: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompanyInfo();
  }, []);

  const fetchCompanyInfo = async () => {
    try {
      const res = await fetch('/api/company/settings');
      if (res.ok) {
        const data = await res.json();
        setCompanyInfo({
          email: data.email || '',
          telephone: data.telephone || '',
          location: data.location || '',
          facebook: data.facebook || '',
          instagram: data.instagram || '',
          twitter: data.twitter || '',
          linkedin: data.linkedin || ''
        });
      }
    } catch (e) {
      console.error('Failed to fetch company info:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setContactForm({
      ...contactForm,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    if (!contactForm.name.trim()) {
      setError('Name is required');
      return false;
    }
    if (!contactForm.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!contactForm.message.trim()) {
      setError('Message is required');
      return false;
    }
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactForm.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactForm)
      });
      
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      
      setSubmitSuccess(true);
      setContactForm({
        name: '',
        email: '',
        company: '',
        phone: '',
        subject: '',
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

  return (
    <div className="contact-page">
      <div className="container">
        <div className="page-header">
          <h1>Επικοινωνήστε μαζί μας</h1>
          <p>Θα χαρούμε πολύ να ακούσουμε την ιδέα σας! 
            Στείλτε μας το μήνυμά σας και θα σας απαντήσουμε το συντομότερο δυνατό.</p>
        </div>
        
        <div className="contact-wrapper">
          <div className="contact-form-container">
            <h3>Στείλτε μας Μήνυμα</h3>
            
            {submitSuccess && (
              <div className="success-message">
                Ευχαριστούμε για το μήνυμά σας! Θα επικοινωνήσουμε μαζί σας το συντομότερο δυνατό!
              </div>
            )}
            
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Όνομα *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={contactForm.name}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                    placeholder="Όνομα και Επίθετο"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={contactForm.email}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                    placeholder="your.email@company.com"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="company">Όνομα Εταιρείας</label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={contactForm.company}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Όνομα Εταιρείας"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Τηλέφωνο</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={contactForm.phone}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Τηλέφωνο"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="subject">Θέμα</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={contactForm.subject}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Τι αφορά;"
                />
              </div>

              <div className="form-group">
                <label htmlFor="message">Μήνυμα *</label>
                <textarea
                  id="message"
                  name="message"
                  value={contactForm.message}
                  onChange={handleInputChange}
                  required
                  rows="6"
                  className="form-textarea"
                  placeholder="Πείτε μας λεπτομέρειες..."
                ></textarea>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={submitting}
              >
                <FaPaperPlane style={{ marginRight: 8, fontSize: '16px' }} />
                {submitting ? 'Sending...' : 'Στείλτε Μήνυμα'}
              </button>
            </form>
          </div>

          <div className="contact-info">
            <h2>Επικοινωνήστε μαζί μας</h2>
            <p>
            Θα χαρούμε πολύ να ακούσουμε την ιδέα σας! 
            Στείλτε μας το μήνυμά σας και θα σας απαντήσουμε το συντομότερο δυνατό.
            </p>
            <div className="contact-details">
              {companyInfo.email && (
                <div className="contact-item">
                  <div className="contact-icon">
                    <FaEnvelope />
                  </div>
                  <div className="contact-content">
                    <h4>Email</h4>
                    <p>{companyInfo.email}</p>
                  </div>
                </div>
              )}
              {companyInfo.telephone && (
                <div className="contact-item">
                  <div className="contact-icon">
                    <FaPhone />
                  </div>
                  <div className="contact-content">
                    <h4>Τηλέφωνο</h4>
                    <p>{companyInfo.telephone}</p>
                  </div>
                </div>
              )}
              {companyInfo.location && (
                <div className="contact-item">
                  <div className="contact-icon">
                    <FaMapMarkerAlt />
                  </div>
                  <div className="contact-content">
                    <h4>Διεύθυνση</h4>
                    <p>{companyInfo.location.split(',').map((part, index) => (
                      <span key={index}>
                        {part.trim()}
                        {index < companyInfo.location.split(',').length - 1 && <br />}
                      </span>
                    ))}</p>
                  </div>
                </div>
              )}
              <div className="contact-item">
                <div className="contact-icon">
                  <FaClock />
                </div>
                <div className="contact-content">
                  <h4>Ωρες Λειτουργίας</h4>
                  <p>Monday - Friday: 9:00 AM - 6:00 PM<br />Saturday: 10:00 AM - 4:00 PM<br />Sunday: Closed</p>
                </div>
              </div>
              {(companyInfo.facebook || companyInfo.instagram || companyInfo.twitter || companyInfo.linkedin) && (
                <div className="contact-item social-media-item">
                  <div className="contact-content">
                    <h4>Follow Us</h4>
                    <div className="social-links">
                    {companyInfo.facebook && (
                      <a href={companyInfo.facebook} target="_blank" rel="noopener noreferrer" className="social-link">
                        <FaFacebook />
                      </a>
                    )}
                    {companyInfo.instagram && (
                      <a href={companyInfo.instagram} target="_blank" rel="noopener noreferrer" className="social-link">
                        <FaInstagram />
                      </a>
                    )}
                    {companyInfo.twitter && (
                      <a href={companyInfo.twitter} target="_blank" rel="noopener noreferrer" className="social-link">
                        <FaTwitter />
                      </a>
                    )}
                    {companyInfo.linkedin && (
                      <a href={companyInfo.linkedin} target="_blank" rel="noopener noreferrer" className="social-link">
                        <FaLinkedin />
                      </a>
                    )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact; 