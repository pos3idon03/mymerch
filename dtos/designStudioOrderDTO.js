class MockupDTO {
  constructor(data) {
    this.productId = data.productId;
    this.productName = data.productName;
    this.colorName = data.colorName;
    this.view = data.view || 'front';
    this.designData = data.designData;
    this.mockupImage = data.mockupImage;
    this.quantity = parseInt(data.quantity) || 1;
  }

  validate() {
    if (!this.productId) {
      throw new Error('Product ID is required');
    }
    if (!this.productName) {
      throw new Error('Product name is required');
    }
    if (!this.colorName) {
      throw new Error('Color name is required');
    }
    if (!this.designData) {
      throw new Error('Design data is required');
    }
    if (!this.mockupImage) {
      throw new Error('Mockup image is required');
    }
    if (this.quantity < 1 || this.quantity > 1000) {
      throw new Error('Quantity must be between 1 and 1000');
    }
    return true;
  }
}

class DesignStudioOrderDTO {
  constructor(data) {
    this.mockups = (data.mockups || []).map(m => new MockupDTO(m));
    this.customerEmail = data.customerEmail;
    this.customerPhone = data.customerPhone;
    this.notes = data.notes || '';
  }

  validate() {
    if (!this.mockups || this.mockups.length === 0) {
      throw new Error('At least one mockup is required');
    }

    this.mockups.forEach(mockup => mockup.validate());

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!this.customerEmail || !emailRegex.test(this.customerEmail)) {
      throw new Error('Valid email address is required');
    }

    const phoneRegex = /^[0-9\-\+\s()]{6,}$/;
    if (!this.customerPhone || !phoneRegex.test(this.customerPhone)) {
      throw new Error('Valid phone number is required');
    }

    return true;
  }
}

module.exports = { DesignStudioOrderDTO, MockupDTO };

