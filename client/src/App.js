import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import AdminNavbar from './components/AdminNavbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Blog from './pages/Blog';
import BlogDetail from './pages/BlogDetail';
import FAQ from './pages/FAQ';
import Sitemap from './pages/Sitemap';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import TestYourIdea from './pages/TestYourIdea';
import OurWorks from './pages/OurWorks';
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/Products';
import AdminCategories from './pages/admin/Categories';
import AdminBlog from './pages/admin/Blog';
import AdminBanners from './pages/admin/Banners';
import AdminTestimonials from './pages/admin/Testimonials';
import AdminAbout from './pages/admin/About';
import AdminFAQ from './pages/admin/FAQ';
import AdminAssets from './pages/admin/Assets';
import AdminEvents from './pages/admin/Events';
import AdminCustomOrders from './pages/admin/CustomOrders';
import AdminContact from './pages/admin/Contact';
import AdminOurWork from './pages/admin/OurWork';
import AdminCustomers from './pages/admin/Customers';
import './App.css';
import axios from 'axios';

// Scroll to top component
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const [isValidating, setIsValidating] = React.useState(true);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  
  React.useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setIsValidating(false);
        setIsAuthenticated(false);
        return;
      }
      
      try {
        // Make a simple API call to validate the token
        const response = await axios.get('/api/auth/user', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.status === 200) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          localStorage.removeItem('token');
        }
      } catch (error) {
        setIsAuthenticated(false);
        localStorage.removeItem('token');
      } finally {
        setIsValidating(false);
      }
    };
    
    validateToken();
  }, []);
  
  if (isValidating) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }
  
  return children;
};

// Admin Layout Component
const AdminLayout = ({ children }) => {
  return (
    <div className="admin-layout">
      <AdminNavbar />
      <div className="admin-content">
        {children}
      </div>
    </div>
  );
};

function App() {
  useEffect(() => {
    // Set up axios interceptor for handling 401 errors
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          // Token is invalid or expired
          localStorage.removeItem('token');
          // Only redirect if we're on an admin page
          if (window.location.pathname.startsWith('/admin')) {
            window.location.href = '/admin/login';
          }
        }
        return Promise.reject(error);
      }
    );

    axios.get('/api/company/settings').then(res => {
      if (res.data.favicon) {
        const faviconUrl = res.data.favicon;
        let link = document.querySelector("link[rel~='icon']");
        if (!link) {
          link = document.createElement('link');
          link.rel = 'icon';
          document.head.appendChild(link);
        }
        link.href = faviconUrl;
      }
    });

    // Cleanup interceptor on unmount
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  return (
    <Router>
      <ScrollToTop />
      <div className="App">
        <Routes>
          {/* Admin Routes */}
          <Route path="/admin/login" element={
            (() => {
              const token = localStorage.getItem('token');
              if (token) {
                return <Navigate to="/admin" replace />;
              }
              return <AdminLogin />;
            })()
          } />
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminLayout>
                <AdminDashboard />
              </AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/products" element={
            <ProtectedRoute>
              <AdminLayout>
                <AdminProducts />
              </AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/categories" element={
            <ProtectedRoute>
              <AdminLayout>
                <AdminCategories />
              </AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/blog" element={
            <ProtectedRoute>
              <AdminLayout>
                <AdminBlog />
              </AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/banners" element={
            <ProtectedRoute>
              <AdminLayout>
                <AdminBanners />
              </AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/testimonials" element={
            <ProtectedRoute>
              <AdminLayout>
                <AdminTestimonials />
              </AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/about" element={
            <ProtectedRoute>
              <AdminLayout>
                <AdminAbout />
              </AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/faq" element={
            <ProtectedRoute>
              <AdminLayout>
                <AdminFAQ />
              </AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/assets" element={
            <ProtectedRoute>
              <AdminLayout>
                <AdminAssets />
              </AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/events" element={
            <ProtectedRoute>
              <AdminLayout>
                <AdminEvents />
              </AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/custom-orders" element={
            <ProtectedRoute>
              <AdminLayout>
                <AdminCustomOrders />
              </AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/contact" element={
            <ProtectedRoute>
              <AdminLayout>
                <AdminContact />
              </AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/our-work" element={
            <ProtectedRoute>
              <AdminLayout>
                <AdminOurWork />
              </AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/customers" element={
            <ProtectedRoute>
              <AdminLayout>
                <AdminCustomers />
              </AdminLayout>
            </ProtectedRoute>
          } />
          {/* Client Routes */}
          <Route path="/" element={
            <>
              <Navbar />
              <Home />
              <Footer />
            </>
          } />
          <Route path="/about" element={
            <>
              <Navbar />
              <About />
              <Footer />
            </>
          } />
          <Route path="/contact" element={
            <>
              <Navbar />
              <Contact />
              <Footer />
            </>
          } />
          <Route path="/faq" element={
            <>
              <Navbar />
              <FAQ />
              <Footer />
            </>
          } />
          <Route path="/sitemap" element={
            <>
              <Navbar />
              <Sitemap />
              <Footer />
            </>
          } />
          <Route path="/terms" element={
            <>
              <Navbar />
              <Terms />
              <Footer />
            </>
          } />
          <Route path="/privacy" element={
            <>
              <Navbar />
              <Privacy />
              <Footer />
            </>
          } />
          <Route path="/test-your-idea" element={
            <>
              <Navbar />
              <TestYourIdea />
              <Footer />
            </>
          } />
          <Route path="/products" element={
            <>
              <Navbar />
              <Products />
              <Footer />
            </>
          } />
          <Route path="/products/category/:categoryId" element={
            <>
              <Navbar />
              <Products />
              <Footer />
            </>
          } />
          <Route path="/products/:id" element={
            <>
              <Navbar />
              <ProductDetail />
              <Footer />
            </>
          } />
          <Route path="/blog" element={
            <>
              <Navbar />
              <Blog />
              <Footer />
            </>
          } />
          <Route path="/blog/:id" element={
            <>
              <Navbar />
              <BlogDetail />
              <Footer />
            </>
          } />
          <Route path="/our-works" element={
            <>
              <Navbar />
              <OurWorks />
              <Footer />
            </>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App; 