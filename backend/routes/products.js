/**
 * products route - Step 2
 * Reads directly from MySQL via the shared connection pool.
 * Supports optional ?category=<name> and ?search=<term> query params.
 */

const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const { pool } = require('../config/db');

const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer storage configuration
const storage = multer.memoryStorage();

// File validation: allow only JPG, JPEG, PNG, WEBP
const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const allowedExts = ['.jpg', '.jpeg', '.png', '.webp'];

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedMimes.includes(file.mimetype) && allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file format. Only JPG, JPEG, PNG, and WEBP images are allowed.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// POST /api/products/upload
// Handles product image file upload via multipart/form-data
router.post('/upload', (req, res) => {
  upload.single('image')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File size exceeds the 5MB limit'
        });
      }

      return res.status(400).json({
        success: false,
        message: `Upload error: ${err.message}`
      });
    }

    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || 'Failed to upload image'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'fastdelivery/products',
        resource_type: 'image'
      },
      (uploadError, result) => {
        if (uploadError) {
          console.error('Cloudinary upload error:', uploadError);

          return res.status(500).json({
            success: false,
            message: 'Cloudinary upload failed'
          });
        }

        return res.status(200).json({
          success: true,
          message: 'Image uploaded successfully',
          imageUrl: result.secure_url,
          filename: result.public_id
        });
      }
    );

    uploadStream.end(req.file.buffer);
  });
});

