const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const designStudioProductFeatures = require('../features/designStudioProductFeatures');
const designStudioProductDAL = require('../dal/designStudioProductDAL');
const { DesignStudioProductDTO, ColorVariantDTO } = require('../dtos/designStudioProductDTO');
const auth = require('../middleware/auth');

const router = express.Router();

const PUBLIC_UPLOADS_URL_PATH = '/uploads/prod';
const STUDIO_SUBDIR = 'designStudio';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = '/app/uploads/prod/designStudio';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'studio-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

router.get('/', async (req, res) => {
  try {
    const activeOnly = req.query.activeOnly === 'true';
    const products = await designStudioProductFeatures.fetchAllProducts(
      activeOnly
    );
    res.json(products);
  } catch (error) {
    console.error('Error fetching design studio products:', error);
    res.status(500).json({ message: 'Error fetching products' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const product = await designStudioProductFeatures.fetchProductDetails(
      req.params.id
    );
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    const status = error.message === 'Product not found' ? 404 : 500;
    res.status(status).json({ message: error.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const productDTO = new DesignStudioProductDTO(req.body);
    productDTO.validate();
    
    const product = await designStudioProductFeatures.addNewProduct(
      productDTO
    );
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const product = await designStudioProductFeatures.modifyProduct(
      req.params.id,
      req.body
    );
    res.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    const status = error.message === 'Product not found' ? 404 : 400;
    res.status(status).json({ message: error.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await designStudioProductFeatures.removeProduct(req.params.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    const status = error.message === 'Product not found' ? 404 : 500;
    res.status(status).json({ message: error.message });
  }
});

router.post(
  '/:id/color-variants',
  auth,
  upload.fields([
    { name: 'frontImage', maxCount: 1 },
    { name: 'backImage', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const { colorName, colorCode } = req.body;
      
      if (!req.files || !req.files.frontImage) {
        return res.status(400).json({
          message: 'Front image is required'
        });
      }

      const frontImagePath = path
        .join(PUBLIC_UPLOADS_URL_PATH, STUDIO_SUBDIR, req.files.frontImage[0].filename)
        .replace(/\\/g, '/');
      
      const backImagePath = req.files.backImage
        ? path.join(PUBLIC_UPLOADS_URL_PATH, STUDIO_SUBDIR, req.files.backImage[0].filename).replace(/\\/g, '/')
        : '';

      const variantDTO = new ColorVariantDTO({
        colorName,
        colorCode,
        frontImage: frontImagePath,
        backImage: backImagePath
      });
      
      variantDTO.validate();

      const product = await designStudioProductDAL.addColorVariant(
        req.params.id,
        variantDTO
      );

      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      res.status(201).json(product);
    } catch (error) {
      console.error('Error adding color variant:', error);
      res.status(400).json({ message: error.message });
    }
  }
);

router.delete(
  '/:id/color-variants/:variantId',
  auth,
  async (req, res) => {
    try {
      const product = await designStudioProductDAL.deleteColorVariant(
        req.params.id,
        req.params.variantId
      );

      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      res.json(product);
    } catch (error) {
      console.error('Error deleting color variant:', error);
      res.status(500).json({ message: error.message });
    }
  }
);

module.exports = router;

