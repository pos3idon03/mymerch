import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Banner from '../components/Banner';
import ProductCard from '../components/ProductCard';
import TestimonialCard from '../components/TestimonialCard';
import BlogCard from '../components/BlogCard';
import { FaBox } from 'react-icons/fa';
import { Helmet } from 'react-helmet';
import './Home.css';

const Home = () => {
  const [banners, setBanners] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [recentBlogs, setRecentBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [events, setEvents] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
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
  
  // Contact form state
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);
  const [contactError, setContactError] = useState('');
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

  const handleContactInputChange = (e) => {
    setContactForm({
      ...contactForm,
      [e.target.name]: e.target.value
    });
  };

  const validateContactForm = () => {
    if (!contactForm.name.trim()) {
      setContactError('Name is required');
      return false;
    }
    if (!contactForm.email.trim()) {
      setContactError('Email is required');
      return false;
    }
    if (!contactForm.message.trim()) {
      setContactError('Message is required');
      return false;
    }
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactForm.email)) {
      setContactError('Please enter a valid email address');
      return false;
    }
    return true;
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactError('');
    
    if (!validateContactForm()) {
      return;
    }
    
    setContactSubmitting(true);
    
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
      
      setContactSuccess(true);
      setContactForm({
        name: '',
        email: '',
        company: '',
        phone: '',
        subject: '',
        message: ''
      });
      
      // Reset success message after 5 seconds
      setTimeout(() => setContactSuccess(false), 5000);
    } catch (error) {
      setContactError('Failed to send message. Please try again.');
    } finally {
      setContactSubmitting(false);
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
      <Helmet>
        <title>Home | MyMerch</title>
        <meta name="description" content="Discover custom merchandise, apparel, and more at MyMerch. Quality products, fast shipping, and great prices." />
        <meta property="og:title" content="Home | MyMerch" />
        <meta property="og:description" content="Discover custom merchandise, apparel, and more at MyMerch. Quality products, fast shipping, and great prices." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.mymerch.gr/" />
      </Helmet>
      {/* Banner Section */}
      <Banner banners={homepageBanners} imageFit="cover" />

      
      {/* Featured Products Section */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">Ψάχνεις διαφημιστικά προϊόντα; Είμαστε ο συνεργάτης που εμπιστεύεσαι για να βάλεις το logo σου σε ό,τι μπορεί να φορεθεί, να κρατηθεί ή να... γίνει δώρο! 🎁</h2>
          <div className="offer-content">
            <div className="offer-text">
              {/* <p className="section-subtitle">
                Discover our most popular and high-quality products
              </p> */}
              
              {/* Categories as links */}
              <div className="categories-section">
                <h3 className="products-3-title">Κατηγορίες</h3>
                <ul className="products-3-list category-links-list">
                  {categories.length > 0 ? (
                    categories.map(category => (
                      <li key={category._id} className="category-link-item">
                        <Link 
                          to={`/products/category/${category._id}`} 
                          className="category-link"
                          style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}
                        >
                          {/* Favicon */}
                          {category.favicon && (
                            <img src={category.favicon} alt="favicon" style={{ width: 24, height: 24, borderRadius: 4, border: '1px solid #eee', marginRight: 8, verticalAlign: 'middle' }} loading='lazy'/>
                          )}
                          <span>{category.name}</span>
                        </Link>
                      </li>
                    ))
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
                  loading='lazy'
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
          <h2 className="section-title">Κάνε κάθε Event μοναδικό!</h2>
          <p className="section-subtitle">Χριστούγεννα, Απόκριες, καλοκαίρι, εγκαίνια, γενέθλια, Black Friday  ή απλώς μια καλή Τρίτη ☕ — κάθε στιγμή είναι ιδανική για να τραβήξεις βλέμματα (και πελάτες)!</p>
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
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  loading: 'lazy'
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
              Ας μιλήσουμε!
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
                  loading='lazy'
                />
              ) : (
                <div className="offer-placeholder">
                  <h3>Custom Order</h3>
                  <p>Upload your own design or request a quote</p>
                </div>
              )}
            </div>
            <div className="offer-text custom-order-offer-text">
              <p className="offer-description">
                Στείλε την εικόνα που θες να εκτυπώσεις και θα την κάνουμε πραγματικότητα!
              </p>
              <form className="admin-form" onSubmit={handleCustomOrderSubmit}>
                <div className="form-group">
                  <label>Διάλεξε Προϊόντα</label>
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
                  <label>Διάλεξε μέρος εκτύπωσης</label>
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
                  <label>Ανέβασε το σχέδιο σου</label>
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
                      <img src={customOrderImagePreview} alt="Preview" loading='lazy'/>
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
                  <label>Τηλέφωνο</label>
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
                  {customOrderSubmitting ? 'Submitting...' : 'Στείλε την παραγγελία'}
                </button>
                {customOrderMessage && (
                  <div className="custom-order-message">{customOrderMessage}</div>
                )}
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Test Your Idea Section - HIDDEN FOR NOW */}
      {/* 
      <section className="section bg-gradient">
        <div className="container">
          <div className="test-idea-content">
            <div className="test-idea-text">
              <h2 className="section-title text-left text-white">Test Your Idea</h2>
              <p className="test-idea-description">
                Want to see how your design looks on our products? Upload your image and test it on t-shirts, 
                tote bags, caps, and lanyards. Customize the size and position to create your perfect design.
              </p>
              <div className="test-idea-features">
                <div className="feature-item">
                  <span className="feature-icon">🎨</span>
                  <span>Drag & Drop Design</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">📱</span>
                  <span>Real-time Preview</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">⚡</span>
                  <span>Instant Results</span>
                </div>
              </div>
              <Link to="/test-your-idea" className="btn btn-white">
                Start Designing
              </Link>
            </div>
            <div className="test-idea-image">
              <div className="design-preview">
                <div className="product-mockup">
                  <div className="design-area">
                    <span>Your Design Here</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      */}

      {/* Customer Offer Section */}
      <section className="section bg-gray-50">
        <div className="container">
          <div className="offer-content">
            <div className="offer-image">
              {offerBanner && offerBanner.image ? (
                <img
                  src={offerBanner.image}
                  alt={offerBanner.title || 'Offer Banner'}
                  style={{ maxWidth: '100%', borderRadius: '12px', minHeight: '200px', objectFit: 'cover' }}
                  loading='lazy'
                />
              ) : (
                <div className="offer-placeholder">
                  <h3>Business Solutions</h3>
                  <p>Contact us for a custom offer for your business needs</p>
                </div>
              )}
            </div>
            <div className="contact-form-container">
              <h2 className="section-title text-left">Στείλτε μας Μήνυμα</h2>
              
              {contactSuccess && (
                <div className="success-message">
                  Ευχαριστούμε για το μήνυμά σας! Θα επικοινωνήσουμε μαζί σας το συντομότερο δυνατό!
                </div>
              )}
              
              {contactError && (
                <div className="error-message">
                  {contactError}
                </div>
              )}
              
              <form className="contact-form" onSubmit={handleContactSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="home-name">Όνομα *</label>
                    <input
                      type="text"
                      id="home-name"
                      name="name"
                      value={contactForm.name}
                      onChange={handleContactInputChange}
                      required
                      className="form-input"
                      placeholder="Όνομα και Επίθετο"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="home-email">Email *</label>
                    <input
                      type="email"
                      id="home-email"
                      name="email"
                      value={contactForm.email}
                      onChange={handleContactInputChange}
                      required
                      className="form-input"
                      placeholder="your.email@company.com"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="home-company">Όνομα Εταιρείας</label>
                    <input
                      type="text"
                      id="home-company"
                      name="company"
                      value={contactForm.company}
                      onChange={handleContactInputChange}
                      className="form-input"
                      placeholder="Όνομα Εταιρείας"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="home-phone">Τηλέφωνο</label>
                    <input
                      type="tel"
                      id="home-phone"
                      name="phone"
                      value={contactForm.phone}
                      onChange={handleContactInputChange}
                      className="form-input"
                      placeholder="Τηλέφωνο"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="home-subject">Θέμα</label>
                  <input
                    type="text"
                    id="home-subject"
                    name="subject"
                    value={contactForm.subject}
                    onChange={handleContactInputChange}
                    className="form-input"
                    placeholder="Τι αφορά;"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="home-message">Μήνυμα *</label>
                  <textarea
                    id="home-message"
                    name="message"
                    value={contactForm.message}
                    onChange={handleContactInputChange}
                    required
                    rows="4"
                    className="form-textarea"
                    placeholder="Πείτε μας λεπτομέρειες..."
                  ></textarea>
                </div>

                <button type="submit" className="btn btn-primary" disabled={contactSubmitting}>
                  {contactSubmitting ? 'Sending...' : 'Στείλτε Μήνυμα'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    
      {/* Testimonials Section */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">Οι πελάτες μας λένε</h2>
          
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
          <Banner banners={customersBanner} imageFit="cover" />
        </section>
      )}

      {/* Blog Section */}
      <section className="section bg-gray-50">
        <div className="container">
          <h2 className="section-title">Το Blog μας</h2>
          <p className="section-subtitle">
            Μείνε ενημερωμένος για τις πρόσφατες ειδήσεις και νέες πληροφορίες
          </p>
          
          {recentBlogs.length > 0 ? (
            <div className="grid grid-3">
              {recentBlogs.map(blog => (
                <BlogCard key={blog._id} blog={blog} />
              ))}
            </div>
          ) : (
            <div className="text-center">
              <p>Δεν υπάρχουν αναρτήσεις στο blog</p>
            </div>
          )}
          
          <div className="text-center mt-4">
            <Link to="/blog" className="btn btn-primary blog-read-more-btn">
              Διαβάστε Περισσότερα
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home; 