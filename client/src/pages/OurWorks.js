import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import './OurWorks.css';
import { Helmet } from 'react-helmet';

const OurWorks = () => {
  const [ourWorks, setOurWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [imageIndices, setImageIndices] = useState({});
  
  const postsPerPage = 8;
  const totalPages = Math.ceil(ourWorks.length / postsPerPage);
  const paginatedWorks = ourWorks.slice((currentPage - 1) * postsPerPage, currentPage * postsPerPage);

  useEffect(() => {
    fetchOurWorks();
  }, []);

  const fetchOurWorks = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.get('/api/our-work');
      // Sort by order number
      const sortedWorks = response.data.sort((a, b) => a.order - b.order);
      setOurWorks(sortedWorks);
      
      // Initialize image indices for each work post
      const initialIndices = {};
      sortedWorks.forEach(work => {
        initialIndices[work._id] = 0;
      });
      setImageIndices(initialIndices);
    } catch (error) {
      console.error('Error fetching our works:', error);
      setError('Failed to load our works');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      // Scroll to top of page
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const nextImage = (workId) => {
    const work = ourWorks.find(w => w._id === workId);
    if (work && work.images && work.images.length > 1) {
      setImageIndices(prev => ({
        ...prev,
        [workId]: (prev[workId] + 1) % work.images.length
      }));
    }
  };

  const prevImage = (workId) => {
    const work = ourWorks.find(w => w._id === workId);
    if (work && work.images && work.images.length > 1) {
      setImageIndices(prev => ({
        ...prev,
        [workId]: prev[workId] === 0 ? work.images.length - 1 : prev[workId] - 1
      }));
    }
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
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="our-works-page">
      <Helmet>
        <title>Our Works | MyMerch</title>
        <meta name="description" content="Explore our portfolio of custom work and projects. See examples of our craftsmanship and creativity at MyMerch." />
        <meta property="og:title" content="Our Works | MyMerch" />
        <meta property="og:description" content="Explore our portfolio of custom work and projects. See examples of our craftsmanship and creativity at MyMerch." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.mymerch.gr/our-works" />
      </Helmet>
      
      <div className="container">
        <div className="page-header">
          <h1>Oι δουλειές μας</h1>
        </div>

        {ourWorks.length > 0 ? (
          <>
            <div className="works-grid">
              {paginatedWorks.map(work => (
                <div key={work._id} className="work-card">
                  <div className="work-image-container">
                    {work.images && work.images.length > 0 ? (
                      <>
                        <img 
                          src={work.images[imageIndices[work._id] || 0]} 
                          alt={work.title}
                          className="work-image"
                          loading="lazy"
                        />
                        {work.images.length > 1 && (
                          <>
                            <button 
                              className="image-nav-btn prev-btn"
                              onClick={() => prevImage(work._id)}
                              aria-label="Previous image"
                            >
                              <FaChevronLeft />
                            </button>
                            <button 
                              className="image-nav-btn next-btn"
                              onClick={() => nextImage(work._id)}
                              aria-label="Next image"
                            >
                              <FaChevronRight />
                            </button>
                            <div className="image-indicator">
                              {imageIndices[work._id] + 1} / {work.images.length}
                            </div>
                          </>
                        )}
                      </>
                    ) : (
                      <div className="no-image-placeholder">
                        <span>No Image</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="work-content">
                    <div className="work-meta">
                      <span className="work-category">{work.title}</span>
                      <span className="work-customer">{work.customerName}</span>
                    </div>
                    <p className="work-description">{work.description}</p>
                  </div>
                </div>
              ))}
            </div>
            
            {totalPages > 1 && (
              <div className="pagination">
                <button 
                  onClick={() => handlePageChange(currentPage - 1)} 
                  disabled={currentPage === 1}
                  className="pagination-btn"
                >
                  &laquo; Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    className={`pagination-btn ${currentPage === i + 1 ? 'active' : ''}`}
                    onClick={() => handlePageChange(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
                <button 
                  onClick={() => handlePageChange(currentPage + 1)} 
                  disabled={currentPage === totalPages}
                  className="pagination-btn"
                >
                  Next &raquo;
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="empty-state">
            <p>No work posts available at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OurWorks;
