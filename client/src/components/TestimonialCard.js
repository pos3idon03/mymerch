import React from 'react';
import './TestimonialCard.css';

const TestimonialCard = ({ testimonial }) => {
  return (
    <div className="testimonial-card">
      <div className="testimonial-content">
        <div className="testimonial-logo">
          {testimonial.companyLogo && (
            <img 
              src={testimonial.companyLogo} 
              alt="Company logo"
              onError={(e) => {
                e.target.src = '/images/placeholder-logo.svg';
              }}
              loading='lazy'
            />
          )}
        </div>
        
        <blockquote className="testimonial-text">
          {testimonial.testimonial}
        </blockquote>
      </div>
      
      <div className="testimonial-author">
        <h4 className="testimonial-name">{testimonial.customerName}</h4>
      </div>
    </div>
  );
};

export default TestimonialCard; 