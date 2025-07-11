import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaUpload } from 'react-icons/fa';
import axios from 'axios';
import './Admin.css';

const AdminBlog = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    context: '',
    excerpt: '',
    author: '',
    tags: '',
    published: true
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await axios.get('/api/blog');
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError('Failed to fetch blog posts');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setError('');
    
    if (file) {
      // Validate file type
      if (!file.type.includes('image/')) {
        setError('Please select an image file');
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      
      setSelectedFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Title is required');
      return false;
    }
    
    if (!formData.context.trim()) {
      setError('Context is required');
      return false;
    }
    
    if (!formData.author.trim()) {
      setError('Author is required');
      return false;
    }
    
    if (!editingPost && !selectedFile) {
      setError('Please select an image for new blog posts');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('context', formData.context);
      formDataToSend.append('excerpt', formData.excerpt);
      formDataToSend.append('author', formData.author);
      formDataToSend.append('tags', formData.tags);
      formDataToSend.append('published', formData.published);
      
      if (selectedFile) {
        formDataToSend.append('image', selectedFile);
      }

      if (editingPost) {
        await axios.put(`/api/blog/${editingPost._id}`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
      } else {
        await axios.post('/api/blog', formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
      }
      
      fetchPosts();
      resetForm();
    } catch (error) {
      console.error('Error saving blog post:', error);
      setError(error.response?.data?.message || 'Failed to save blog post');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this blog post?')) {
      try {
        await axios.delete(`/api/blog/${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        fetchPosts();
      } catch (error) {
        console.error('Error deleting blog post:', error);
        setError('Failed to delete blog post');
      }
    }
  };

  const handleEdit = (post) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      context: post.context,
      excerpt: post.excerpt || '',
      author: post.author,
      tags: post.tags.join(', '),
      published: post.published
    });
    setImagePreview(post.image ? post.image : '');
    setSelectedFile(null);
    setError('');
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      context: '',
      excerpt: '',
      author: '',
      tags: '',
      published: true
    });
    setEditingPost(null);
    setSelectedFile(null);
    setImagePreview('');
    setError('');
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="admin-blog">
      <div className="page-header">
        <h1>Manage Blog Posts</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
        >
          <FaPlus /> Add Post
        </button>
      </div>

      {showForm && (
        <div className="form-overlay">
          <div className="form-modal">
            <div className="form-header">
              <h2>{editingPost ? 'Edit Blog Post' : 'Add Blog Post'}</h2>
              <button onClick={resetForm} className="close-btn">&times;</button>
            </div>
            
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="admin-form">
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                  className="form-input"
                  placeholder="Enter blog post title"
                />
              </div>

              <div className="form-group">
                <label>Author *</label>
                <input
                  type="text"
                  value={formData.author}
                  onChange={(e) => setFormData({...formData, author: e.target.value})}
                  required
                  className="form-input"
                  placeholder="Enter author name"
                />
              </div>

              <div className="form-group">
                <label>Blog Image {!editingPost && '*'}</label>
                <div className="file-upload">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="file-input"
                    id="blog-image"
                  />
                  <label htmlFor="blog-image" className="file-label">
                    <FaUpload /> Choose Image
                  </label>
                </div>
                {selectedFile && (
                  <p className="file-info">Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</p>
                )}
                {editingPost && !selectedFile && (
                  <p className="file-info">Current image will be kept</p>
                )}
              </div>

              {imagePreview && (
                <div className="form-group">
                  <label>Image Preview</label>
                  <div className="image-preview">
                    <img src={imagePreview} alt="Blog preview" />
                  </div>
                </div>
              )}

              <div className="form-group">
                <label>Excerpt</label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
                  className="form-textarea"
                  placeholder="Enter blog excerpt (optional)"
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Context *</label>
                <textarea
                  value={formData.context}
                  onChange={(e) => setFormData({...formData, context: e.target.value})}
                  required
                  className="form-textarea"
                  placeholder="Enter blog content"
                  rows="10"
                />
              </div>

              <div className="form-group">
                <label>Tags (comma separated)</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({...formData, tags: e.target.value})}
                  className="form-input"
                  placeholder="Enter tags separated by commas"
                />
              </div>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.published}
                    onChange={(e) => setFormData({...formData, published: e.target.checked})}
                  />
                  Published
                </label>
              </div>

              <div className="form-actions">
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Saving...' : (editingPost ? 'Update' : 'Create') + ' Post'}
                </button>
                <button 
                  type="button" 
                  onClick={resetForm} 
                  className="btn btn-secondary"
                  disabled={submitting}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Title</th>
              <th>Author</th>
              <th>Published</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.map(post => (
              <tr key={post._id}>
                <td>
                  {post.image && (
                    <img 
                      src={post.image} 
                      alt={post.title}
                      className="blog-thumbnail"
                    />
                  )}
                </td>
                <td>{post.title}</td>
                <td>{post.author}</td>
                <td>{post.published ? 'Yes' : 'No'}</td>
                <td>
                  <div className="action-buttons">
                    <button 
                      onClick={() => handleEdit(post)}
                      className="btn btn-sm btn-secondary"
                    >
                      <FaEdit />
                    </button>
                    <button 
                      onClick={() => handleDelete(post._id)}
                      className="btn btn-sm btn-danger"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {posts.length === 0 && (
          <div className="empty-state">
            <p>No blog posts found. Create your first blog post to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBlog; 