import React from 'react';
import { Link } from 'react-router-dom';
import './BlogCard.css';

const BlogCard = ({ blog }) => {
  return (
    <div className="blog-card">
      <div className="blog-image">
        <img 
          src={blog.image} 
          alt={blog.title}
          onError={(e) => {
            e.target.src = '/placeholder-blog.jpg';
          }}
          loading='lazy'
        />
      </div>
      <div className="blog-content">
        <h3 className="blog-title">{blog.title}</h3>
        {blog.excerpt && (
          <p className="blog-excerpt">{blog.excerpt}</p>
        )}
        <div className="blog-meta">
          <span className="blog-author">By {blog.author}</span>
          <span className="blog-date">
            {new Date(blog.createdAt).toLocaleDateString()}
          </span>
        </div>
        <Link to={`/blog/${blog._id}`} className="read-more">
          Read More
        </Link>
      </div>
    </div>
  );
};

export default BlogCard; 