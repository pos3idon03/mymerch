import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './SliderBanner.css';

const SliderBanner = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await axios.get('/api/customers');
        setCustomers(response.data);
      } catch (error) {
        console.error('Error fetching customers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  if (loading) {
    return (
      <div className="slider-banner-loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (customers.length === 0) {
    return null; // Don't show anything if no customers
  }

  // Duplicate customers to create seamless loop
  const duplicatedCustomers = [...customers, ...customers];

  return (
    <section className="slider-banner-section">
      <div className="slider-container">
        <div className="slider-track">
          {duplicatedCustomers.map((customer, index) => (
            <div key={`${customer._id}-${index}`} className="customer-logo">
              <img
                src={customer.image}
                alt={customer.name}
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SliderBanner;
