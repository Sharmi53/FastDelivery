const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');

const { pool } = require('../config/db');
const {
  authenticateToken,
  authorizeRoles
} = require('../middleware/authMiddleware');

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


// ======================================================
// GET ALL ACTIVE CATEGORIES
// URL: GET /api/categories
// Public route
// ======================================================

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT *
       FROM categories
       WHERE status = ?
       ORDER BY id ASC`,
      ['active']
    );

    res.json({
      success: true,
      source: 'mysql',
      count: rows.length,
      categories: rows
    });

  } catch (error) {
    console.error('GET categories error:', error.message);

    res.status(500).json({
      success: false,
      message: 'Failed to load categories',
      error: error.message
    });
  }
});


// ======================================================
// GET ALL CATEGORIES INCLUDING INACTIVE
// URL: GET /api/categories/all
// Admin only
// ======================================================

router.get(
  '/all',
  authenticateToken,
  authorizeRoles('admin'),
  async (req, res) => {
    try {
      const [rows] = await pool.query(
        `SELECT *
         FROM categories
         ORDER BY id ASC`
      );

      res.json({
        success: true,
        count: rows.length,
        categories: rows
      });

    } catch (error) {
      console.error('GET all categories error:', error.message);

      res.status(500).json({
        success: false,
        message: 'Failed to load all categories',
        error: error.message
      });
    }
  }
);


// ======================================================
// UPLOAD CATEGORY IMAGE
// URL: POST /api/categories/upload
// Admin only
// ======================================================

router.post(
  '/upload',
  authenticateToken,
  authorizeRoles('admin'),
  (req, res) => {
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
          folder: 'fastdelivery/categories',
          resource_type: 'image'
        },
        (uploadError, result) => {
          if (uploadError) {
            console.error('Cloudinary category upload error:', uploadError);

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
  }
);


// ======================================================
// CREATE CATEGORY
// URL: POST /api/categories
// Admin only
// ======================================================

router.post(
  '/',
  authenticateToken,
  authorizeRoles('admin'),
  async (req, res) => {
    try {
      const {
        name,
        description = '',
        image = ''
      } = req.body;

      if (!name || name.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Category name is required'
        });
      }

      const [result] = await pool.query(
        `INSERT INTO categories
         (name, description, image, status)
         VALUES (?, ?, ?, ?)`,
        [
          name.trim(),
          description,
          image,
          'active'
        ]
      );

      const [rows] = await pool.query(
        `SELECT *
         FROM categories
         WHERE id = ?`,
        [result.insertId]
      );

      res.status(201).json({
        success: true,
        message: 'Category created successfully',
        category: rows[0]
      });

    } catch (error) {
      console.error('POST category error:', error.message);

      res.status(500).json({
        success: false,
        message: 'Failed to create category',
        error: error.message
      });
    }
  }
);


// ======================================================
// UPDATE CATEGORY
// URL: PUT /api/categories/:id
// Admin only
// ======================================================

router.put(
  '/:id',
  authenticateToken,
  authorizeRoles('admin'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const {
        name,
        description = '',
        image = '',
        status = 'active'
      } = req.body;

      if (!name || name.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Category name is required'
        });
      }

      const [result] = await pool.query(
        `UPDATE categories
         SET name = ?,
             description = ?,
             image = ?,
             status = ?,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [
          name.trim(),
          description,
          image,
          status,
          id
        ]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }

      const [rows] = await pool.query(
        `SELECT *
         FROM categories
         WHERE id = ?`,
        [id]
      );

      res.json({
        success: true,
        message: 'Category updated successfully',
        category: rows[0]
      });

    } catch (error) {
      console.error('PUT category error:', error.message);

      res.status(500).json({
        success: false,
        message: 'Failed to update category',
        error: error.message
      });
    }
  }
);


// ======================================================
// DELETE CATEGORY
// URL: DELETE /api/categories/:id
// Admin only
// ======================================================
// PERMANENTLY DELETE CATEGORY
// URL: DELETE /api/categories/:id/permanent
// Admin only
// Deletes only if no products use this category
// ======================================================

router.delete(
  '/:id/permanent',
  authenticateToken,
  authorizeRoles('admin'),
  async (req, res) => {
    try {
      const { id } = req.params;

      // Check whether any products are connected to this category
      const [products] = await pool.query(
        `SELECT COUNT(*) AS product_count
         FROM products
         WHERE category_id = ?`,
        [id]
      );

      const productCount = products[0].product_count;

      if (productCount > 0) {
        return res.status(400).json({
          success: false,
          message: `This category cannot be permanently deleted because ${productCount} product(s) are connected to it. Deactivate it instead.`
        });
      }

      // Check whether the category exists
      const [category] = await pool.query(
        `SELECT id
         FROM categories
         WHERE id = ?`,
        [id]
      );

      if (category.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }

      // Permanently delete the category
      const [result] = await pool.query(
        `DELETE FROM categories
         WHERE id = ?`,
        [id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }

      res.json({
        success: true,
        message: 'Category permanently deleted successfully'
      });

    } catch (error) {
      console.error(
        'PERMANENT DELETE category error:',
        error.message
      );

      res.status(500).json({
        success: false,
        message: 'Failed to permanently delete category',
        error: error.message
      });
    }
  }
);
// Soft delete: changes status to inactive
// ======================================================

router.delete(
  '/:id',
  authenticateToken,
  authorizeRoles('admin'),
  async (req, res) => {
    try {
      const { id } = req.params;

      const [result] = await pool.query(
        `UPDATE categories
         SET status = 'inactive',
             updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }

      res.json({
        success: true,
        message: 'Category deleted successfully'
      });

    } catch (error) {
      console.error('DELETE category error:', error.message);

      res.status(500).json({
        success: false,
        message: 'Failed to delete category',
        error: error.message
      });
    }
  }
);


module.exports = router;