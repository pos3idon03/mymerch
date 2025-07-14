import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import './BlogDetail.css';

const BlogDetail = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBlog();
  }, [id]);

  const fetchBlog = async () => {
    try {
      const response = await axios.get(`/api/blog/${id}`);
      setBlog(response.data);
    } catch (error) {
      console.error('Error fetching blog:', error);
      setError('Failed to load blog post');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="error-container">
        <h2>Blog Post Not Found</h2>
        <p>{error || 'The blog post you are looking for does not exist.'}</p>
        <Link to="/blog" className="btn btn-primary">
          Back to Blog
        </Link>
      </div>
    );
  }

  return (
    <div className="blog-detail-page">
      <div className="container">
        <div className="blog-header">
          <Link to="/blog" className="back-link">
            ← Back to Blog
          </Link>
          
          <h1 className="blog-title">{blog.title}</h1>
          
          <div className="blog-meta">
            <span className="blog-author">By {blog.author}</span>
            <span className="blog-date">
              {new Date(blog.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>
        </div>

        {blog.image && (
          <div className="blog-image-container">
            <img 
              src={blog.image} 
              alt={blog.title}
              className="blog-image"
              loading='lazy'
            />
          </div>
        )}

        <div className="blog-content">
          {blog.excerpt && (
            <div className="blog-excerpt">
              <p>{blog.excerpt}</p>
            </div>
          )}

          <div className="blog-context">
            {blog.context.split('\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          {blog.tags && blog.tags.length > 0 && (
            <div className="blog-tags">
              <h3>Tags:</h3>
              <div className="tags-list">
                {blog.tags.map((tag, index) => (
                  <span key={index} className="tag">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogDetail; 