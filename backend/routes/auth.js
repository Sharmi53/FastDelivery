const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');
const {
  authenticateToken,
  authorizeRoles
} = require('../middleware/authMiddleware');

const router = express.Router();



// =============================
// REGISTER CUSTOMER
// =============================
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Check required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email and password are required'
      });
    }

    // Check if email already exists
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create customer
    const [result] = await pool.execute(
      `INSERT INTO users (name, email, password, phone, role)
       VALUES (?, ?, ?, ?, 'customer')`,
      [name, email, hashedPassword, phone || null]
    );

    // Get created user
    const [users] = await pool.execute(
      `SELECT id, name, email, phone, role
       FROM users
       WHERE id = ?`,
      [result.insertId]
    );

    const user = users[0];

    // Create JWT token
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '7d'
      }
    );

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user
    });

  } catch (error) {
    console.error('Registration error:', error);

    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});


// =============================
// LOGIN
// =============================
router.post('/login', async (req, res) => {
  try {
    const { email, phone, password, role } = req.body;

    // Check required fields
    if ((!email && !phone) || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user
    let users;

    if (role === 'delivery_partner' && phone) {
      [users] = await pool.execute(
        `SELECT id, name, email, password, phone, role
     FROM users
     WHERE phone = ?`,
        [phone]
      );
    } else {
      [users] = await pool.execute(
        `SELECT id, name, email, password, phone, role
     FROM users
     WHERE email = ?`,
        [email]
      );
    }

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const user = users[0];

    // Check selected role
    if (role && user.role !== role) {
      return res.status(403).json({
        success: false,
        message: `This account is not registered as ${role}`
      });
    }

    // Compare password
    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Create JWT token
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '7d'
      }
    );

    // Never send password to frontend
    delete user.password;

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user
    });

  } catch (error) {
    console.error('Login error:', error);

    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});


// =============================
// PROFILE
// =============================
router.get('/profile', async (req, res) => {
  res.json({
    success: true,
    message: 'Profile route will be protected with JWT middleware in the next step'
  });
});
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const [users] = await pool.execute(
      `SELECT id, name, email, phone, role, status
       FROM users
       WHERE id = ?`,
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    const user = users[0];

    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'This account is not active.'
      });
    }

    res.json({
      success: true,
      user
    });

  } catch (error) {
    console.error('Get current user error:', error);

    res.status(500).json({
      success: false,
      message: 'Server error.'
    });
  }
});

// ============================================================
// ADMIN: DELIVERY PARTNER MANAGEMENT
// All routes below require admin JWT authentication.
// ============================================================

// =============================
// GET ALL DELIVERY PARTNERS
// Returns users with role=delivery_partner joined with
// their delivery_partners profile (vehicle info, is_online).
// =============================
router.get(
  '/admin/delivery-partners',
  authenticateToken,
  authorizeRoles('admin'),
  async (req, res) => {
    try {
      const [partners] = await pool.query(`
        SELECT
          u.id,
          u.name,
          u.email,
          u.phone,
          u.status,
          u.created_at,
          dp.vehicle_type,
          dp.vehicle_number,
          dp.is_online
        FROM users u
        LEFT JOIN delivery_partners dp ON dp.user_id = u.id
        WHERE u.role = 'delivery_partner'
        ORDER BY u.name ASC
      `);

      res.json({
        success: true,
        deliveryPartners: partners
      });

    } catch (error) {
      console.error('Admin get delivery partners error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to load delivery partners'
      });
    }
  }
);

// =============================
// CREATE DELIVERY PARTNER
// Creates a users row (role=delivery_partner) and a
// delivery_partners profile row within a transaction.
// Password is hashed with bcrypt (cost 10).
// =============================
router.post(
  '/admin/delivery-partners',
  authenticateToken,
  authorizeRoles('admin'),
  async (req, res) => {
    const connection = await pool.getConnection();

    try {
      const {
        name,
        email,
        phone,
        password,
        vehicle_type,
        vehicle_number,
        status
      } = req.body;

      // Validate required fields
      if (!name || !email || !phone || !password) {
        return res.status(400).json({
          success: false,
          message: 'Name, email, phone and password are required'
        });
      }

      // Check for duplicate email
      const [emailCheck] = await connection.execute(
        'SELECT id FROM users WHERE email = ?',
        [email]
      );
      if (emailCheck.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'A user with this email already exists'
        });
      }

      // Check for duplicate phone
      const [phoneCheck] = await connection.execute(
        'SELECT id FROM users WHERE phone = ?',
        [phone]
      );
      if (phoneCheck.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'A user with this phone number already exists'
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const finalStatus = status || 'active';
      const finalVehicleType = vehicle_type || 'motorcycle';

      await connection.beginTransaction();

      // Insert into users table
      const [userResult] = await connection.execute(
        `INSERT INTO users (name, email, phone, password, role, status)
         VALUES (?, ?, ?, ?, 'delivery_partner', ?)`,
        [name, email, phone, hashedPassword, finalStatus]
      );

      const newUserId = userResult.insertId;

      // Insert into delivery_partners table
      await connection.execute(
        `INSERT INTO delivery_partners (user_id, vehicle_type, vehicle_number, is_online)
         VALUES (?, ?, ?, 0)`,
        [newUserId, finalVehicleType, vehicle_number || null]
      );

      await connection.commit();

      res.status(201).json({
        success: true,
        message: 'Delivery partner created successfully',
        deliveryPartner: {
          id: newUserId,
          name,
          email,
          phone,
          status: finalStatus,
          vehicle_type: finalVehicleType,
          vehicle_number: vehicle_number || null
        }
      });

    } catch (error) {
      await connection.rollback();
      console.error('Admin create delivery partner error:', error);

      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({
          success: false,
          message: 'A user with this email or phone already exists'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to create delivery partner'
      });
    } finally {
      connection.release();
    }
  }
);

