import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Banner from '../components/Banner';
import ProductCard from '../components/ProductCard';
import TestimonialCard from '../components/TestimonialCard';
import BlogCard from '../components/BlogCard';
import { FaBox, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import './Home.css';

const Home = () => {
  const [banners, setBanners] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [recentBlogs, setRecentBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [events, setEvents] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [openCategory, setOpenCategory] = useState(null);
  const [openEvent, setOpenEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [customOrderProducts, setCustomOrderProducts] = useState([]);
  const [customOrderQuantities, setCustomOrderQuantities] = useState([]);
  const [customOrderImage, setCustomOrderImage] = useState(null);
  const [customOrderImagePreview, setCustomOrderImagePreview] = useState('');
  const [customOrderOptions, setCustomOrderOptions] = useState([]);
  const [customOrderEmail, setCustomOrderEmail] = useState('');
  const [customOrderSubmitting, setCustomOrderSubmitting] = useState(false);
  const [customOrderMessage, setCustomOrderMessage] = useState('');
  const [customOrderPhone, setCustomOrderPhone] = useState('');
  const customOrderImageInput = useRef();
  const customOrderOptionList = [
    'Κέντρο',
    'Στήθος',
    'Πλάτη',
    'Αλλού'
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bannersRes, productsRes, testimonialsRes, blogsRes, categoriesRes, eventsRes, allProductsRes] = await Promise.all([
          axios.get('/api/banner'),
          axios.get('/api/products/featured'),
          axios.get('/api/testimonials'),
          axios.get('/api/blog/recent'),
          axios.get('/api/categories'),
          axios.get('/api/events'),
          axios.get('/api/products')
        ]);

        setBanners(bannersRes.data);
        setFeaturedProducts(productsRes.data);
        setTestimonials(testimonialsRes.data);
        setRecentBlogs(blogsRes.data);
        setCategories(categoriesRes.data);
        setEvents(eventsRes.data);
        setAllProducts(allProductsRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCustomOrderProductChange = (e) => {
    const value = e.target.value;
    setCustomOrderProducts(prev =>
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    );
  };

  const handleCustomOrderQuantityChange = (idx, val) => {
    setCustomOrderQuantities(prev => {
      const arr = [...prev];
      arr[idx] = val;
      return arr;
    });
  };

  const handleCustomOrderImageChange = (e) => {
    const file = e.target.files[0];
    setCustomOrderImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setCustomOrderImagePreview(ev.target.result);
      reader.readAsDataURL(file);
    } else {
      setCustomOrderImagePreview('');
    }
  };

  const handleCustomOrderOptionChange = (e) => {
    const value = e.target.value;
    setCustomOrderOptions(prev =>
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    );
  };

  const handleCustomOrderSubmit = async (e) => {
    e.preventDefault();
    setCustomOrderSubmitting(true);
    setCustomOrderMessage('');
    try {
      const formData = new FormData();
      formData.append('products', JSON.stringify(customOrderProducts));
      formData.append('quantities', JSON.stringify(customOrderQuantities));
      if (customOrderImage) formData.append('image', customOrderImage);
      formData.append('options', JSON.stringify(customOrderOptions));
      formData.append('email', customOrderEmail);
      formData.append('phone', customOrderPhone);
      await axios.post('/api/custom-order', formData);
      setCustomOrderMessage('Η ομάδα του MyMerch θα επικοινωνήσει μαζί το συντομότερο δυνατό για την επιβεβαίωση της παραγγελίας σας! Ευχαριστούμε!');
      setCustomOrderProducts([]);
      setCustomOrderQuantities([]);
      setCustomOrderImage(null);
      setCustomOrderImagePreview('');
      setCustomOrderOptions([]);
      setCustomOrderEmail('');
      setCustomOrderPhone('');
      if (customOrderImageInput.current) customOrderImageInput.current.value = '';
    } catch (err) {
      setCustomOrderMessage('There was an error submitting your order.');
    } finally {
      setCustomOrderSubmitting(false);
    }
  };

  // Only show banners with placement 'homepage' in the main banner slider
  const homepageBanners = banners.filter(b => b.placement === 'homepage' && b.active);

  // Only show active banners with placement 'custom-order' for the custom order section
  const customOrderBanner = banners.find(b => b.placement === 'custom-order' && b.active);

  // Only show active banners with placement 'categories' for the categories section
  const categoriesBanner = banners.find(b => b.placement === 'categories' && b.active);

  const offerBanner = banners.find(b => b.placement === 'offer-banner' && b.active);
  
  const customersBanner = banners.filter(b => b.placement === 'customers-banner' && b.active);

  // Find the event banner from banners
  const eventBanner = banners.find(b => b.placement === 'event-banner' && b.active);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="home">
      {/* Banner Section */}
      <Banner banners={homepageBanners} />

      
      {/* Featured Products Section */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">Ψάχνεις διαφημιστικά προϊόντα; Είμαστε ο συνεργάτης που εμπιστεύεσαι για να βάλεις το logo σου σε ό,τι μπορεί να φορεθεί, να κρατηθεί ή να... γίνει δώρο! 🎁</h2>
          <div className="offer-content">
            <div className="offer-text">
              {/* <p className="section-subtitle">
                Discover our most popular and high-quality products
              </p> */}
              
              {/* Categories as dropdown list */}
              <div className="categories-section">
                <h3 className="products-3-title">Κατηγορίες</h3>
                <ul className="products-3-list category-dropdown-list">
                  {categories.length > 0 ? (
                    categories.map(category => {
                      const productsInCategory = allProducts.filter(product =>
                        product.categories && product.categories.some(c => c._id === category._id)
                      );
                      const isOpen = openCategory === category._id;
                      return (
                        <li key={category._id} className="category-dropdown-item">
                          <button
                            className="category-dropdown-toggle"
                            onClick={() => setOpenCategory(isOpen ? null : category._id)}
                            aria-expanded={isOpen}
                          >
                            {/* Favicon */}
                            {category.favicon && (
                              <img src={category.favicon} alt="favicon" style={{ width: 24, height: 24, borderRadius: 4, border: '1px solid #eee', marginRight: 8, verticalAlign: 'middle' }} />
                            )}
                            <span>{category.name}</span>
                            <span className="dropdown-arrow">{isOpen ? <FaChevronUp /> : <FaChevronDown />}</span>
                          </button>
                          {isOpen && productsInCategory.length > 0 && (
                            <ul className="category-dropdown-menu prettier-product-list">
                              {productsInCategory.map(product => (
                                <li key={product._id} className="prettier-product-item">
                                  {/* Product favicon or default icon */}
                                  {product.favicon ? (
                                    <img src={product.favicon} alt="favicon" style={{ width: 20, height: 20, borderRadius: 4, border: '1px solid #eee', marginRight: 6, verticalAlign: 'middle' }} />
                                  ) : (
                                    <FaBox className="product-list-icon" />
                                  )}
                                  <span>{product.title}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                          {isOpen && productsInCategory.length === 0 && (
                            <ul className="category-dropdown-menu prettier-product-list"><li className="prettier-product-item">No products</li></ul>
                          )}
                        </li>
                      );
                    })
                  ) : (
                    <li>No categories</li>
                  )}
                </ul>
              </div>
            </div>
            <div className="offer-image">
              {categoriesBanner && categoriesBanner.image ? (
                <img
                  src={categoriesBanner.image}
                  alt={categoriesBanner.title || 'Categories'}
                  style={{ maxWidth: '100%', borderRadius: '12px', minHeight: '200px', objectFit: 'cover' }}
                />
              ) : (
                <div className="offer-placeholder">
                  <h3>Categories</h3>
                  <p>Browse our product categories</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Events Section (now a single banner image) */}
      <section className="section bg-gray-50">
        <div className="container">
          <h2 className="section-title">Events</h2>
          {eventBanner && eventBanner.image ? (
            <div className="event-banner-image-wrapper" style={{ textAlign: 'center', margin: '2rem 0' }}>
              <img
                src={eventBanner.image}
                alt={eventBanner.title || 'Event Banner'}
                style={{
                  maxWidth: '100%',
                  borderRadius: '12px',
                  minHeight: '200px',
                  objectFit: 'cover',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                }}
              />
            </div>
          ) : (
            <div className="event-image-placeholder" style={{ textAlign: 'center', margin: '2rem 0' }}>
              <div style={{
                width: '100%',
                minHeight: '200px',
                background: '#f8f9fa',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{ color: '#bbb', fontSize: '2rem' }}>No event banner set</span>
              </div>
            </div>
          )}
          <div className="text-center mt-4">
            <Link to="/contact" className="btn btn-primary">
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* Custom Order Section */}
      <section className="section">
        <div className="container">
          <div className="offer-content custom-order-offer-content">
            <div className="offer-image custom-order-offer-image">
              {customOrderBanner && customOrderBanner.image ? (
                <img
                  src={customOrderBanner.image}
                  alt={customOrderBanner.title}
                  style={{ maxWidth: '100%', borderRadius: '12px', minHeight: '200px', objectFit: 'cover' }}
                />
              ) : (
                <div className="offer-placeholder">
                  <h3>Custom Order</h3>
                  <p>Upload your own design or request a quote</p>
                </div>
              )}
            </div>
            <div className="offer-text custom-order-offer-text">
              <h2 className="section-title text-left">Φτιάξτο όπως θες!</h2>
              <p className="offer-description">
                Στείλε την εικόνα που θες να εκτυπώσεις και θα την κάνουμε πραγματικότητα!
              </p>
              <form className="admin-form" onSubmit={handleCustomOrderSubmit}>
                <div className="form-group">
                  <label>Select Product(s)</label>
                  <div className="custom-order-products-list">
                    {allProducts.map((product, idx) => {
                      const checked = customOrderProducts.includes(product._id);
                      return (
                        <label key={product._id} className="checkbox-label" style={{ width: '100%' }}>
                          <input
                            type="checkbox"
                            value={product._id}
                            checked={checked}
                            onChange={handleCustomOrderProductChange}
                          />
                          <span className="checkmark"></span>
                          <span className="product-title-in-list">{product.title}</span>
                          {checked && (
                            <input
                              type="number"
                              min="1"
                              placeholder="Qty"
                              className="form-input custom-order-qty-input"
                              value={customOrderQuantities[customOrderProducts.indexOf(product._id)] || ''}
                              onChange={e => handleCustomOrderQuantityChange(customOrderProducts.indexOf(product._id), e.target.value)}
                              required
                            />
                          )}
                        </label>
                      );
                    })}
                  </div>
                </div>
                <div className="form-group">
                  <label>Select Option(s)</label>
                  <div className="custom-order-options-list">
                    {customOrderOptionList.map(option => (
                      <label key={option} className="checkbox-label">
                        <input
                          type="checkbox"
                          value={option}
                          checked={customOrderOptions.includes(option)}
                          onChange={handleCustomOrderOptionChange}
                        />
                        <span className="checkmark"></span>
                        {option}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label>Upload Image</label>
                  <label className="prettier-file-upload">
                    Choose Image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCustomOrderImageChange}
                      ref={customOrderImageInput}
                    />
                  </label>
                  {customOrderImagePreview && (
                    <div className="custom-order-image-preview">
                      <img src={customOrderImagePreview} alt="Preview" />
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    className="form-input"
                    value={customOrderEmail}
                    onChange={e => setCustomOrderEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={customOrderPhone}
                    onChange={e => setCustomOrderPhone(e.target.value)}
                    required
                    pattern="[0-9\-\+\s()]{6,}"
                    placeholder="69XXXXXXXX"
                  />
                </div>
                <button className="prettier-submit-btn" type="submit" disabled={customOrderSubmitting}>
                  {customOrderSubmitting ? 'Submitting...' : 'Submit Order'}
                </button>
                {customOrderMessage && (
                  <div className="custom-order-message">{customOrderMessage}</div>
                )}
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Offer Section */}
      <section className="section bg-gray-50">
        <div className="container">
          <div className="offer-content">
            <div className="offer-text">
              <h2 className="section-title text-left">Special Business Offers</h2>
              <p className="offer-description">
                Get exclusive pricing and bulk discounts for your business. 
                We offer competitive rates for large orders and long-term partnerships.
              </p>
              <ul className="offer-features">
                <li>Bulk pricing discounts</li>
                <li>Fast shipping & delivery</li>
                <li>24/7 customer support</li>
                <li>Flexible payment terms</li>
              </ul>
              <Link to="/contact" className="btn btn-primary">
                Get Quote
              </Link>
            </div>
            <div className="offer-image">
              {offerBanner && offerBanner.image ? (
                <img
                  src={offerBanner.image}
                  alt={offerBanner.title || 'Offer Banner'}
                  style={{ maxWidth: '100%', borderRadius: '12px', minHeight: '200px', objectFit: 'cover' }}
                />
              ) : (
                <div className="offer-placeholder">
                  <h3>Business Solutions</h3>
                  <p>Contact us for a custom offer for your business needs</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    
      {/* Testimonials Section */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">Οι πελάτες μας λένε</h2>
          <p className="section-subtitle">
            Trusted by businesses worldwide
          </p>
          
          {testimonials.length > 0 ? (
            <div className="testimonials-grid">
              {testimonials.slice(0, 6).map(testimonial => (
                <TestimonialCard key={testimonial._id} testimonial={testimonial} />
              ))}
            </div>
          ) : (
            <div className="text-center">
              <p>No testimonials available</p>
            </div>
          )}
        </div>
      </section>

      {/* Customers Banner Section */}
      {customersBanner.length > 0 && (
        <section className="section customers-banner-section">
          <Banner banners={customersBanner} />
        </section>
      )}

      {/* Blog Section */}
      <section className="section bg-gray-50">
        <div className="container">
          <h2 className="section-title">Το Blog μας</h2>
          <p className="section-subtitle">
            Stay updated with industry insights and company news
          </p>
          
          {recentBlogs.length > 0 ? (
            <div className="grid grid-3">
              {recentBlogs.map(blog => (
                <BlogCard key={blog._id} blog={blog} />
              ))}
            </div>
          ) : (
            <div className="text-center">
              <p>No blog posts available</p>
            </div>
          )}
          
          <div className="text-center mt-4">
            <Link to="/blog" className="btn btn-outline">
              Read More
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home; 