// POST /api/products
// Creates a new product in MySQL
router.post('/', async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      category_id,
      price,
      original_price,
      unit,
      stock,
      stock_quantity,
      image,
      status
    } = req.body;

    // Basic validation
    if (
      !name ||
      price === undefined ||
      (stock === undefined && stock_quantity === undefined) ||
      (!category && !category_id)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Name, category, price and stock quantity are required'
      });
    }

    let finalCategoryId = category_id;

    // If frontend sends category name, find its ID
    if (!finalCategoryId && category) {
      const [categoryRows] = await pool.query(
        'SELECT id FROM categories WHERE name = ? LIMIT 1',
        [category]
      );

      if (categoryRows.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Category not found'
        });
      }

      finalCategoryId = categoryRows[0].id;
    }

    const finalStockQuantity =
      stock_quantity !== undefined
        ? Number(stock_quantity)
        : Number(stock);

    const finalOriginalPrice =
      original_price !== undefined && original_price !== ''
        ? Number(original_price)
        : Number(price);

    const finalStatus = status || 'active';

    const [result] = await pool.query(
      `INSERT INTO products
      (
        category_id,
        name,
        description,
        image,
        price,
        original_price,
        unit,
        stock_quantity,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        finalCategoryId,
        name,
        description || '',
        image || '',
        Number(price),
        finalOriginalPrice,
        unit || 'piece',
        finalStockQuantity,
        finalStatus
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product: {
        id: result.insertId,
        category_id: finalCategoryId,
        name,
        description: description || '',
        image: image || '',
        price: Number(price),
        original_price: finalOriginalPrice,
        unit: unit || 'piece',
        stock_quantity: finalStockQuantity,
        status: finalStatus
      }
    });

  } catch (err) {
    console.error('[POST /api/products] DB error:', err.message);

    res.status(500).json({
      success: false,
      message: 'Failed to create product',
      error: err.message
    });
  }
});
// PUT /api/products/:id
// Updates an existing product in MySQL
router.put('/:id', async (req, res) => {
  try {
    const productId = req.params.id;

    const {
      name,
      description,
      category,
      category_id,
      price,
      original_price,
      unit,
      stock,
      stock_quantity,
      image,
      status
    } = req.body;

    // Basic validation
    if (
      !name ||
      price === undefined ||
      (stock === undefined && stock_quantity === undefined) ||
      (!category && !category_id)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Name, category, price and stock quantity are required'
      });
    }

    let finalCategoryId = category_id;

    // If frontend sends category name, find its ID
    if (!finalCategoryId && category) {
      const [categoryRows] = await pool.query(
        'SELECT id FROM categories WHERE name = ? LIMIT 1',
        [category]
      );

      if (categoryRows.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Category not found'
        });
      }

      finalCategoryId = categoryRows[0].id;
    }

    const finalStockQuantity =
      stock_quantity !== undefined
        ? Number(stock_quantity)
        : Number(stock);

    const finalOriginalPrice =
      original_price !== undefined && original_price !== ''
        ? Number(original_price)
        : Number(price);

    const finalStatus = status || 'active';

    const [result] = await pool.query(
      `UPDATE products
       SET
         category_id = ?,
         name = ?,
         description = ?,
         image = ?,
         price = ?,
         original_price = ?,
         unit = ?,
         stock_quantity = ?,
         status = ?,
         updated_at = NOW()
       WHERE id = ?`,
      [
        finalCategoryId,
        name,
        description || '',
        image || '',
        Number(price),
        finalOriginalPrice,
        unit || 'piece',
        finalStockQuantity,
        finalStatus,
        productId
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product updated successfully'
    });

  } catch (err) {
    console.error('[PUT /api/products/:id] DB error:', err.message);

    res.status(500).json({
      success: false,
      message: 'Failed to update product',
      error: err.message
    });
  }
});
// GET /api/products
// Returns active products from MySQL with optional filters.
router.get('/', async (req, res) => {
  try {
    const { category, search, category_id } = req.query;

    // Build a dynamic WHERE clause safely using parameterised queries
    let sql = `
      SELECT
        p.*,
        c.name AS category_name
      FROM   products p
      JOIN   categories c ON c.id = p.category_id
      WHERE  p.status != 'inactive'
    `;
    const params = [];

    if (category_id) {
      sql += ' AND p.category_id = ?';
      params.push(parseInt(category_id, 10));
    } else if (category) {
      sql += ' AND c.name = ?';
      params.push(category);
    }

    if (search) {
      sql += ' AND p.name LIKE ?';
      params.push(`%${search}%`);
    }

    sql += ' ORDER BY p.id ASC';

    const [rows] = await pool.query(sql, params);

    res.json({
      success: true,
      source: 'mysql',
      count: rows.length,
      products: rows
    });
  } catch (err) {
    console.error('[GET /api/products] DB error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Database error — make sure MySQL is running and grocery_app DB is initialised.',
      error: err.message
    });
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, c.name AS category_name
       FROM   products p
       JOIN   categories c ON c.id = p.category_id
       WHERE  p.id = ?`,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, source: 'mysql', product: rows[0] });
  } catch (err) {
    console.error('[GET /api/products/:id] DB error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Database error.',
      error: err.message
    });
  }
});
// DELETE /api/products/:id
// Permanently deletes a product from the database.
// - cart_items referencing this product are auto-deleted (ON DELETE CASCADE).
// - order_items referencing this product have product_id set to NULL (ON DELETE SET NULL),
//   preserving historical order records (product_name and price snapshots are kept).
// - If the product image is a locally uploaded file in /uploads/, it is also deleted from disk.
router.delete('/:id', async (req, res) => {
  try {
    const productId = req.params.id;

    // Fetch the product first so we can clean up its image file if needed
    const [rows] = await pool.query(
      'SELECT image FROM products WHERE id = ?',
      [productId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const imageValue = rows[0].image || '';

    // Permanently delete the product row.
    // FK constraints handle related tables automatically:
    //   - cart_items: ON DELETE CASCADE → removed automatically
    //   - order_items: ON DELETE SET NULL → product_id becomes NULL, history preserved
    const [result] = await pool.query(
      'DELETE FROM products WHERE id = ?',
      [productId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    
    res.json({
      success: true,
      message: 'Product permanently deleted successfully'
    });

  } catch (err) {
    console.error('[DELETE /api/products/:id] DB error:', err.message);

    res.status(500).json({
      success: false,
      message: 'Failed to delete product',
      error: err.message
    });
  }
});

module.exports = router;
