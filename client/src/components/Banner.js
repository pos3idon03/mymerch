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

  // Function to generate responsive image URLs
  const getResponsiveImageUrl = (originalUrl, width) => {
    // If you have an image optimization service like Cloudinary, Imgix, or similar, 
    // you can modify this function to generate optimized URLs
    // 
    // Examples:
    // Cloudinary: return originalUrl.replace('/upload/', `/upload/w_${width},c_scale/`);
    // Imgix: return originalUrl + `?w=${width}&auto=format,compress`;
    // Custom CDN: return originalUrl.replace(/\.(jpg|jpeg|png|webp)$/, `-${width}w.$1`);
    
    // For now, we'll use the original URL
    // You should implement one of the above solutions for better performance
    return originalUrl;
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

  return (
    <section className="banner">
      <div className="banner-slider">
        {banners.map((banner, index) => (
          <div
            key={banner._id}
            className={`banner-slide ${index === currentSlide ? 'active' : ''}`}
          >
            <picture className="banner-image-container">
              {/* Desktop image (larger size) */}
              <source
                media="(min-width: 768px)"
                srcSet={getResponsiveImageUrl(banner.image, 1200)}
              />
              {/* Tablet image (medium size) */}
              <source
                media="(min-width: 480px)"
                srcSet={getResponsiveImageUrl(banner.image, 800)}
              />
              {/* Mobile image (smaller size) */}
              <img 
                src={getResponsiveImageUrl(banner.image, 600)}
                alt={banner.title || 'Banner'}
                className={getImageClass()}
                loading='lazy'
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