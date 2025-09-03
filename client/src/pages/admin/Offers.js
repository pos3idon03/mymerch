import React, { useState, useEffect } from 'react';
import { FaPlus, FaFileContract, FaEdit, FaTrash, FaSave, FaEye } from 'react-icons/fa';
import axios from 'axios';
import './Admin.css';
import './AdminOffer.css';

const AdminOffers = () => {
  const [offers, setOffers] = useState([]);
  const [skus, setSkus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddSKUModal, setShowAddSKUModal] = useState(false);
  const [showViewSKUModal, setShowViewSKUModal] = useState(false);
  const [showEditSKUModal, setShowEditSKUModal] = useState(false);
  const [showCreateOfferForm, setShowCreateOfferForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [selectedSKU, setSelectedSKU] = useState(null);
  const [skuFormData, setSkuFormData] = useState({
    productDescription: '',
    vendor: '',
    priceWithoutVAT: '',
    minimumOrderItems: ''
  });
  const [offerFormData, setOfferFormData] = useState({
    customerName: '',
    offerDate: new Date().toISOString().split('T')[0],
    items: [{
      sku: '',
      quantity: '',
      printCostPerItem: '',
      marginPercentage: ''
    }]
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [offersRes, skusRes] = await Promise.all([
        axios.get('/api/offers', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }),
        axios.get('/api/sku', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
      ]);
      setOffers(offersRes.data);
      setSkus(skusRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Error fetching data');
      setLoading(false);
    }
  };

  const handleAddSKU = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await axios.post('/api/sku', skuFormData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      setSkuFormData({
        productDescription: '',
        vendor: '',
        priceWithoutVAT: '',
        minimumOrderItems: ''
      });
      setShowAddSKUModal(false);
      fetchData(); // Refresh SKUs
    } catch (error) {
      console.error('Error adding SKU:', error);
      setError(error.response?.data?.message || 'Error adding SKU');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSKU = (sku) => {
    setSelectedSKU(sku);
    setSkuFormData({
      productDescription: sku.productDescription,
      vendor: sku.vendor,
      priceWithoutVAT: sku.priceWithoutVAT,
      minimumOrderItems: sku.minimumOrderItems
    });
    setShowEditSKUModal(true);
  };

  const handleUpdateSKU = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await axios.put(`/api/sku/${selectedSKU._id}`, skuFormData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      setSkuFormData({
        productDescription: '',
        vendor: '',
        priceWithoutVAT: '',
        minimumOrderItems: ''
      });
      setSelectedSKU(null);
      setShowEditSKUModal(false);
      fetchData(); // Refresh SKUs
    } catch (error) {
      console.error('Error updating SKU:', error);
      setError(error.response?.data?.message || 'Error updating SKU');
    } finally {
      setSubmitting(false);
    }
  };

  const addOfferItem = () => {
    setOfferFormData(prev => ({
      ...prev,
      items: [...prev.items, {
        sku: '',
        quantity: '',
        printCostPerItem: '',
        marginPercentage: ''
      }]
    }));
  };

  const updateOfferItem = (index, field, value) => {
    setOfferFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const removeOfferItem = (index) => {
    setOfferFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const calculateItemValues = (item) => {
    if (!item.sku || !item.quantity || !item.printCostPerItem || !item.marginPercentage) {
      return {
        totalCostWithoutVAT: 0,
        costVAT: 0,
        totalCost: 0,
        netRevenue: 0,
        vat: 0,
        totalRevenue: 0,
        profit: 0,
        sellingPricePerItemWithoutVAT: 0,
        sellingPricePerItemWithVAT: 0,
        profitPerItem: 0
      };
    }

    const selectedSKU = skus.find(sku => sku._id === item.sku);
    if (!selectedSKU) {
      return {
        totalCostWithoutVAT: 0,
        costVAT: 0,
        totalCost: 0,
        netRevenue: 0,
        vat: 0,
        totalRevenue: 0,
        profit: 0,
        sellingPricePerItemWithoutVAT: 0,
        sellingPricePerItemWithVAT: 0,
        profitPerItem: 0
      };
    }

    const quantity = parseFloat(item.quantity);
    const printCostPerItem = parseFloat(item.printCostPerItem);
    const marginPercentage = parseFloat(item.marginPercentage);
    const skuPrice = selectedSKU.priceWithoutVAT;

    // Calculate costs
    const totalCostWithoutVAT = (skuPrice + printCostPerItem) * quantity;
    const costVAT = totalCostWithoutVAT * 0.24;
    const totalCost = totalCostWithoutVAT + costVAT;

    // Calculate selling prices and revenue
    // Net Revenue = Total Cost * (1 + Margin)
    const netRevenue = totalCost * (1 + marginPercentage / 100);
    const vat = netRevenue * 0.24;
    const totalRevenue = netRevenue + vat;
    
    // Calculate per-item values
    const sellingPricePerItemWithoutVAT = netRevenue / quantity;
    const sellingPricePerItemWithVAT = totalRevenue / quantity;
    const profit = totalRevenue - totalCost;
    const profitPerItem = profit / quantity;

    return {
      totalCostWithoutVAT,
      costVAT,
      totalCost,
      netRevenue,
      vat,
      totalRevenue,
      profit,
      sellingPricePerItemWithoutVAT,
      sellingPricePerItemWithVAT,
      profitPerItem
    };
  };

  const handleSaveOffer = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await axios.post('/api/offers', offerFormData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      resetOfferForm();
      setShowCreateOfferForm(false);
      fetchData(); // Refresh offers
    } catch (error) {
      console.error('Error saving offer:', error);
      setError(error.response?.data?.message || 'Error saving offer');
    } finally {
      setSubmitting(false);
    }
  };

  const viewOffer = (offer) => {
    setSelectedOffer(offer);
    setShowViewModal(true);
  };

  const deleteOffer = async (id) => {
    if (window.confirm('Are you sure you want to delete this offer?')) {
      try {
        await axios.delete(`/api/offers/${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        fetchData();
      } catch (error) {
        console.error('Error deleting offer:', error);
        setError('Error deleting offer');
      }
    }
  };

  const resetOfferForm = () => {
    setOfferFormData({
      customerName: '',
      offerDate: new Date().toISOString().split('T')[0],
      items: [{
        sku: '',
        quantity: '',
        printCostPerItem: '',
        marginPercentage: ''
      }]
    });
  };

  if (loading) {
    return <div className="admin-container">Loading...</div>;
  }

  return (
    <div className="admin-categories">
      <div className="page-header">
        <h1>Offers Management</h1>
        <div className="admin-actions">
          <button 
            className="btn btn-primary"
            onClick={() => setShowAddSKUModal(true)}
          >
            <FaPlus /> Add SKU
          </button>
          <button 
            className="btn btn-info"
            onClick={() => setShowViewSKUModal(true)}
          >
            <FaEye /> View SKU's
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => setShowCreateOfferForm(true)}
          >
            <FaFileContract /> Create Offer
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Add SKU Modal */}
      {showAddSKUModal && (
        <div className="form-overlay">
          <div className="form-modal">
            <div className="form-header">
              <h2>Add New SKU</h2>
              <button 
                className="close-btn"
                onClick={() => setShowAddSKUModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleAddSKU} className="admin-form">
              <div className="form-group">
                <label>Product Description</label>
                <input
                  type="text"
                  value={skuFormData.productDescription}
                  onChange={(e) => setSkuFormData(prev => ({ ...prev, productDescription: e.target.value }))}
                  className="form-input"
                  placeholder="Enter product description"
                  required
                />
              </div>
              <div className="form-group">
                <label>Vendor</label>
                <input
                  type="text"
                  value={skuFormData.vendor}
                  onChange={(e) => setSkuFormData(prev => ({ ...prev, vendor: e.target.value }))}
                  className="form-input"
                  placeholder="Enter vendor name"
                  required
                />
              </div>
              <div className="form-group">
                <label>Price without VAT</label>
                <input
                  type="number"
                  step="0.01"
                  value={skuFormData.priceWithoutVAT}
                  onChange={(e) => setSkuFormData(prev => ({ ...prev, priceWithoutVAT: e.target.value }))}
                  className="form-input"
                  placeholder="Enter price"
                  required
                />
              </div>
              <div className="form-group">
                <label>Minimum Order Items</label>
                <input
                  type="number"
                  min="1"
                  value={skuFormData.minimumOrderItems}
                  onChange={(e) => setSkuFormData(prev => ({ ...prev, minimumOrderItems: e.target.value }))}
                  className="form-input"
                  placeholder="Enter minimum order"
                  required
                />
              </div>
              <div className="form-actions">
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Adding...' : 'Add Product'}
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowAddSKUModal(false)} 
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

      {/* View SKU Modal */}
      {showViewSKUModal && (
        <div className="form-overlay">
          <div className="form-modal large-modal">
            <div className="form-header">
              <h2>SKU Products Overview</h2>
              <button 
                className="close-btn"
                onClick={() => setShowViewSKUModal(false)}
              >
                ×
              </button>
            </div>
            <div className="sku-overview">
              <div className="table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>SKU Code</th>
                      <th>Product Description</th>
                      <th>Vendor</th>
                      <th>Price (without VAT)</th>
                      <th>Minimum Order Items</th>
                      <th>Created Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {skus.length > 0 ? (
                      skus.map(sku => (
                        <tr key={sku._id}>
                          <td>{sku.skuCode}</td>
                          <td>{sku.productDescription}</td>
                          <td>{sku.vendor}</td>
                          <td>€{sku.priceWithoutVAT.toFixed(2)}</td>
                          <td>{sku.minimumOrderItems}</td>
                          <td>{new Date(sku.createdAt).toLocaleDateString()}</td>
                          <td>
                            <div className="action-buttons">
                              <button
                                onClick={() => handleEditSKU(sku)}
                                className="btn btn-sm btn-warning"
                                title="Edit SKU"
                              >
                                <FaEdit />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="empty-state">
                          No SKUs found. Add your first SKU to get started.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="sku-summary">
                <div className="summary-stats">
                  <div className="stat-item">
                    <span className="stat-label">Total SKUs</span>
                    <span className="stat-value">{skus.length}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Average Price</span>
                    <span className="stat-value">
                      €{skus.length > 0 ? (skus.reduce((sum, sku) => sum + sku.priceWithoutVAT, 0) / skus.length).toFixed(2) : '0.00'}
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Unique Vendors</span>
                    <span className="stat-value">
                      {new Set(skus.map(sku => sku.vendor)).size}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="form-actions">
              <button 
                type="button" 
                onClick={() => setShowViewSKUModal(false)} 
                className="btn btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit SKU Modal */}
      {showEditSKUModal && selectedSKU && (
        <div className="form-overlay">
          <div className="form-modal">
            <div className="form-header">
              <h2>Edit SKU - {selectedSKU.skuCode}</h2>
              <button 
                className="close-btn"
                onClick={() => {
                  setShowEditSKUModal(false);
                  setSelectedSKU(null);
                  setSkuFormData({
                    productDescription: '',
                    vendor: '',
                    priceWithoutVAT: '',
                    minimumOrderItems: ''
                  });
                }}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleUpdateSKU} className="admin-form">
              <div className="form-group">
                <label>Product Description</label>
                <input
                  type="text"
                  value={skuFormData.productDescription}
                  onChange={(e) => setSkuFormData(prev => ({ ...prev, productDescription: e.target.value }))}
                  className="form-input"
                  placeholder="Enter product description"
                  required
                />
              </div>
              <div className="form-group">
                <label>Vendor</label>
                <input
                  type="text"
                  value={skuFormData.vendor}
                  onChange={(e) => setSkuFormData(prev => ({ ...prev, vendor: e.target.value }))}
                  className="form-input"
                  placeholder="Enter vendor name"
                  required
                />
              </div>
              <div className="form-group">
                <label>Price without VAT</label>
                <input
                  type="number"
                  step="0.01"
                  value={skuFormData.priceWithoutVAT}
                  onChange={(e) => setSkuFormData(prev => ({ ...prev, priceWithoutVAT: e.target.value }))}
                  className="form-input"
                  placeholder="Enter price"
                  required
                />
              </div>
              <div className="form-group">
                <label>Minimum Order Items</label>
                <input
                  type="number"
                  min="1"
                  value={skuFormData.minimumOrderItems}
                  onChange={(e) => setSkuFormData(prev => ({ ...prev, minimumOrderItems: e.target.value }))}
                  className="form-input"
                  placeholder="Enter minimum order"
                  required
                />
              </div>
              <div className="form-actions">
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Updating...' : 'Update SKU'}
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    setShowEditSKUModal(false);
                    setSelectedSKU(null);
                    setSkuFormData({
                      productDescription: '',
                      vendor: '',
                      priceWithoutVAT: '',
                      minimumOrderItems: ''
                    });
                  }} 
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

      {/* Create Offer Form */}
      {showCreateOfferForm && (
        <div className="admin-offer-form">
          <div className="form-overlay">
            <div className="form-modal large-modal">
              <div className="form-header">
                <h2>Create Offer</h2>
                <button 
                  className="close-btn"
                  onClick={() => {
                    setShowCreateOfferForm(false);
                    resetOfferForm();
                  }}
                >
                  ×
                </button>
              </div>
              <form onSubmit={handleSaveOffer} className="admin-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Customer Name</label>
                  <input
                    type="text"
                    value={offerFormData.customerName}
                    onChange={(e) => setOfferFormData(prev => ({ ...prev, customerName: e.target.value }))}
                    className="form-input"
                    placeholder="Enter customer name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Offer Date</label>
                  <input
                    type="date"
                    value={offerFormData.offerDate}
                    onChange={(e) => setOfferFormData(prev => ({ ...prev, offerDate: e.target.value }))}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div className="offer-items-section">
                <div className="section-header">
                  <h3>Offer Items</h3>
                  <button type="button" onClick={addOfferItem} className="btn btn-primary">
                    <FaPlus /> Add Item
                  </button>
                </div>

                {offerFormData.items.length > 0 ? (
                  <div className="table-container">
                    <table className="offer-table">
                       <thead>
                         <tr>
                           <th>Product</th>
                           <th>Quantity</th>
                           <th>Print Cost/Item</th>
                           <th>Total Cost without VAT</th>
                           <th>Cost VAT</th>
                           <th>Total Cost</th>
                           <th>Margin %</th>
                           <th>Net Revenue</th>
                           <th>VAT</th>
                           <th>Total Revenue</th>
                           <th>Profit</th>
                           <th>Cost per Item without VAT</th>
                           <th>Cost per Item with VAT</th>
                           <th>Selling Price / Item without VAT</th>
                           <th>Selling Price / Item with VAT</th>
                           <th>Profit / Item</th>
                           <th>Actions</th>
                         </tr>
                       </thead>
                                             <tbody>
                         {offerFormData.items.map((item, index) => {
                           const calculated = calculateItemValues(item);
                           return (
                             <tr key={index}>
                               <td>
                                 <select
                                   value={item.sku}
                                   onChange={(e) => updateOfferItem(index, 'sku', e.target.value)}
                                   required
                                 >
                                   <option value="">Select Product</option>
                                   {skus.map(sku => (
                                     <option key={sku._id} value={sku._id}>
                                       {sku.skuCode} - {sku.productDescription}
                                     </option>
                                   ))}
                                 </select>
                               </td>
                               <td>
                                 <input
                                   type="number"
                                   min="1"
                                   value={item.quantity}
                                   onChange={(e) => updateOfferItem(index, 'quantity', e.target.value)}
                                   required
                                 />
                               </td>
                               <td>
                                 <input
                                   type="number"
                                   step="0.01"
                                   min="0"
                                   value={item.printCostPerItem}
                                   onChange={(e) => updateOfferItem(index, 'printCostPerItem', e.target.value)}
                                   required
                                 />
                               </td>
                               <td>€{calculated.totalCostWithoutVAT.toFixed(2)}</td>
                               <td>€{calculated.costVAT.toFixed(2)}</td>
                               <td>€{calculated.totalCost.toFixed(2)}</td>
                               <td>
                                 <input
                                   type="number"
                                   step="0.01"
                                   min="0"
                                   value={item.marginPercentage}
                                   onChange={(e) => updateOfferItem(index, 'marginPercentage', e.target.value)}
                                   required
                                 />
                               </td>
                               <td>€{calculated.netRevenue.toFixed(2)}</td>
                               <td>€{calculated.vat.toFixed(2)}</td>
                               <td>€{calculated.totalRevenue.toFixed(2)}</td>
                               <td>€{calculated.profit.toFixed(2)}</td>
                               <td>€{(calculated.totalCostWithoutVAT / (item.quantity || 1)).toFixed(2)}</td>
                               <td>€{(calculated.totalCost / (item.quantity || 1)).toFixed(2)}</td>
                               <td>€{calculated.sellingPricePerItemWithoutVAT.toFixed(2)}</td>
                               <td>€{calculated.sellingPricePerItemWithVAT.toFixed(2)}</td>
                               <td>€{calculated.profitPerItem.toFixed(2)}</td>
                               <td>
                                 <button
                                   type="button"
                                   onClick={() => removeOfferItem(index)}
                                   className="btn btn-danger btn-sm"
                                 >
                                   <FaTrash />
                                 </button>
                               </td>
                             </tr>
                           );
                         })}
                         {/* Totals Row */}
                         {offerFormData.items.length > 0 && (
                           <tr style={{ backgroundColor: '#f9fafb', fontWeight: 'bold' }}>
                             <td colSpan="3">TOTALS</td>
                             <td>€{offerFormData.items.reduce((sum, item) => sum + calculateItemValues(item).totalCostWithoutVAT, 0).toFixed(2)}</td>
                             <td>€{offerFormData.items.reduce((sum, item) => sum + calculateItemValues(item).costVAT, 0).toFixed(2)}</td>
                             <td>€{offerFormData.items.reduce((sum, item) => sum + calculateItemValues(item).totalCost, 0).toFixed(2)}</td>
                             <td>-</td>
                             <td>€{offerFormData.items.reduce((sum, item) => sum + calculateItemValues(item).netRevenue, 0).toFixed(2)}</td>
                             <td>€{offerFormData.items.reduce((sum, item) => sum + calculateItemValues(item).vat, 0).toFixed(2)}</td>
                             <td>€{offerFormData.items.reduce((sum, item) => sum + calculateItemValues(item).totalRevenue, 0).toFixed(2)}</td>
                             <td>€{offerFormData.items.reduce((sum, item) => sum + calculateItemValues(item).profit, 0).toFixed(2)}</td>
                             <td>-</td>
                             <td>-</td>
                             <td>-</td>
                             <td>-</td>
                             <td>-</td>
                             <td>-</td>
                             <td>-</td>
                           </tr>
                         )}
                       </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="empty-offer-items">
                    <h4>No items added yet</h4>
                    <p>Start building your offer by adding products and quantities. You can add multiple items to create a comprehensive quote for your customer.</p>
                    <button type="button" onClick={addOfferItem} className="btn btn-primary">
                      <FaPlus /> Add Your First Item
                    </button>
                  </div>
                )}
              </div>

              <div className="form-actions">
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={submitting || offerFormData.items.length === 0}
                >
                  {submitting ? 'Saving...' : 'Save Offer'}
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    setShowCreateOfferForm(false);
                    resetOfferForm();
                  }} 
                  className="btn btn-secondary"
                  disabled={submitting}
                >
                  Cancel
                </button>
              </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Offer Modal */}
      {showViewModal && selectedOffer && (
        <div className="form-overlay">
          <div className="form-modal large-modal">
            <div className="form-header">
              <h2>Offer Preview - {selectedOffer.customerName}</h2>
              <button 
                className="close-btn"
                onClick={() => setShowViewModal(false)}
              >
                ×
              </button>
            </div>
            <div className="offer-preview">
              <div className="offer-header">
                <div className="offer-info">
                  <h3>{selectedOffer.customerName}</h3>
                  <p>Offer Date: {new Date(selectedOffer.offerDate).toLocaleDateString()}</p>
                </div>
                <div className="offer-summary">
                  <div className="summary-item">
                    <span className="label">Total Cost</span>
                    <span className="value">€{selectedOffer.totalCost.toFixed(2)}</span>
                  </div>
                  <div className="summary-item">
                    <span className="label">Total Revenue</span>
                    <span className="value">€{selectedOffer.totalRevenue.toFixed(2)}</span>
                  </div>
                  <div className="summary-item">
                    <span className="label">Total Profit</span>
                    <span className="value">€{selectedOffer.totalProfit.toFixed(2)}</span>
                  </div>
                  <div className="summary-item">
                    <span className="label">Profit Margin</span>
                    <span className="value">{selectedOffer.profitMargin.toFixed(2)}%</span>
                  </div>
                </div>
              </div>

              <div className="offer-items-preview">
                <h4>Offer Items</h4>
                <div className="table-container">
                  <table className="offer-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Quantity</th>
                        <th>Print Cost/Item</th>
                        <th>Total Cost without VAT</th>
                        <th>Cost VAT</th>
                        <th>Total Cost</th>
                        <th>Margin %</th>
                        <th>Net Revenue</th>
                        <th>VAT</th>
                        <th>Total Revenue</th>
                        <th>Profit</th>
                        <th>Cost per Item without VAT</th>
                        <th>Cost per Item with VAT</th>
                        <th>Selling Price / Item without VAT</th>
                        <th>Selling Price / Item with VAT</th>
                        <th>Profit / Item</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOffer.items.map((item, index) => {
                        // Use populated SKU data from the offer item
                        const skuData = item.sku;
                        return (
                          <tr key={index}>
                            <td>
                              {skuData ? `${skuData.skuCode} - ${skuData.productDescription}` : 'Unknown Product'}
                            </td>
                            <td>{item.quantity}</td>
                            <td>€{item.printCostPerItem.toFixed(2)}</td>
                            <td>€{(item.totalCostWithoutVAT || 0).toFixed(2)}</td>
                            <td>€{(item.costVAT || 0).toFixed(2)}</td>
                            <td>€{(item.totalCost || 0).toFixed(2)}</td>
                            <td>{item.marginPercentage}%</td>
                            <td>€{(item.netRevenue || 0).toFixed(2)}</td>
                            <td>€{(item.vat || 0).toFixed(2)}</td>
                            <td>€{(item.totalRevenue || 0).toFixed(2)}</td>
                            <td>€{((item.totalRevenue || 0) - (item.totalCost || 0)).toFixed(2)}</td>
                            <td>€{((item.totalCostWithoutVAT || 0) / item.quantity).toFixed(2)}</td>
                            <td>€{((item.totalCost || 0) / item.quantity).toFixed(2)}</td>
                            <td>€{(item.sellingPricePerItemWithoutVAT || 0).toFixed(2)}</td>
                            <td>€{(item.sellingPricePerItemWithVAT || 0).toFixed(2)}</td>
                            <td>€{(((item.totalRevenue || 0) - (item.totalCost || 0)) / item.quantity).toFixed(2)}</td>
                          </tr>
                        );
                      })}
                      {/* Totals Row */}
                      <tr style={{ backgroundColor: '#f9fafb', fontWeight: 'bold' }}>
                        <td colSpan="3">TOTALS</td>
                        <td>€{selectedOffer.items.reduce((sum, item) => sum + (item.totalCostWithoutVAT || 0), 0).toFixed(2)}</td>
                        <td>€{selectedOffer.items.reduce((sum, item) => sum + (item.costVAT || 0), 0).toFixed(2)}</td>
                        <td>€{selectedOffer.items.reduce((sum, item) => sum + (item.totalCost || 0), 0).toFixed(2)}</td>
                        <td>-</td>
                        <td>€{selectedOffer.items.reduce((sum, item) => sum + (item.netRevenue || 0), 0).toFixed(2)}</td>
                        <td>€{selectedOffer.items.reduce((sum, item) => sum + (item.vat || 0), 0).toFixed(2)}</td>
                        <td>€{selectedOffer.items.reduce((sum, item) => sum + (item.totalRevenue || 0), 0).toFixed(2)}</td>
                        <td>€{selectedOffer.items.reduce((sum, item) => sum + ((item.totalRevenue || 0) - (item.totalCost || 0)), 0).toFixed(2)}</td>
                        <td>-</td>
                        <td>-</td>
                        <td>-</td>
                        <td>-</td>
                        <td>-</td>
                        <td>-</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div className="form-actions">
              <button 
                type="button" 
                onClick={() => setShowViewModal(false)} 
                className="btn btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Offer Date</th>
              <th>Cost</th>
              <th>Revenue</th>
              <th>Profit</th>
              <th>Profit Margin</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {offers.map(offer => (
              <tr key={offer._id}>
                <td>{offer.customerName}</td>
                <td>{new Date(offer.offerDate).toLocaleDateString()}</td>
                <td>€{offer.totalCost.toFixed(2)}</td>
                <td>€{offer.totalRevenue.toFixed(2)}</td>
                <td>€{offer.totalProfit.toFixed(2)}</td>
                <td>{offer.profitMargin.toFixed(2)}%</td>
                <td>
                  <div className="action-buttons">
                    <button
                      onClick={() => viewOffer(offer)}
                      className="btn btn-sm btn-info"
                      title="View Offer"
                    >
                      <FaEye />
                    </button>
                    <button
                      onClick={() => deleteOffer(offer._id)}
                      className="btn btn-sm btn-danger"
                      title="Delete Offer"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {offers.length === 0 && (
          <div className="empty-state">
            <p>No offers found. Create your first offer to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOffers;