// =============================
// UPDATE DELIVERY PARTNER
// Updates the users row and delivery_partners profile.
// Password is only changed if a non-empty new password is sent.
// =============================
router.put(
  '/admin/delivery-partners/:id',
  authenticateToken,
  authorizeRoles('admin'),
  async (req, res) => {
    const connection = await pool.getConnection();

    try {
      const userId = req.params.id;

      const {
        name,
        email,
        phone,
        password,
        vehicle_type,
        vehicle_number,
        status
      } = req.body;

      if (!name || !email || !phone) {
        return res.status(400).json({
          success: false,
          message: 'Name, email and phone are required'
        });
      }

      // Ensure this user exists and is a delivery_partner
      const [existing] = await connection.execute(
        `SELECT id FROM users WHERE id = ? AND role = 'delivery_partner'`,
        [userId]
      );
      if (existing.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Delivery partner not found'
        });
      }

      // Check for email conflict with another user
      const [emailCheck] = await connection.execute(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, userId]
      );
      if (emailCheck.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Another user with this email already exists'
        });
      }

      // Check for phone conflict with another user
      const [phoneCheck] = await connection.execute(
        'SELECT id FROM users WHERE phone = ? AND id != ?',
        [phone, userId]
      );
      if (phoneCheck.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Another user with this phone number already exists'
        });
      }

      await connection.beginTransaction();

      // Update users row — conditionally include password
      if (password && password.trim() !== '') {
        const hashedPassword = await bcrypt.hash(password, 10);
        await connection.execute(
          `UPDATE users
           SET name = ?, email = ?, phone = ?, password = ?, status = ?, updated_at = NOW()
           WHERE id = ?`,
          [name, email, phone, hashedPassword, status || 'active', userId]
        );
      } else {
        await connection.execute(
          `UPDATE users
           SET name = ?, email = ?, phone = ?, status = ?, updated_at = NOW()
           WHERE id = ?`,
          [name, email, phone, status || 'active', userId]
        );
      }

      // Upsert delivery_partners row
      const [dpRows] = await connection.execute(
        'SELECT id FROM delivery_partners WHERE user_id = ?',
        [userId]
      );

      if (dpRows.length > 0) {
        await connection.execute(
          `UPDATE delivery_partners
           SET vehicle_type = ?, vehicle_number = ?, updated_at = NOW()
           WHERE user_id = ?`,
          [vehicle_type || 'motorcycle', vehicle_number || null, userId]
        );
      } else {
        await connection.execute(
          `INSERT INTO delivery_partners (user_id, vehicle_type, vehicle_number, is_online)
           VALUES (?, ?, ?, 0)`,
          [userId, vehicle_type || 'motorcycle', vehicle_number || null]
        );
      }

      await connection.commit();

      res.json({
        success: true,
        message: 'Delivery partner updated successfully'
      });

    } catch (error) {
      await connection.rollback();
      console.error('Admin update delivery partner error:', error);

      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({
          success: false,
          message: 'Another user with this email or phone already exists'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to update delivery partner'
      });
    } finally {
      connection.release();
    }
  }
);

// =============================
// DELETE DELIVERY PARTNER
// Safely removes a delivery partner while preserving historical orders.
// Steps:
//   1. NULL-out orders.delivery_partner_id so order history is preserved.
//   2. Delete the users row — FK ON DELETE CASCADE removes the
//      delivery_partners row automatically.
// =============================
router.delete(
  '/admin/delivery-partners/:id',
  authenticateToken,
  authorizeRoles('admin'),
  async (req, res) => {
    const connection = await pool.getConnection();

    try {
      const userId = req.params.id;

      // Confirm this is a delivery_partner
      const [existing] = await connection.execute(
        `SELECT id FROM users WHERE id = ? AND role = 'delivery_partner'`,
        [userId]
      );
      if (existing.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Delivery partner not found'
        });
      }

      await connection.beginTransaction();

      // Step 1: NULL-out delivery_partner_id on all orders assigned to this partner.
      // This preserves the historical order records; the order simply loses the
      // assignment reference but retains all financial and status history.
      await connection.execute(
        `UPDATE orders
         SET delivery_partner_id = NULL, updated_at = NOW()
         WHERE delivery_partner_id = ?`,
        [userId]
      );

      // Step 2: Delete the users row.
      // The FK fk_delivery_partners_user has ON DELETE CASCADE, so the
      // corresponding delivery_partners row is removed automatically.
      await connection.execute(
        'DELETE FROM users WHERE id = ?',
        [userId]
      );

      await connection.commit();

      res.json({
        success: true,
        message: 'Delivery partner permanently deleted'
      });

    } catch (error) {
      await connection.rollback();
      console.error('Admin delete delivery partner error:', error);

      res.status(500).json({
        success: false,
        message: 'Failed to delete delivery partner'
      });
    } finally {
      connection.release();
    }
  }
);

module.exports = router;