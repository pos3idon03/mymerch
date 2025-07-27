import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import './Products.css';
import { Helmet } from 'react-helmet';

const Products = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const productsPerPage = 9;
  const totalPages = Math.ceil(products.length / productsPerPage);
  const paginatedProducts = products.slice((currentPage - 1) * productsPerPage, currentPage * productsPerPage);

  useEffect(() => {
    fetchProducts();
  }, [categoryId]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');
      
      let response;
      if (categoryId) {
        response = await axios.get(`/api/products/category/${categoryId}`);
        // Fetch category details for the header
        try {
          const categoryResponse = await axios.get(`/api/categories/${categoryId}`);
          setSelectedCategory(categoryResponse.data);
        } catch (catError) {
          console.error('Error fetching category:', catError);
        }
      } else {
        response = await axios.get('/api/products');
        setSelectedCategory(null);
      }
      
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const handleCategoryFilter = (categoryId) => {
    if (categoryId) {
      navigate(`/products/category/${categoryId}`);
    } else {
      navigate('/products');
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
    <div className="products-page">
      <Helmet>
        <title>Products | MyMerch</title>
        <meta name="description" content="Browse our wide selection of custom products and merchandise. Find the perfect item for your needs at MyMerch." />
        <meta property="og:title" content="Products | MyMerch" />
        <meta property="og:description" content="Browse our wide selection of custom products and merchandise. Find the perfect item for your needs at MyMerch." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.mymerch.gr/products" />
      </Helmet>
      <div className="container">
        <div className="page-header">
          <h1>
            {selectedCategory ? `${selectedCategory.name} Products` : 'Our Products'}
          </h1>
          <p>
            {selectedCategory 
              ? `Discover our ${selectedCategory.name.toLowerCase()} products`
              : 'Discover our comprehensive range of high-quality products'
            }
          </p>
          {selectedCategory && (
            <button 
              className="back-to-all-btn"
              onClick={() => handleCategoryFilter(null)}
            >
              ← See All Products
            </button>
          )}
        </div>

        {products.length > 0 ? (
          <>
            <div className="products-grid">
              {paginatedProducts.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
            {totalPages > 1 && (
              <div className="pagination">
                <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>&laquo; Prev</button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    className={currentPage === i + 1 ? 'active' : ''}
                    onClick={() => handlePageChange(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
                <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>Next &raquo;</button>
              </div>
            )}
          </>
        ) : (
          <div className="empty-state">
            <p>No products available at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products; 