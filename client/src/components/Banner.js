import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import './Banner.css';

const Banner = ({ banners, imageFit = 'contain' }) => {
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


  // Determine image class based on fit preference
  const getImageClass = () => {
    switch (imageFit) {
      case 'cover':
        return 'banner-image banner-image-cover';
      case 'contain':
      default:
        return 'banner-image banner-image-contain';
    }
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

  // Add a test banner if no images are loading
  const hasValidImages = banners.some(banner => banner.image);
  if (!hasValidImages) {
    return (
      <section className="banner">
        <div className="banner-content">
          <div className="container">
            <div className="banner-text">
              <h1 className="banner-title">Test Banner - Images Not Loading</h1>
              <p className="banner-subtitle">
                This is a test banner. Check console for debugging info.
              </p>
              <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                Banner count: {banners.length}
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="banner">
      <div className="banner-slider">
        {banners.map((banner, index) => {
          return (
            <div
              key={banner._id}
              className={`banner-slide ${index === currentSlide ? 'active' : ''}`}
            >
              <picture className="banner-image-container">
                {/* Single image source since we maintain consistent aspect ratio */}
                <img 
                  src={banner.image}
                  alt={banner.title || 'Banner'}
                  className={getImageClass()}
                  loading='lazy'
                  onError={(e) => console.error('Image failed to load')}
                  onLoad={() => {}}
                />
              </picture>
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
          );
        })}

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