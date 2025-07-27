import React, { useState, useRef, useEffect } from 'react';
import { Canvas, Rect, Text, Image, Group, ActiveSelection, util } from 'fabric';
import { useDropzone } from 'react-dropzone';
import './TestYourIdea.css';
import { Helmet } from 'react-helmet';

const TestYourIdea = () => {
  const [selectedProduct, setSelectedProduct] = useState('tshirt');
  const [selectedColor, setSelectedColor] = useState('white');
  const [canvas, setCanvas] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const canvasRef = useRef(null);

  const products = [
    { 
      id: 'tshirt', 
      name: 'T-Shirt', 
      colors: ['white', 'black', 'navy', 'red', 'gray'],
      image: '/images/products/tshirt-mockup.png'
    },
    { 
      id: 'tote', 
      name: 'Tote Bag', 
      colors: ['natural', 'black', 'navy', 'red'],
      image: '/images/products/tote-mockup.png'
    },
    { 
      id: 'cap', 
      name: 'Καπέλο', 
      colors: ['black', 'navy', 'red', 'gray', 'white'],
      image: '/images/products/cap-mockup.png'
    },
    { 
      id: 'lanyard', 
      name: 'Λουράκι', 
      colors: ['black', 'navy', 'red', 'yellow', 'green'],
      image: '/images/products/lanyard-mockup.png'
    }
  ];

  const getProductImage = (productId, color) => {
    return `/images/products/${productId}-${color}-mockup.png`;
  };

  const getColorValue = (colorName) => {
    const colorMap = {
      white: '#ffffff',
      black: '#000000',
      navy: '#000080',
      red: '#ff0000',
      gray: '#808080',
      natural: '#f5f5dc',
      yellow: '#ffff00',
      green: '#008000'
    };
    return colorMap[colorName] || '#ffffff';
  };

  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file && canvas) {
      console.log('File dropped:', file.name, file.size);
      const reader = new FileReader();
      reader.onload = (e) => {
        console.log('File loaded, creating image...');
        
        // Create a new image element
        const imgElement = new window.Image();
        imgElement.onload = () => {
          console.log('Image element loaded:', imgElement.width, imgElement.height);
          
          // Create fabric image from the loaded image element
          const fabricImg = new Image(imgElement, {
            selectable: true,
            hasControls: true,
            hasBorders: true
          });
          
          // Scale image to fit canvas (smaller to fit on product)
          const canvasWidth = canvas.getWidth();
          const canvasHeight = canvas.getHeight();
          const scale = Math.min(
            (canvasWidth * 0.4) / imgElement.width,
            (canvasHeight * 0.4) / imgElement.height
          );
          
          fabricImg.scale(scale);
          fabricImg.set({
            left: (canvasWidth - fabricImg.width * scale) / 2,
            top: (canvasHeight - fabricImg.height * scale) / 2,
          });
          
          console.log('Fabric image created:', fabricImg);
          console.log('Canvas objects before adding:', canvas.getObjects().length);
          
          // Store the uploaded image and update canvas
          setUploadedImage(fabricImg);
          
          // Force canvas update
          canvas.add(fabricImg);
          canvas.renderAll();
          console.log('Canvas objects after adding:', canvas.getObjects().length);
          console.log('Image added to canvas');
          console.log('Canvas dimensions:', canvas.getWidth(), 'x', canvas.getHeight());
          console.log('Image position:', fabricImg.left, fabricImg.top);
          console.log('Image scale:', fabricImg.scaleX, fabricImg.scaleY);
          console.log('Canvas rendered successfully');
        };
        
        imgElement.onerror = (error) => {
          console.error('Error loading image:', error);
        };
        
        imgElement.src = e.target.result;
      };
      reader.readAsDataURL(file);
    } else {
      console.log('No file or canvas not ready');
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    multiple: false
  });

  useEffect(() => {
    if (canvasRef.current) {
      console.log('Initializing canvas...');
      const fabricCanvas = new Canvas(canvasRef.current, {
        width: 400,
        height: 400,
        backgroundColor: '#ffffff',
        preserveObjectStacking: true
      });
      setCanvas(fabricCanvas);
      console.log('Canvas initialized:', fabricCanvas);

      return () => {
        console.log('Disposing canvas...');
        fabricCanvas.dispose();
      };
    }
  }, []);

  // Update canvas background when product or color changes
  useEffect(() => {
    if (canvas) {
      console.log('Canvas ready, updating background...');
      updateCanvasBackground();
    }
  }, [selectedProduct, selectedColor, canvas]);

  const updateCanvasBackground = () => {
    if (!canvas) return;
    
    console.log('Updating canvas background for:', selectedProduct, selectedColor);
    console.log('Canvas objects before clearing:', canvas.getObjects().length);
    
    // Clear existing background
    canvas.clear();
    console.log('Canvas cleared');
    
    // Load product mockup as background
    const productImageUrl = getProductImage(selectedProduct, selectedColor);
    
    console.log('Trying to load:', productImageUrl);
    
    // Try to load the product mockup using a different approach
    console.log('Attempting to load product image from:', productImageUrl);
    
    // Create a test image element first to check if the file exists
    const testImg = new window.Image();
    testImg.onload = () => {
      console.log('✅ Test image loaded successfully:', testImg.width, testImg.height);
      
      // Create fabric image directly from the loaded image element
      const productImg = new Image(testImg, {
        selectable: false,
        hasControls: false,
        hasBorders: false
      });
      
      console.log('Product image created successfully:', productImg.width, productImg.height);
      
      // Scale product image to fit canvas
      const canvasWidth = canvas.getWidth();
      const canvasHeight = canvas.getHeight();
      const scale = Math.min(
        canvasWidth / productImg.width,
        canvasHeight / productImg.height
      );
      
      productImg.scale(scale);
      productImg.set({
        left: (canvasWidth - productImg.width * scale) / 2,
        top: (canvasHeight - productImg.height * scale) / 2,
        selectable: false,
        hasControls: false,
        hasBorders: false
      });
      
      // Add product as background (it will be at the back since canvas was cleared)
      canvas.add(productImg);
      console.log('Product background added, canvas objects:', canvas.getObjects().length);
      
      // If there's an uploaded image, add it back on top
      if (uploadedImage) {
        canvas.add(uploadedImage);
        console.log('Uploaded image added back, canvas objects:', canvas.getObjects().length);
      }
      
      canvas.renderAll();
      console.log('Canvas updated with product background');
    };
    
    testImg.onerror = () => {
      console.log('❌ Test image failed to load, using colored background');
      const canvasWidth = canvas.getWidth();
      const canvasHeight = canvas.getHeight();
      
      // Create a colored rectangle as background
      const backgroundRect = new Rect({
        left: 0,
        top: 0,
        width: canvasWidth,
        height: canvasHeight,
        fill: getColorValue(selectedColor),
        selectable: false,
        hasControls: false,
        hasBorders: false
      });
      
      canvas.add(backgroundRect);
      console.log('Colored background added, canvas objects:', canvas.getObjects().length);
      
      if (uploadedImage) {
        canvas.add(uploadedImage);
        console.log('Uploaded image added to colored background, canvas objects:', canvas.getObjects().length);
      }
      
      canvas.renderAll();
      console.log('Canvas updated with colored background');
    };
    
    testImg.src = productImageUrl;
  };

  const handleProductChange = (productId) => {
    setSelectedProduct(productId);
    // Reset color to first available color for new product
    const newProduct = products.find(p => p.id === productId);
    if (newProduct && newProduct.colors.length > 0) {
      setSelectedColor(newProduct.colors[0]);
    }
    // Canvas background will be updated by useEffect
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!uploadedImage) {
      setSubmitMessage('Παρακαλώ άνεψε μια εικόνα πρώτα!');
      return;
    }

    if (!email) {
      setSubmitMessage('Παρακαλώ εισήγαγε το email σου!');
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      // Convert canvas to image
      const imageData = canvas.toDataURL('image/png');
      
      // Convert base64 to blob
      const blobResponse = await fetch(imageData);
      const blob = await blobResponse.blob();
      
      const formData = new FormData();
      formData.append('productType', selectedProduct);
      formData.append('productColor', selectedColor);
      formData.append('quantity', quantity);
      formData.append('email', email);
      formData.append('designImage', blob, 'design.png');

      const response = await fetch('/api/test-your-idea/submit', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        setSubmitMessage(`✅ Η παραγγελία υποβλήθηκε επιτυχώς! Αριθμός Παραγγελίας: ${result.orderId}. Θα επικοινωνήσουμε μαζί σου στο ${email} σύντομα!`);
        setQuantity(1);
        setEmail('');
        if (canvas) {
          canvas.clear();
          canvas.renderAll();
        }
        setUploadedImage(null);
      } else {
        const error = await response.json();
        setSubmitMessage(`❌ ${error.message || 'Η υποβολή της παραγγελίας απέτυχε'}`);
      }
    } catch (error) {
      setSubmitMessage('Προέκυψε ένα σφάλμα. Παρακαλώ δοκίμασε ξανά.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="test-your-idea">
      <Helmet>
        <title>Δοκίμασε την Ιδέα σου - Εργαλείο Προσαρμοσμένου Σχεδιασμού</title>
        <meta name="description" content="Δημιούργησε και δοκίμασε τα προσαρμοσμένα σου σχέδια στα προϊόντα μας. Ανεβάζοντας την εικόνα σου, δες πώς φαίνεται σε μπλούζες, τσάντες, καπέλα και λουράκια." />
      </Helmet>

      <div className="container">
        <div className="header">
          <h1>🎨 Δοκίμασε την Ιδέα σου!</h1>
          <p>Άνεβασε την εικόνα σου και δες πώς φαίνεται στα προϊόντα μας! Προσαρμόζοντας το μέγεθος και τη θέση, δημιούργησε το τέλειο σου σχέδιο! ✨</p>
        </div>

        <div className="main-content">
          {/* Product Selection */}
          <div className="product-selection">
            <h2>🎯 Επίλεξε το Προϊόν σου!</h2>
            <div className="product-grid">
              {products.map((product) => (
                <div
                  key={product.id}
                  className={`product-card ${selectedProduct === product.id ? 'selected' : ''}`}
                  onClick={() => handleProductChange(product.id)}
                >
                  <div className="product-icon">
                    {product.id === 'tshirt' && '👕'}
                    {product.id === 'tote' && '👜'}
                    {product.id === 'cap' && '🧢'}
                    {product.id === 'lanyard' && '🎗️'}
                  </div>
                  <h3 className="product-name">
                    {product.id === 'tshirt' && 'Μπλούζα'}
                    {product.id === 'tote' && 'Τσάντα'}
                    {product.id === 'cap' && 'Καπέλο'}
                    {product.id === 'lanyard' && 'Λουράκι'}
                  </h3>
                </div>
              ))}
            </div>
            
            {/* Color Selection */}
            <div className="color-selection">
              <h3>🎨 Επίλεξε Χρώμα</h3>
              <div className="color-grid">
                {products.find(p => p.id === selectedProduct)?.colors.map((color) => (
                  <div
                    key={color}
                    className={`color-option ${selectedColor === color ? 'selected' : ''}`}
                    onClick={() => setSelectedColor(color)}
                    style={{ backgroundColor: getColorValue(color) }}
                    title={color === 'white' ? 'Λευκό' : 
                           color === 'black' ? 'Μαύρο' : 
                           color === 'navy' ? 'Μπλε' : 
                           color === 'red' ? 'Κόκκινο' : 
                           color === 'gray' ? 'Γκρι' : 
                           color === 'natural' ? 'Φυσικό' : 
                           color === 'yellow' ? 'Κίτρινο' : 
                           color === 'green' ? 'Πράσινο' : 
                           color.charAt(0).toUpperCase() + color.slice(1)}
                  >
                    <span className="color-name">
                      {color === 'white' ? 'Λευκό' : 
                       color === 'black' ? 'Μαύρο' : 
                       color === 'navy' ? 'Μπλε' : 
                       color === 'red' ? 'Κόκκινο' : 
                       color === 'gray' ? 'Γκρι' : 
                       color === 'natural' ? 'Φυσικό' : 
                       color === 'yellow' ? 'Κίτρινο' : 
                       color === 'green' ? 'Πράσινο' : 
                       color}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="design-section">
            {/* Image Upload */}
            <div className="upload-section">
              <h2>📸 Ανεβάσε την Εικόνα σου!</h2>
              <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
                <input {...getInputProps()} />
                {isDragActive ? (
                  <p>Άφησε την εικόνα σου εδώ...</p>
                ) : (
                  <div className="upload-content">
                    <div className="upload-icon">📁</div>
                    <p>Σύρε την εικόνα σου εδώ, ή κάνε κλικ για να την επιλέξεις!</p>
                    <small>Υποστηρίζει: JPG, PNG, GIF (Μέγιστο 5MB)</small>
                  </div>
                )}
              </div>
            </div>

            {/* Design Canvas */}
            <div className="canvas-section">
              <h2>👀 Προεπισκόπηση Σχεδίου</h2>
              <div className="canvas-container">
                <canvas ref={canvasRef} />
                <div className="canvas-instructions">
                  {uploadedImage ? (
                    <p className="success-text">✅ Η εικόνα ανέβηκε επιτυχώς! Σύρε για να την αναδιατάξεις • Χρησιμοποίησε τα χειριστήρια για να αλλάξεις μέγεθος</p>
                  ) : (
                    <p>Άνεβασε μια εικόνα για να τη δεις εδώ • Σύρε για να την αναδιατάξεις • Χρησιμοποίησε τα χειριστήρια για να αλλάξεις μέγεθος</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Order Form */}
          <div className="order-section">
            <h2>🛒 Κάνε την Παραγγελία σου!</h2>
            <form onSubmit={handleSubmit} className="order-form">
              <div className="form-group">
                <label htmlFor="quantity">📦 Ποσότητα:</label>
                <input
                  type="number"
                  id="quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  min="1"
                  max="100"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">📧 Email:</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="το@email.σου"
                  required
                />
              </div>

              <button 
                type="submit" 
                className="submit-btn"
                disabled={isSubmitting || !uploadedImage}
              >
                {isSubmitting ? 'Αποστέλλεται...' : '🚀 Υποβολή Παραγγελίας!'}
              </button>

              {submitMessage && (
                <div className={`message ${submitMessage.includes('successfully') ? 'success' : 'error'}`}>
                  {submitMessage}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestYourIdea; 