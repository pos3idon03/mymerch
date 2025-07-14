import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import './FAQ.css';
import { Helmet } from 'react-helmet';

const FAQ = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openFAQ, setOpenFAQ] = useState(null);

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      const response = await axios.get('/api/faq');
      setFaqs(response.data);
    } catch (error) {
      setError('Failed to load FAQs');
      console.error('Error fetching FAQs:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFAQ = (faqId) => {
    setOpenFAQ(openFAQ === faqId ? null : faqId);
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="faq-page">
      <Helmet>
        <title>FAQ | MyMerch</title>
        <meta name="description" content="Find answers to frequently asked questions about MyMerch's products, orders, shipping, and more." />
        <meta property="og:title" content="FAQ | MyMerch" />
        <meta property="og:description" content="Find answers to frequently asked questions about MyMerch's products, orders, shipping, and more." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://yourdomain.com/faq" />
      </Helmet>
      <div className="container">
        <div className="page-header">
          <h1>Frequently Asked Questions</h1>
          <p>Find answers to common questions about our products and services</p>
        </div>

        {faqs.length === 0 ? (
          <div className="empty-state">
            <p>No FAQs available at the moment. Please check back later or contact us for assistance.</p>
          </div>
        ) : (
          <div className="faq-container">
            {faqs.map((faq) => (
              <div key={faq._id} className="faq-item">
                <button
                  className={`faq-question ${openFAQ === faq._id ? 'active' : ''}`}
                  onClick={() => toggleFAQ(faq._id)}
                >
                  <span>{faq.question}</span>
                  {openFAQ === faq._id ? <FaChevronUp /> : <FaChevronDown />}
                </button>
                <div className={`faq-answer ${openFAQ === faq._id ? 'active' : ''}`}>
                  <p>{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="faq-contact">
          <h3>Still have questions?</h3>
          <p>
            If you couldn't find the answer you're looking for, please don't hesitate to contact us. 
            Our team is here to help!
          </p>
          <a href="/contact" className="btn btn-primary">
            Contact Us
          </a>
        </div>
      </div>
    </div>
  );
};

export default FAQ; 