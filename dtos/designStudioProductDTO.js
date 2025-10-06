class ColorVariantDTO {
  constructor(data) {
    this.colorName = data.colorName;
    this.colorCode = data.colorCode;
    this.frontImage = data.frontImage;
    this.backImage = data.backImage || '';
  }

  validate() {
    if (!this.colorName || typeof this.colorName !== 'string') {
      throw new Error('Color name is required');
    }
    if (!this.colorCode || typeof this.colorCode !== 'string') {
      throw new Error('Color code is required');
    }
    if (!this.frontImage || typeof this.frontImage !== 'string') {
      throw new Error('Front image is required');
    }
    return true;
  }
}

class DesignStudioProductDTO {
  constructor(data) {
    this.name = data.name;
    this.category = data.category;
    this.colorVariants = data.colorVariants || [];
    this.printableAreas = data.printableAreas || {
      front: { x: 0, y: 0, width: 300, height: 300 },
      back: { x: 0, y: 0, width: 300, height: 300 }
    };
    this.active = data.active !== undefined ? data.active : true;
    this.displayOrder = data.displayOrder || 0;
  }

  validate() {
    if (!this.name || typeof this.name !== 'string') {
      throw new Error('Product name is required');
    }
    
    const validCategories = [
      'tshirt',
      'hoodie',
      'mug',
      'phone-case',
      'tote-bag',
      'cap',
      'other'
    ];
    if (!this.category || !validCategories.includes(this.category)) {
      throw new Error('Valid product category is required');
    }

    return true;
  }
}

module.exports = { DesignStudioProductDTO, ColorVariantDTO };

