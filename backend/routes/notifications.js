const express = require('express');
const router = express.Router();

const { pool } = require('../config/db');
const {
  authenticateToken,
  authorizeRoles
} = require('../middleware/authMiddleware');

// =====================================
// GET CUSTOMER NOTIFICATIONS
// =====================================
router.get(
  '/',
  authenticateToken,
  authorizeRoles('customer'),
  async (req, res) => {
    try {
      const userId = req.user.id;
      // Delete notifications older than 1 day
      await pool.query(
        `
  DELETE FROM notifications
  WHERE user_id = ?
    AND created_at < NOW() - INTERVAL 1 DAY
  `,
        [userId]
      );

      const [notifications] = await pool.query(
        `
        SELECT
          id,
          order_id,
          title,
          message,
          type,
          is_read,
          created_at
        FROM notifications
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT 50
        `,
        [userId]
      );

      res.json({
        success: true,
        notifications
      });
    } catch (error) {
      console.error('Get notifications error:', error);

      res.status(500).json({
        success: false,
        message: 'Failed to fetch notifications.'
      });
    }
  }
);

// =====================================
// MARK NOTIFICATION AS READ
// =====================================
router.put(
  '/:id/read',
  authenticateToken,
  authorizeRoles('customer'),
  async (req, res) => {
    try {
      const userId = req.user.id;
      const notificationId = req.params.id;

      const [result] = await pool.query(
        `
        UPDATE notifications
        SET is_read = 1
        WHERE id = ?
          AND user_id = ?
        `,
        [notificationId, userId]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found.'
        });
      }

      res.json({
        success: true,
        message: 'Notification marked as read.'
      });
    } catch (error) {
      console.error('Mark notification read error:', error);

      res.status(500).json({
        success: false,
        message: 'Failed to update notification.'
      });
    }
  }
);

module.exports = router;
