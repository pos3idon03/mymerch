import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import './Banner.css';

const Banner = ({ banners }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (banners.length > 1) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % banners.length);
      }, 5000);

      return () => clearInterval(timer);
    }
  }, [banners.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  if (!banners || banners.length === 0) {
    return (
      <section className="banner">
        <div className="banner-content">
          <div className="container">
            <div className="banner-text">
              <h1 className="banner-title">Welcome to MyMerch</h1>
              <p className="banner-subtitle">
                Your trusted partner for quality business solutions
              </p>
              <Link to="/products" className="btn btn-primary">
                Explore Products
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="banner">
      <div className="banner-slider">
        {banners.map((banner, index) => (
          <div
            key={banner._id}
            className={`banner-slide ${index === currentSlide ? 'active' : ''}`}
          >
            <img 
              src={banner.image} 
              alt={banner.title || 'Banner'}
              className="banner-image"
              loading='lazy'
            />
            <div className="banner-content">
              <div className="container">
                <div className="banner-text">
                  <h1 className="banner-title">{banner.title}</h1>
                  {banner.subtitle && (
                    <p className="banner-subtitle">{banner.subtitle}</p>
                  )}
                  {banner.link && (
                    <Link to={banner.link} className="btn btn-primary">
                      Learn More
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {banners.length > 1 && (
          <>
            <button className="banner-nav banner-prev" onClick={prevSlide}>
              <FaChevronLeft />
            </button>
            <button className="banner-nav banner-next" onClick={nextSlide}>
              <FaChevronRight />
            </button>

            <div className="banner-dots">
              {banners.map((_, index) => (
                <button
                  key={index}
                  className={`banner-dot ${index === currentSlide ? 'active' : ''}`}
                  onClick={() => goToSlide(index)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default Banner; 