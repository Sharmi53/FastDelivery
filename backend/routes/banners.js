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

// Multer in-memory storage
const storage = multer.memoryStorage();

// Allowed image formats including animated GIFs
const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
const allowedExts = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedMimes.includes(file.mimetype) && allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file format. Only JPG, JPEG, PNG, WEBP, and animated GIF files are allowed.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

/**
 * Safely clean up Cloudinary asset if not referenced by any other banner
 */
async function safelyCleanupCloudinaryAsset(cloudinaryId, excludeBannerId = null) {
  if (!cloudinaryId) return;

  try {
    let query = 'SELECT COUNT(*) AS count FROM banners WHERE cloudinary_id = ?';
    const params = [cloudinaryId];

    if (excludeBannerId) {
      query += ' AND id != ?';
      params.push(excludeBannerId);
    }

    const [rows] = await pool.query(query, params);
    if (rows[0].count === 0) {
      // No other banner is using this media file, safe to remove
      await cloudinary.uploader.destroy(cloudinaryId);
      console.log(`[Cloudinary] Asset removed: ${cloudinaryId}`);
    }
  } catch (err) {
    console.error(`[Cloudinary Cleanup Error] Failed to destroy asset ${cloudinaryId}:`, err.message);
  }
}

// ============================================================
// 1. GET ALL ACTIVE BANNERS (Public for Customers)
// URL: GET /api/banners
// Returns maximum 5 active banners ordered by display_order
// ============================================================
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, title, description, image_url, button_text, link_url, display_order, status
       FROM banners
       WHERE status = 'active'
       ORDER BY display_order ASC, id ASC
       LIMIT 5`
    );

    res.json({
      success: true,
      count: rows.length,
      banners: rows
    });
  } catch (error) {
    console.error('GET active banners error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to load promotional banners',
      error: error.message
    });
  }
});

// ============================================================
// 2. GET ALL BANNERS (Admin Only)
// URL: GET /api/banners/admin/all
// Returns all active and inactive banners
// ============================================================
router.get(
  '/admin/all',
  authenticateToken,
  authorizeRoles('admin'),
  async (req, res) => {
    try {
      const [rows] = await pool.query(
        `SELECT id, title, description, image_url, cloudinary_id, button_text, link_url, display_order, status, created_at, updated_at
         FROM banners
         ORDER BY display_order ASC, id ASC`
      );

      res.json({
        success: true,
        count: rows.length,
        banners: rows
      });
    } catch (error) {
      console.error('GET all banners error:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to load all banners',
        error: error.message
      });
    }
  }
);

// ============================================================
// 3. UPLOAD BANNER MEDIA (Admin Only)
// URL: POST /api/banners/upload
// Supports static images and animated GIFs up to 5MB
// ============================================================
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
          message: 'No image or GIF file provided'
        });
      }

      // Upload stream to Cloudinary folder fastdelivery/banners
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'fastdelivery/banners',
          resource_type: 'image'
        },
        (uploadError, result) => {
          if (uploadError) {
            console.error('Cloudinary banner upload error:', uploadError);
            return res.status(500).json({
              success: false,
              message: 'Cloudinary banner upload failed'
            });
          }

          return res.status(200).json({
            success: true,
            message: 'Banner media uploaded successfully',
            imageUrl: result.secure_url,
            filename: result.public_id
          });
        }
      );

      uploadStream.end(req.file.buffer);
    });
  }
);

// ============================================================
// 4. BATCH REORDER BANNERS (Admin Only)
// URL: PUT /api/banners/reorder
// Accepts: { orders: [ { id: 1, display_order: 1 }, ... ] }
// ============================================================
router.put(
  '/reorder',
  authenticateToken,
  authorizeRoles('admin'),
  async (req, res) => {
    try {
      const { orders } = req.body;

      if (!Array.isArray(orders) || orders.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Orders array is required'
        });
      }

      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction();

        for (const item of orders) {
          if (item.id && typeof item.display_order === 'number') {
            await connection.query(
              'UPDATE banners SET display_order = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
              [item.display_order, item.id]
            );
          }
        }

        await connection.commit();
      } catch (txnError) {
        await connection.rollback();
        throw txnError;
      } finally {
        connection.release();
      }

      res.json({
        success: true,
        message: 'Banner display orders updated successfully'
      });
    } catch (error) {
      console.error('Reorder banners error:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to reorder banners',
        error: error.message
      });
    }
  }
);

// ============================================================
// 5. CREATE BANNER (Admin Only)
// URL: POST /api/banners
// Validates max 5 active banners limit
// ============================================================
router.post(
  '/',
  authenticateToken,
  authorizeRoles('admin'),
  async (req, res) => {
    try {
      const {
        title,
        description = '',
        image_url,
        cloudinary_id = null,
        button_text = 'Shop Now',
        link_url = '/products',
        display_order = 1,
        status = 'active'
      } = req.body;

      // Validation
      if (!title || !title.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Banner title is required'
        });
      }

      if (!image_url || !image_url.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Banner image URL is required'
        });
      }

      // Check max 5 active banners limit if creating as active
      if (status === 'active') {
        const [activeRows] = await pool.query(
          "SELECT COUNT(*) AS active_count FROM banners WHERE status = 'active'"
        );
        if (activeRows[0].active_count >= 5) {
          return res.status(400).json({
            success: false,
            message: 'Maximum 5 active banners allowed in the carousel. Please deactivate an existing banner before creating a new active one.'
          });
        }
      }

      const [result] = await pool.query(
        `INSERT INTO banners (title, description, image_url, cloudinary_id, button_text, link_url, display_order, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          title.trim(),
          description ? description.trim() : null,
          image_url.trim(),
          cloudinary_id || null,
          button_text ? button_text.trim() : 'Shop Now',
          link_url ? link_url.trim() : '/products',
          parseInt(display_order, 10) || 1,
          status === 'inactive' ? 'inactive' : 'active'
        ]
      );

      res.status(201).json({
        success: true,
        message: 'Banner created successfully',
        bannerId: result.insertId
      });
    } catch (error) {
      console.error('CREATE banner error:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to create banner',
        error: error.message
      });
    }
  }
);

