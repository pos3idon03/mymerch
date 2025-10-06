const { DesignStudioProductDTO, ColorVariantDTO } = require('../dtos/designStudioProductDTO');
const { DesignStudioOrderDTO, MockupDTO } = require('../dtos/designStudioOrderDTO');

describe('DesignStudio DTOs', () => {
  describe('DesignStudioProductDTO', () => {
    test('should create valid product DTO', () => {
      const data = {
        name: 'Test Product',
        category: 'tshirt',
        active: true
      };

      const dto = new DesignStudioProductDTO(data);

      expect(dto.validate()).toBe(true);
      expect(dto.name).toBe('Test Product');
      expect(dto.category).toBe('tshirt');
    });

    test('should fail validation without name', () => {
      const data = {
        category: 'tshirt'
      };

      const dto = new DesignStudioProductDTO(data);

      expect(() => dto.validate()).toThrow('Product name is required');
    });

    test('should fail validation with invalid category', () => {
      const data = {
        name: 'Test Product',
        category: 'invalid'
      };

      const dto = new DesignStudioProductDTO(data);

      expect(() => dto.validate()).toThrow('Valid product category is required');
    });

    test('should set default values', () => {
      const data = {
        name: 'Test Product',
        category: 'tshirt'
      };

      const dto = new DesignStudioProductDTO(data);

      expect(dto.active).toBe(true);
      expect(dto.displayOrder).toBe(0);
      expect(dto.printableAreas).toBeDefined();
    });
  });

  describe('ColorVariantDTO', () => {
    test('should create valid color variant DTO', () => {
      const data = {
        colorName: 'Red',
        colorCode: '#ff0000',
        frontImage: '/uploads/red-front.png'
      };

      const dto = new ColorVariantDTO(data);

      expect(dto.validate()).toBe(true);
      expect(dto.colorName).toBe('Red');
      expect(dto.colorCode).toBe('#ff0000');
    });

    test('should fail validation without colorName', () => {
      const data = {
        colorCode: '#ff0000',
        frontImage: '/uploads/red-front.png'
      };

      const dto = new ColorVariantDTO(data);

      expect(() => dto.validate()).toThrow('Color name is required');
    });

    test('should fail validation without frontImage', () => {
      const data = {
        colorName: 'Red',
        colorCode: '#ff0000'
      };

      const dto = new ColorVariantDTO(data);

      expect(() => dto.validate()).toThrow('Front image is required');
    });
  });

  describe('DesignStudioOrderDTO', () => {
    test('should create valid order DTO', () => {
      const data = {
        mockups: [{
          productId: '507f1f77bcf86cd799439011',
          productName: 'Test Product',
          colorName: 'White',
          designData: '{"objects":[]}',
          mockupImage: '/uploads/mockup.png',
          quantity: 5
        }],
        customerEmail: 'test@example.com',
        customerPhone: '1234567890'
      };

      const dto = new DesignStudioOrderDTO(data);

      expect(dto.validate()).toBe(true);
      expect(dto.mockups.length).toBe(1);
      expect(dto.customerEmail).toBe('test@example.com');
    });

    test('should fail validation without mockups', () => {
      const data = {
        mockups: [],
        customerEmail: 'test@example.com',
        customerPhone: '1234567890'
      };

      const dto = new DesignStudioOrderDTO(data);

      expect(() => dto.validate()).toThrow('At least one mockup is required');
    });

    test('should fail validation with invalid email', () => {
      const data = {
        mockups: [{
          productId: '507f1f77bcf86cd799439011',
          productName: 'Test Product',
          colorName: 'White',
          designData: '{"objects":[]}',
          mockupImage: '/uploads/mockup.png',
          quantity: 5
        }],
        customerEmail: 'invalid-email',
        customerPhone: '1234567890'
      };

      const dto = new DesignStudioOrderDTO(data);

      expect(() => dto.validate()).toThrow('Valid email address is required');
    });

    test('should fail validation with invalid phone', () => {
      const data = {
        mockups: [{
          productId: '507f1f77bcf86cd799439011',
          productName: 'Test Product',
          colorName: 'White',
          designData: '{"objects":[]}',
          mockupImage: '/uploads/mockup.png',
          quantity: 5
        }],
        customerEmail: 'test@example.com',
        customerPhone: '123'
      };

      const dto = new DesignStudioOrderDTO(data);

      expect(() => dto.validate()).toThrow('Valid phone number is required');
    });
  });

  describe('MockupDTO', () => {
    test('should create valid mockup DTO', () => {
      const data = {
        productId: '507f1f77bcf86cd799439011',
        productName: 'Test Product',
        colorName: 'White',
        designData: '{"objects":[]}',
        mockupImage: '/uploads/mockup.png',
        quantity: 5
      };

      const dto = new MockupDTO(data);

      expect(dto.validate()).toBe(true);
      expect(dto.quantity).toBe(5);
    });

    test('should fail validation with quantity > 1000', () => {
      const data = {
        productId: '507f1f77bcf86cd799439011',
        productName: 'Test Product',
        colorName: 'White',
        designData: '{"objects":[]}',
        mockupImage: '/uploads/mockup.png',
        quantity: 1001
      };

      const dto = new MockupDTO(data);

      expect(() => dto.validate()).toThrow('Quantity must be between 1 and 1000');
    });

    test('should parse string quantity to integer', () => {
      const data = {
        productId: '507f1f77bcf86cd799439011',
        productName: 'Test Product',
        colorName: 'White',
        designData: '{"objects":[]}',
        mockupImage: '/uploads/mockup.png',
        quantity: '10'
      };

      const dto = new MockupDTO(data);

      expect(dto.quantity).toBe(10);
      expect(typeof dto.quantity).toBe('number');
    });
  });
});

