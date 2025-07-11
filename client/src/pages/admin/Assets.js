import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaUpload } from 'react-icons/fa';
import './Admin.css';

const Assets = () => {
  const [form, setForm] = useState({
    facebook: '',
    instagram: '',
    twitter: '',
    linkedin: '',
    location: '',
    telephone: '',
    email: '',
  });
  const [logoPreview, setLogoPreview] = useState('');
  const [faviconPreview, setFaviconPreview] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [faviconFile, setFaviconFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const logoInputRef = useRef();
  const faviconInputRef = useRef();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await axios.get('/api/company/settings');
      setForm({
        facebook: res.data.facebook || '',
        instagram: res.data.instagram || '',
        twitter: res.data.twitter || '',
        linkedin: res.data.linkedin || '',
        location: res.data.location || '',
        telephone: res.data.telephone || '',
        email: res.data.email || '',
      });
      setLogoPreview(res.data.logo ? res.data.logo : '');
      setFaviconPreview(res.data.favicon ? res.data.favicon : '');
    } catch (e) {
      setError('Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Only image files are allowed');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }
    if (type === 'logo') {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    } else {
      setFaviconFile(file);
      setFaviconPreview(URL.createObjectURL(file));
    }
  };

  const handleLogoUploadClick = (e) => {
    e.preventDefault();
    logoInputRef.current.click();
  };

  const handleFaviconUploadClick = (e) => {
    e.preventDefault();
    faviconInputRef.current.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    const token = localStorage.getItem('token');
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => formData.append(key, value));
    if (logoFile) formData.append('logo', logoFile);
    if (faviconFile) formData.append('favicon', faviconFile);
    try {
      await axios.put('/api/company/settings', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setSuccess(true);
      setLogoFile(null);
      setFaviconFile(null);
      fetchSettings();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to update settings');
    }
  };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Company Assets & Info</h1>
      </div>
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">Settings updated successfully!</div>}
      <form className="assets-grid-form" onSubmit={handleSubmit}>
        {/* Logo */}
        <div className="asset-form-item">
          <label>Logo</label>
          {logoPreview && <img src={logoPreview} alt="Logo" className="asset-preview" />}
          <input
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            ref={logoInputRef}
            onChange={e => handleFileChange(e, 'logo')}
          />
          <button type="button" className="btn btn-secondary" onClick={handleLogoUploadClick}><FaUpload /> Upload Logo</button>
        </div>
        {/* Favicon */}
        <div className="asset-form-item">
          <label>Favicon</label>
          {faviconPreview && <img src={faviconPreview} alt="Favicon" className="asset-preview" style={{width:32, height:32}} />}
          <input
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            ref={faviconInputRef}
            onChange={e => handleFileChange(e, 'favicon')}
          />
          <button type="button" className="btn btn-secondary" onClick={handleFaviconUploadClick}><FaUpload /> Upload Favicon</button>
        </div>
        {/* Facebook */}
        <div className="asset-form-item">
          <label>Facebook Link</label>
          <input type="text" name="facebook" value={form.facebook} onChange={handleInputChange} className="form-input" placeholder="https://facebook.com/yourpage" />
        </div>
        {/* Instagram */}
        <div className="asset-form-item">
          <label>Instagram Link</label>
          <input type="text" name="instagram" value={form.instagram} onChange={handleInputChange} className="form-input" placeholder="https://instagram.com/yourprofile" />
        </div>
        {/* Twitter */}
        <div className="asset-form-item">
          <label>Twitter (X) Link</label>
          <input type="text" name="twitter" value={form.twitter} onChange={handleInputChange} className="form-input" placeholder="https://twitter.com/yourprofile" />
        </div>
        {/* LinkedIn */}
        <div className="asset-form-item">
          <label>LinkedIn Link</label>
          <input type="text" name="linkedin" value={form.linkedin} onChange={handleInputChange} className="form-input" placeholder="https://linkedin.com/in/yourprofile" />
        </div>
        {/* Location */}
        <div className="asset-form-item">
          <label>Location</label>
          <input type="text" name="location" value={form.location} onChange={handleInputChange} className="form-input" placeholder="123 Business Ave, Suite 100, New York, NY 10001" />
        </div>
        {/* Telephone */}
        <div className="asset-form-item">
          <label>Telephone</label>
          <input type="text" name="telephone" value={form.telephone} onChange={handleInputChange} className="form-input" placeholder="+1 (555) 123-4567" />
        </div>
        {/* Email */}
        <div className="asset-form-item">
          <label>Email</label>
          <input type="email" name="email" value={form.email} onChange={handleInputChange} className="form-input" placeholder="info@mymerch.gr" />
        </div>
        {/* Submit */}
        <div className="asset-form-item full-width">
          <button type="submit" className="btn btn-primary">Save Settings</button>
        </div>
      </form>
    </div>
  );
};

export default Assets; 