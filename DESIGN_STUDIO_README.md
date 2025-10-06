# Interactive Product Printing Design Studio

## Overview

The Design Studio is a comprehensive system that allows users to create custom designs on various products and submit orders for printing. It replaces the previous TestYourIdea functionality with a much more powerful and feature-rich design tool.

## Features

### User-Facing Features

1. **Product Selection**
   - Choose from various product types (T-shirts, hoodies, mugs, phone cases, tote bags, caps, etc.)
   - Each product can have multiple color variants

2. **Color Selection**
   - Select from available colors for each product
   - Each color has its own mockup image (front and back views)

3. **View Toggle**
   - Switch between front and back views of the product
   - Design on different sides independently

4. **Advanced Design Tools**
   - **Image Upload**: Drag and drop or click to upload custom images
   - **Image Manipulation**: Resize, rotate, and position images on the product
   - **Text Layering**: Add custom text with:
     - 10 different font families
     - Adjustable font size (12-120px)
     - Custom text color
     - Drag and rotate text elements

5. **Multiple Mockup Management**
   - Save multiple designs before submitting an order
   - Each mockup can have its own quantity
   - Preview all saved mockups before submission

6. **Order Submission**
   - Submit multiple mockups in a single order
   - Provide email and phone for contact
   - Add optional notes

### Admin Features

1. **Product Management**
   - Create/Edit/Delete design studio products
   - Set product category, display order, and active status
   - Manage printable areas for each product

2. **Color Variant Management**
   - Add multiple color variants to each product
   - Upload front and back mockup images for each color
   - Delete color variants

3. **Order Management**
   - View all submitted orders
   - See detailed mockup information
   - Update order status through workflow:
     - Submitted → In Review → Quoted → Approved → In Production → Completed
   - Cancel orders if needed

## Architecture

### Backend

The backend follows a layered architecture as per the project requirements:

#### Models
- **DesignStudioProduct**: Stores product information with color variants
- **DesignStudioOrder**: Stores customer orders with multiple mockups

#### Data Access Layer (DAL)
- `designStudioProductDAL.js`: Database operations for products
- `designStudioOrderDAL.js`: Database operations for orders

#### Features (Business Logic)
- `designStudioProductFeatures.js`: Product management logic
- `designStudioOrderFeatures.js`: Order processing and validation logic

#### DTOs (Data Transfer Objects)
- `designStudioProductDTO.js`: Validation for product data
- `designStudioOrderDTO.js`: Validation for order data

#### Routes
- `/api/design-studio/products`: Product CRUD operations
- `/api/design-studio/orders`: Order submission and management

### Frontend

#### User Interface
- **TestYourIdea.js**: Main design studio interface
- **TestYourIdea.css**: Responsive styling matching Home.css aesthetics

#### Admin Interface
- **DesignStudio.js**: Admin panel for managing products and orders

## API Endpoints

### Products

#### GET `/api/design-studio/products`
Get all design studio products
- Query params: `activeOnly=true` (optional)
- Response: Array of products

#### GET `/api/design-studio/products/:id`
Get a specific product by ID
- Response: Product object

#### POST `/api/design-studio/products` (Auth required)
Create a new product
- Body: `{ name, category, active, displayOrder }`
- Response: Created product

#### PUT `/api/design-studio/products/:id` (Auth required)
Update a product
- Body: Product fields to update
- Response: Updated product

#### DELETE `/api/design-studio/products/:id` (Auth required)
Delete a product
- Response: Success message

#### POST `/api/design-studio/products/:id/color-variants` (Auth required)
Add a color variant to a product
- Body: `FormData` with colorName, colorCode, frontImage, backImage (optional)
- Response: Updated product with new variant

#### DELETE `/api/design-studio/products/:id/color-variants/:variantId` (Auth required)
Delete a color variant
- Response: Updated product

### Orders

#### POST `/api/design-studio/orders/submit`
Submit a new order
- Body: `FormData` with:
  - `mockupsData`: JSON string of mockup array
  - `mockupImages`: File array of mockup images
  - `customerEmail`: Customer email
  - `customerPhone`: Customer phone
  - `notes`: Optional notes
- Response: Created order with orderId

#### GET `/api/design-studio/orders` (Auth required)
Get all orders
- Query params: `status` (optional)
- Response: Array of orders

#### GET `/api/design-studio/orders/:id` (Auth required)
Get a specific order
- Response: Order object with populated product data

#### PATCH `/api/design-studio/orders/:id/status` (Auth required)
Update order status
- Body: `{ status }`
- Response: Updated order

## Database Schema

### DesignStudioProduct

```javascript
{
  name: String (required, unique),
  category: String (enum: tshirt, hoodie, mug, phone-case, tote-bag, cap, other),
  colorVariants: [{
    colorName: String,
    colorCode: String,
    frontImage: String,
    backImage: String
  }],
  printableAreas: {
    front: { x, y, width, height },
    back: { x, y, width, height }
  },
  active: Boolean (default: true),
  displayOrder: Number (default: 0),
  createdAt: Date,
  updatedAt: Date
}
```

### DesignStudioOrder

```javascript
{
  mockups: [{
    productId: ObjectId (ref: DesignStudioProduct),
    productName: String,
    colorName: String,
    view: String (enum: front, back),
    designData: String (JSON),
    mockupImage: String,
    quantity: Number
  }],
  customerEmail: String (required),
  customerPhone: String (required),
  totalQuantity: Number,
  orderStatus: String (enum: Submitted, In Review, Quoted, Approved, In Production, Completed, Cancelled),
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

## File Upload Structure

Design Studio files are stored in:
- Products: `/uploads/prod/designStudio/`
- Orders: `/uploads/prod/designStudioOrders/`

## Testing

Comprehensive tests are included for:
- Model validation
- DAL operations
- Feature business logic
- DTO validation

Run tests with:
```bash
npm test tests/designStudio*.test.js
```

## Setup Instructions

1. **Backend**: The routes are already registered in `server.js`
2. **Frontend**: The component is already integrated into `App.js`
3. **Admin Panel**: Accessible via `/admin/design-studio`
4. **User Interface**: Accessible via `/test-your-idea`

## Security

- All admin endpoints require authentication via JWT token
- File uploads are validated for type and size
- Input validation through DTOs
- SQL injection protection through Mongoose
- XSS protection through React

## Performance Considerations

- Images are loaded asynchronously
- Canvas rendering is optimized with fabric.js
- Database queries use indexes on frequently queried fields
- File uploads have size limits (5-15MB depending on endpoint)

## Best Practices Followed

✅ Separation of concerns (Routes → Features → DAL → Models)
✅ Function complexity kept under 15 McCabe Complexity
✅ Functions under 60 lines of code
✅ DTOs and internal data models for all APIs
✅ Comprehensive test coverage
✅ No hardcoded credentials (environment variables)
✅ Consistent error handling
✅ Responsive design for mobile and desktop

## Future Enhancements

Potential improvements:
- Image cropping tool
- Predefined design templates
- Design history/versioning
- Bulk order discounts
- Real-time collaboration
- AI-powered design suggestions

## Support

For issues or questions, contact the development team or check the main project README.