// ============================================================
// 6. UPDATE BANNER (Admin Only)
// URL: PUT /api/banners/:id
// Validates max 5 active banners limit on activation
// ============================================================
router.put(
  '/:id',
  authenticateToken,
  authorizeRoles('admin'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const {
        title,
        description,
        image_url,
        cloudinary_id,
        button_text,
        link_url,
        display_order,
        status
      } = req.body;

      // Check if banner exists
      const [existing] = await pool.query('SELECT * FROM banners WHERE id = ?', [id]);
      if (existing.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Banner not found'
        });
      }

      const currentBanner = existing[0];

      if (!title || !title.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Banner title is required'
        });
      }

      const newImageUrl = image_url !== undefined ? image_url.trim() : currentBanner.image_url;
      if (!newImageUrl) {
        return res.status(400).json({
          success: false,
          message: 'Banner image URL is required'
        });
      }

      const newStatus = status !== undefined ? (status === 'inactive' ? 'inactive' : 'active') : currentBanner.status;

      // If transitioning from inactive to active, check max 5 active banners limit
      if (currentBanner.status !== 'active' && newStatus === 'active') {
        const [activeRows] = await pool.query(
          "SELECT COUNT(*) AS active_count FROM banners WHERE status = 'active' AND id != ?",
          [id]
        );
        if (activeRows[0].active_count >= 5) {
          return res.status(400).json({
            success: false,
            message: 'Maximum 5 active banners allowed in the carousel. Please deactivate an existing banner before activating this one.'
          });
        }
      }

      const newCloudinaryId = cloudinary_id !== undefined ? cloudinary_id : currentBanner.cloudinary_id;

      await pool.query(
        `UPDATE banners
         SET title = ?,
             description = ?,
             image_url = ?,
             cloudinary_id = ?,
             button_text = ?,
             link_url = ?,
             display_order = ?,
             status = ?,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [
          title.trim(),
          description !== undefined ? (description ? description.trim() : null) : currentBanner.description,
          newImageUrl,
          newCloudinaryId,
          button_text !== undefined ? (button_text ? button_text.trim() : 'Shop Now') : currentBanner.button_text,
          link_url !== undefined ? (link_url ? link_url.trim() : '/products') : currentBanner.link_url,
          display_order !== undefined ? parseInt(display_order, 10) : currentBanner.display_order,
          newStatus,
          id
        ]
      );

      // If image changed and old image had a cloudinary_id, clean it up safely
      if (currentBanner.cloudinary_id && newCloudinaryId && currentBanner.cloudinary_id !== newCloudinaryId) {
        await safelyCleanupCloudinaryAsset(currentBanner.cloudinary_id, id);
      }

      res.json({
        success: true,
        message: 'Banner updated successfully'
      });
    } catch (error) {
      console.error('UPDATE banner error:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to update banner',
        error: error.message
      });
    }
  }
);

// ============================================================
// 7. DELETE BANNER (Admin Only)
// URL: DELETE /api/banners/:id
// ============================================================
router.delete(
  '/:id',
  authenticateToken,
  authorizeRoles('admin'),
  async (req, res) => {
    try {
      const { id } = req.params;

      const [existing] = await pool.query('SELECT * FROM banners WHERE id = ?', [id]);
      if (existing.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Banner not found'
        });
      }

      const bannerToDelete = existing[0];

      const [result] = await pool.query('DELETE FROM banners WHERE id = ?', [id]);
      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: 'Banner not found'
        });
      }

      // Safe cleanup of media if applicable
      if (bannerToDelete.cloudinary_id) {
        await safelyCleanupCloudinaryAsset(bannerToDelete.cloudinary_id, id);
      }

      res.json({
        success: true,
        message: 'Banner deleted successfully'
      });
    } catch (error) {
      console.error('DELETE banner error:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to delete banner',
        error: error.message
      });
    }
  }
);

module.exports = router;
