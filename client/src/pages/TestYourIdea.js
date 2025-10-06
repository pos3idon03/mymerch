import React, { useState, useRef, useEffect } from 'react';
import { fabric } from 'fabric';
import { useDropzone } from 'react-dropzone';
import './TestYourIdea.css';
import { Helmet } from 'react-helmet';

const TestYourIdea = () => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [currentView, setCurrentView] = useState('front');
  const [canvas, setCanvas] = useState(null);
  const [savedMockups, setSavedMockups] = useState([]);
  const [orderForm, setOrderForm] = useState({
    email: '',
    phone: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [textOptions, setTextOptions] = useState({
    text: '',
    fontSize: 32,
    fontFamily: 'Arial',
    fill: '#000000'
  });
  const [uploadedImages, setUploadedImages] = useState([]);
  const [canvasMessage, setCanvasMessage] = useState('');
  
  const canvasRef = useRef(null);

  const fontOptions = [
    'Arial',
    'Helvetica',
    'Times New Roman',
    'Courier New',
    'Verdana',
    'Georgia',
    'Palatino',
    'Garamond',
    'Comic Sans MS',
    'Impact'
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const initCanvas = () => {
      if (canvasRef.current && !canvas) {
        try {
          console.log('Initializing canvas...');
          const fabricCanvas = new fabric.Canvas(canvasRef.current, {
            width: 600,
            height: 600,
            backgroundColor: '#f8f9fa',
            preserveObjectStacking: true
          });
          
          // Set the canvas reference for fabric.js
          canvasRef.current.fabric = fabricCanvas;
          setCanvas(fabricCanvas);
          
          console.log('Canvas initialized successfully:', fabricCanvas);
        } catch (error) {
          console.error('Error initializing canvas:', error);
        }
      }
    };
    
    // Try to initialize immediately
    initCanvas();
    
    // If that doesn't work, try again after a short delay
    const timeoutId = setTimeout(initCanvas, 100);
    
    return () => {
      clearTimeout(timeoutId);
      if (canvas) {
        canvas.dispose();
      }
    };
  }, []); // Empty dependency array to run only once

  useEffect(() => {
    if (canvas && selectedProduct && selectedColor) {
      updateCanvasBackground();
    }
  }, [selectedProduct, selectedColor, currentView, canvas]);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/design-studio/products?activeOnly=true');
      const data = await res.json();
      setProducts(data);
      
      if (data.length > 0) {
        setSelectedProduct(data[0]);
        if (data[0].colorVariants && data[0].colorVariants.length > 0) {
          setSelectedColor(data[0].colorVariants[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateCanvasBackground = () => {
    if (!canvas || !selectedProduct || !selectedColor) {
      setCanvasMessage('Παρακαλώ επίλεξε προϊόν και χρώμα');
      return;
    }

    const imageUrl = currentView === 'front' 
      ? selectedColor.frontImage 
      : selectedColor.backImage || selectedColor.frontImage;

    if (!imageUrl) {
      setCanvasMessage('Δεν υπάρχει εικόνα για αυτό το προϊόν');
      return;
    }

    console.log('Loading product image:', imageUrl);

    // Clear canvas but preserve user objects
    const userObjects = canvas.getObjects().filter(obj => 
      obj.type === 'textbox' || obj.isUserImage
    );
    
    canvas.clear();
    setCanvasMessage('Φόρτωση εικόνας προϊόντος...');

    // Create and add background image - use direct image loading
    const imgElement = new window.Image();
    
    imgElement.onload = () => {
      try {
        console.log('Product image loaded successfully');
        
        // Create fabric image directly from the loaded image element
        const fabricImg = new fabric.Image(imgElement, {
          selectable: false,
          evented: false,
          isBackgroundImage: true
        });

        const canvasWidth = canvas.getWidth();
        const canvasHeight = canvas.getHeight();
        const scale = Math.min(
          canvasWidth / fabricImg.width,
          canvasHeight / fabricImg.height
        ) * 0.9;

        fabricImg.scale(scale);
        
        // Center the image properly
        const scaledWidth = fabricImg.width * scale;
        const scaledHeight = fabricImg.height * scale;
        
        // Set origin to center for proper positioning
        fabricImg.set({
          originX: 'center',
          originY: 'center',
          left: canvasWidth / 2,
          top: canvasHeight / 2,
          selectable: false,
          evented: false,
          isBackgroundImage: true
        });

        canvas.add(fabricImg);
        canvas.sendToBack(fabricImg);

        // Re-add user objects
        userObjects.forEach(obj => canvas.add(obj));
        canvas.renderAll();
        setCanvasMessage('');
        
        console.log('Background image added to canvas');
      } catch (error) {
        console.error('Error adding background image:', error);
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
          canvas: canvas
        });
        setCanvasMessage(`Σφάλμα προσθήκης εικόνας προϊόντος: ${error.message}`);
      }
    };

    imgElement.onerror = () => {
      console.error('Failed to load product image:', imageUrl);
      setCanvasMessage('Σφάλμα φόρτωσης εικόνας προϊόντος');
      
      try {
        // Create a colored background as fallback
        const canvasWidth = canvas.getWidth();
        const canvasHeight = canvas.getHeight();
        
        const backgroundRect = new fabric.Rect({
          left: 0,
          top: 0,
          width: canvasWidth,
          height: canvasHeight,
          fill: selectedColor.colorCode || '#f0f0f0',
          selectable: false,
          evented: false,
          isBackgroundImage: true
        });
        
        canvas.add(backgroundRect);
        canvas.sendToBack(backgroundRect);
        
        // Re-add user objects
        userObjects.forEach(obj => canvas.add(obj));
        canvas.renderAll();
        
        console.log('Fallback background added');
      } catch (error) {
        console.error('Error adding fallback background:', error);
      }
    };

    imgElement.src = imageUrl;
  };

  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file && canvas) {
      console.log('File dropped:', file.name);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const imgElement = new window.Image();
        imgElement.onload = () => {
          try {
            // Create fabric image directly from the loaded image element
            const fabricImg = new fabric.Image(imgElement, {
              isUserImage: true,
              selectable: true,
              evented: true
            });

            const canvasWidth = canvas.getWidth();
            const canvasHeight = canvas.getHeight();
            const scale = Math.min(
              (canvasWidth * 0.3) / fabricImg.width,
              (canvasHeight * 0.3) / fabricImg.height
            );

            fabricImg.scale(scale);
            fabricImg.set({
              left: canvasWidth / 2 - (fabricImg.width * scale) / 2,
              top: canvasHeight / 2 - (fabricImg.height * scale) / 2,
              isUserImage: true
            });

            canvas.add(fabricImg);
            canvas.setActiveObject(fabricImg);
            canvas.renderAll();

            // Add to uploaded images list for feedback
            const newImage = {
              id: Date.now(),
              name: file.name,
              size: file.size,
              preview: e.target.result,
              fabricObject: fabricImg
            };
            
            setUploadedImages(prev => [...prev, newImage]);
            console.log('Image added to canvas successfully');
          } catch (error) {
            console.error('Error adding image to canvas:', error);
            alert('Σφάλμα προσθήκης εικόνας στο canvas');
          }
        };
        
        imgElement.onerror = () => {
          console.error('Failed to load uploaded image');
          alert('Σφάλμα φόρτωσης εικόνας');
        };
        
        imgElement.src = e.target.result;
      };
      
      reader.onerror = () => {
        console.error('Failed to read file');
        alert('Σφάλμα ανάγνωσης αρχείου');
      };
      
      reader.readAsDataURL(file);
    } else {
      console.log('No canvas available or no file selected');
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.svg']
    },
    multiple: false
  });

  const handleProductChange = (product) => {
    setSelectedProduct(product);
    if (product.colorVariants && product.colorVariants.length > 0) {
      setSelectedColor(product.colorVariants[0]);
    }
  };

  const handleColorChange = (color) => {
    setSelectedColor(color);
  };

  const handleViewToggle = () => {
    setCurrentView(prev => prev === 'front' ? 'back' : 'front');
  };

  const handleAddText = () => {
    if (!canvas || !textOptions.text) return;

    const textbox = new fabric.Textbox(textOptions.text, {
      left: canvas.getWidth() / 2,
      top: canvas.getHeight() / 2,
      fontSize: textOptions.fontSize,
      fontFamily: textOptions.fontFamily,
      fill: textOptions.fill,
      width: 200,
      originX: 'center',
      originY: 'center',
      textAlign: 'center'
    });

    canvas.add(textbox);
    canvas.setActiveObject(textbox);
    canvas.renderAll();
    
    setTextOptions(prev => ({ ...prev, text: '' }));
  };

  const handleDeleteSelected = () => {
    if (!canvas) return;
    const activeObject = canvas.getActiveObject();
    if (activeObject && !activeObject.isBackgroundImage) {
      canvas.remove(activeObject);
      canvas.renderAll();
      
      // Remove from uploaded images list if it's a user image
      if (activeObject.isUserImage) {
        setUploadedImages(prev => prev.filter(img => img.fabricObject !== activeObject));
      }
    }
  };

  const handleClearCanvas = () => {
    if (!canvas) return;
    if (!window.confirm('Καθαρισμός όλων των σχεδίων από το canvas?')) return;
    
    const backgroundImg = canvas.getObjects().find(obj => obj.isBackgroundImage);
    canvas.clear();
    if (backgroundImg) {
      canvas.add(backgroundImg);
    }
    canvas.renderAll();
    
    // Clear uploaded images list
    setUploadedImages([]);
  };

  const handleSaveMockup = () => {
    if (!canvas || !selectedProduct || !selectedColor) return;

    const quantity = prompt('Enter quantity for this mockup:', '1');
    if (!quantity || parseInt(quantity) < 1) return;

    const designData = JSON.stringify(canvas.toJSON(['isUserImage', 'isBackgroundImage']));
    const mockupImage = canvas.toDataURL('image/png');

    const mockup = {
      id: Date.now(),
      productId: selectedProduct._id,
      productName: selectedProduct.name,
      colorName: selectedColor.colorName,
      view: currentView,
      designData,
      mockupImage,
      quantity: parseInt(quantity)
    };

    setSavedMockups(prev => [...prev, mockup]);
    setSubmitMessage(`✅ Mockup saved! (${savedMockups.length + 1} total)`);
    
    setTimeout(() => setSubmitMessage(''), 3000);
  };

  const handleDeleteMockup = (mockupId) => {
    setSavedMockups(prev => prev.filter(m => m.id !== mockupId));
  };

  const handleOrderFormChange = (e) => {
    const { name, value } = e.target;
    setOrderForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();

    if (savedMockups.length === 0) {
      setSubmitMessage('❌ Please save at least one mockup before submitting!');
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      const formData = new FormData();
      
      // Convert mockup images to blobs
      const mockupBlobs = await Promise.all(
        savedMockups.map(async (mockup) => {
          const response = await fetch(mockup.mockupImage);
          return response.blob();
        })
      );

      // Append mockup images
      mockupBlobs.forEach((blob, index) => {
        formData.append('mockupImages', blob, `mockup-${index}.png`);
      });

      // Prepare mockups data without images
      const mockupsData = savedMockups.map(({ mockupImage, id, ...rest }) => rest);
      formData.append('mockupsData', JSON.stringify(mockupsData));
      formData.append('customerEmail', orderForm.email);
      formData.append('customerPhone', orderForm.phone);
      formData.append('notes', orderForm.notes);

      const response = await fetch('/api/design-studio/orders/submit', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        setSubmitMessage(
          `✅ Η παραγγελία υποβλήθηκε επιτυχώς! Αριθμός Παραγγελίας: ${result.orderId}. ` +
          `Θα επικοινωνήσουμε μαζί σας στο ${orderForm.email} σύντομα!`
        );
        
        // Reset form
        setSavedMockups([]);
        setOrderForm({ email: '', phone: '', notes: '' });
        handleClearCanvas();
      } else {
        const error = await response.json();
        setSubmitMessage(`❌ ${error.message || 'Η υποβολή απέτυχε'}`);
      }
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitMessage('❌ Προέκυψε σφάλμα. Παρακαλώ δοκιμάστε ξανά.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="design-studio">
      <Helmet>
        <title>Design Studio - Δημιούργησε το Δικό σου Σχέδιο</title>
        <meta 
          name="description" 
          content="Δημιούργησε προσαρμοσμένα σχέδια στα προϊόντα μας. Ανεβάστε εικόνες, προσθέστε κείμενο και δημιουργήστε μοναδικά σχέδια." 
        />
      </Helmet>

      <div className="container">
        <div className="studio-header">
          <h1>🎨 Design Studio</h1>
          <p>Δημιούργησε το τέλειο σχέδιο για τα προϊόντα σου!</p>
        </div>

        <div className="studio-content">
          {/* Product Selection */}
          <section className="studio-section product-selection">
            <h2>1. Επίλεξε Προϊόν</h2>
            <div className="product-grid">
              {products.map(product => (
                <div
                  key={product._id}
                  className={`product-card ${selectedProduct?._id === product._id ? 'selected' : ''}`}
                  onClick={() => handleProductChange(product)}
                >
                  <h3>{product.name}</h3>
                  <span className="product-category">{product.category}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Color Selection */}
          {selectedProduct && (
            <section className="studio-section color-selection">
              <h2>2. Επίλεξε Χρώμα</h2>
              <div className="color-grid">
                {selectedProduct.colorVariants?.map(color => (
                  <div
                    key={color._id}
                    className={`color-card ${selectedColor?._id === color._id ? 'selected' : ''}`}
                    onClick={() => handleColorChange(color)}
                  >
                    <div 
                      className="color-swatch"
                      style={{ backgroundColor: color.colorCode }}
                    />
                    <span>{color.colorName}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* View Toggle */}
          {selectedProduct && selectedColor && (
            <section className="studio-section view-toggle">
              <h2>3. Επίλεξε Όψη</h2>
              <div className="view-buttons">
                <button
                  className={`view-btn ${currentView === 'front' ? 'active' : ''}`}
                  onClick={() => setCurrentView('front')}
                >
                  Μπροστά
                </button>
                <button
                  className={`view-btn ${currentView === 'back' ? 'active' : ''}`}
                  onClick={() => setCurrentView('back')}
                  disabled={!selectedColor.backImage}
                >
                  Πίσω {!selectedColor.backImage && '(N/A)'}
                </button>
              </div>
            </section>
          )}

          {/* Design Tools */}
          <section className="studio-section design-tools">
            <h2>4. Σχεδίασε</h2>
            
            <div className="tools-container">
              {/* Image Upload */}
              <div className="tool-group">
                <h3>📸 Ανέβασε Εικόνα</h3>
                <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
                  <input {...getInputProps()} />
                  <p>{isDragActive ? 'Άφησε εδώ...' : 'Κλικ ή σύρε εικόνα'}</p>
                </div>
                
                {uploadedImages.length > 0 && (
                  <div className="uploaded-images">
                    <h4>Ανέβηκαν ({uploadedImages.length}):</h4>
                    <div className="image-list">
                      {uploadedImages.map(img => (
                        <div key={img.id} className="image-item">
                          <img src={img.preview} alt={img.name} className="image-thumbnail" />
                          <div className="image-info">
                            <span className="image-name">{img.name}</span>
                            <span className="image-size">{(img.size / 1024).toFixed(1)} KB</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Text Tool */}
              <div className="tool-group">
                <h3>✏️ Πρόσθεσε Κείμενο</h3>
                <div className="text-controls">
                  <input
                    type="text"
                    placeholder="Το κείμενο σου..."
                    value={textOptions.text}
                    onChange={(e) => setTextOptions(prev => ({
                      ...prev,
                      text: e.target.value
                    }))}
                    className="text-input"
                  />
                  
                  <div className="text-options">
                    <select
                      value={textOptions.fontFamily}
                      onChange={(e) => setTextOptions(prev => ({
                        ...prev,
                        fontFamily: e.target.value
                      }))}
                      className="font-select"
                    >
                      {fontOptions.map(font => (
                        <option key={font} value={font}>{font}</option>
                      ))}
                    </select>

                    <input
                      type="number"
                      min="12"
                      max="120"
                      value={textOptions.fontSize}
                      onChange={(e) => setTextOptions(prev => ({
                        ...prev,
                        fontSize: parseInt(e.target.value)
                      }))}
                      className="size-input"
                    />

                    <input
                      type="color"
                      value={textOptions.fill}
                      onChange={(e) => setTextOptions(prev => ({
                        ...prev,
                        fill: e.target.value
                      }))}
                      className="color-input"
                    />
                  </div>

                  {/* Text Preview */}
                  {textOptions.text && (
                    <div className="text-preview">
                      <h4>Προεπισκόπηση:</h4>
                      <div 
                        className="preview-text"
                        style={{
                          fontFamily: textOptions.fontFamily,
                          fontSize: `${textOptions.fontSize}px`,
                          color: textOptions.fill,
                          textAlign: 'center',
                          padding: '10px',
                          border: '1px solid #e2e8f0',
                          borderRadius: '4px',
                          backgroundColor: '#f8f9fa',
                          minHeight: '40px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {textOptions.text}
                      </div>
                    </div>
                  )}

                  <button 
                    onClick={handleAddText} 
                    className="btn btn-primary"
                    disabled={!textOptions.text.trim()}
                  >
                    Προσθήκη Κειμένου
                  </button>
                </div>
              </div>

              {/* Canvas Actions */}
              <div className="tool-group">
                <h3>🛠️ Ενέργειες</h3>
                <div className="action-buttons">
                  <button onClick={handleDeleteSelected} className="btn btn-secondary">
                    Διαγραφή Επιλεγμένου
                  </button>
                  <button onClick={handleClearCanvas} className="btn btn-danger">
                    Καθαρισμός Canvas
                  </button>
                </div>
              </div>
            </div>

            {/* Canvas */}
            <div className="canvas-container">
              <canvas ref={canvasRef} />
              {canvasMessage && (
                <div className="canvas-message">
                  <p>{canvasMessage}</p>
                </div>
              )}
              <div className="canvas-instructions">
                <p>💡 Σύρε για μετακίνηση • Χρησιμοποίησε χειριστήρια για αλλαγή μεγέθους/περιστροφή</p>
              </div>
            </div>

            <button onClick={handleSaveMockup} className="btn btn-success btn-large">
              💾 Αποθήκευση Mockup
            </button>
          </section>

          {/* Saved Mockups */}
          {savedMockups.length > 0 && (
            <section className="studio-section saved-mockups">
              <h2>5. Αποθηκευμένα Mockups ({savedMockups.length})</h2>
              <div className="mockups-grid">
                {savedMockups.map(mockup => (
                  <div key={mockup.id} className="mockup-card">
                    <img src={mockup.mockupImage} alt={mockup.productName} />
                    <div className="mockup-info">
                      <p><strong>{mockup.productName}</strong></p>
                      <p>{mockup.colorName} - {mockup.view}</p>
                      <p>Ποσότητα: {mockup.quantity}</p>
                      <button
                        onClick={() => handleDeleteMockup(mockup.id)}
                        className="btn btn-danger btn-sm"
                      >
                        Διαγραφή
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Order Form */}
          <section className="studio-section order-form-section">
            <h2>6. Υποβολή Παραγγελίας</h2>
            <form onSubmit={handleSubmitOrder} className="order-form">
              <div className="form-group">
                <label>📧 Email *</label>
                <input
                  type="email"
                  name="email"
                  value={orderForm.email}
                  onChange={handleOrderFormChange}
                  required
                  className="form-input"
                  placeholder="email@example.com"
                />
              </div>

              <div className="form-group">
                <label>📱 Τηλέφωνο *</label>
                <input
                  type="tel"
                  name="phone"
                  value={orderForm.phone}
                  onChange={handleOrderFormChange}
                  required
                  pattern="[0-9\-\+\s()]{6,}"
                  className="form-input"
                  placeholder="69XXXXXXXX"
                />
              </div>

              <div className="form-group">
                <label>📝 Σημειώσεις (Προαιρετικό)</label>
                <textarea
                  name="notes"
                  value={orderForm.notes}
                  onChange={handleOrderFormChange}
                  className="form-textarea"
                  rows="4"
                  placeholder="Οποιεσδήποτε επιπλέον πληροφορίες..."
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-large"
                disabled={isSubmitting || savedMockups.length === 0}
              >
                {isSubmitting ? 'Αποστολή...' : '🚀 Υποβολή Παραγγελίας'}
              </button>

              {submitMessage && (
                <div className={`message ${submitMessage.includes('✅') ? 'success' : 'error'}`}>
                  {submitMessage}
                </div>
              )}
            </form>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TestYourIdea;
