import React from 'react';
import { Link } from 'react-router-dom';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  return (
    <div className="product-card">
      <div className="product-image">
        <img 
          src={product.image} 
          alt={product.title}
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
          }}
        />
      </div>
      <div className="product-content">
        <h3 className="product-title">{product.title}</h3>
        <p className="product-category">
          {Array.isArray(product.categories) && product.categories.length > 0
            ? product.categories.map(c => c.name).join(', ')
            : 'Uncategorized'}
        </p>
        <p className="product-description">
          {product.description.length > 100 
            ? `${product.description.substring(0, 100)}...` 
            : product.description
          }
        </p>
        <Link to={`/products/${product._id}`} className="product-details-btn">
          View Details
        </Link>
      </div>
    </div>
  );
};

export default ProductCard; 