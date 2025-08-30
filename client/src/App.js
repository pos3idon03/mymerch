import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
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
  }, []);

  return (
    <Router>
      <ScrollToTop />
      <div className="App">
        <Routes>
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={
            <AdminLayout>
              <AdminDashboard />
            </AdminLayout>
          } />
          <Route path="/admin/products" element={
            <AdminLayout>
              <AdminProducts />
            </AdminLayout>
          } />
          <Route path="/admin/categories" element={
            <AdminLayout>
              <AdminCategories />
            </AdminLayout>
          } />
          <Route path="/admin/blog" element={
            <AdminLayout>
              <AdminBlog />
            </AdminLayout>
          } />
          <Route path="/admin/banners" element={
            <AdminLayout>
              <AdminBanners />
            </AdminLayout>
          } />
          <Route path="/admin/testimonials" element={
            <AdminLayout>
              <AdminTestimonials />
            </AdminLayout>
          } />
          <Route path="/admin/about" element={
            <AdminLayout>
              <AdminAbout />
            </AdminLayout>
          } />
          <Route path="/admin/faq" element={
            <AdminLayout>
              <AdminFAQ />
            </AdminLayout>
          } />
          <Route path="/admin/assets" element={
            <AdminLayout>
              <AdminAssets />
            </AdminLayout>
          } />
          <Route path="/admin/events" element={
            <AdminLayout>
              <AdminEvents />
            </AdminLayout>
          } />
          <Route path="/admin/custom-orders" element={
            <AdminLayout>
              <AdminCustomOrders />
            </AdminLayout>
          } />
          <Route path="/admin/contact" element={
            <AdminLayout>
              <AdminContact />
            </AdminLayout>
          } />
          <Route path="/admin/our-work" element={
            <AdminLayout>
              <AdminOurWork />
            </AdminLayout>
          } />
          <Route path="/admin/customers" element={
            <AdminLayout>
              <AdminCustomers />
            </AdminLayout>
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