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

// ============================================================
// FORGOT PASSWORD — in-memory OTP store (no database table)
// ============================================================
const crypto = require('crypto');
const { sendPasswordResetOtpEmail } = require('../utils/email');

// In-memory store: email (lowercase) → { otpHash, expiresAt, attempts, createdAt }
const passwordResetStore = new Map();

// Helper: remove expired entries (called on each request + by periodic cleanup)
function cleanExpiredOtps() {
  const now = Date.now();
  for (const [email, record] of passwordResetStore.entries()) {
    if (record.expiresAt < now) {
      passwordResetStore.delete(email);
    }
  }
}

// Periodic cleanup every 5 minutes — removes expired records automatically
setInterval(cleanExpiredOtps, 5 * 60 * 1000);

// =====================================
// POST /api/auth/forgot-password
// Step 1: Verify name, email, phone and generate OTP
// =====================================
router.post('/forgot-password', async (req, res) => {
  cleanExpiredOtps();

  try {
    const { name, email, phone } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Full name is required.'
      });
    }

    if (!email || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required.'
      });
    }

    if (!phone || typeof phone !== 'string' || !phone.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required.'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const cleanEmail = email.trim().toLowerCase();
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address.'
      });
    }

    // Find active customer by email
    const [users] = await pool.execute(
      `SELECT id, name, phone FROM users WHERE email = ? AND role = 'customer' AND status = 'active' LIMIT 1`,
      [cleanEmail]
    );

    if (users.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'The provided details do not match our records.'
      });
    }

    const user = users[0];

    // Verify name match (case-insensitive, trimmed)
    const dbName = (user.name || '').trim().toLowerCase();
    const inputName = name.trim().toLowerCase();
    const nameMatches = dbName === inputName;

    // Verify phone match (digits match or exact string match)
    const dbPhoneDigits = (user.phone || '').replace(/\D/g, '');
    const inputPhoneDigits = phone.trim().replace(/\D/g, '');
    const phoneMatches =
      (user.phone || '').trim().toLowerCase() === phone.trim().toLowerCase() ||
      (dbPhoneDigits.length >= 7 && inputPhoneDigits.length >= 7 && (
        dbPhoneDigits === inputPhoneDigits ||
        dbPhoneDigits.endsWith(inputPhoneDigits) ||
        inputPhoneDigits.endsWith(dbPhoneDigits)
      ));

    if (!nameMatches || !phoneMatches) {
      return res.status(400).json({
        success: false,
        message: 'The name or phone number does not match our records for this account.'
      });
    }

    // Generate secure 6-digit OTP
    const otp = crypto.randomInt(100000, 1000000).toString();

    // Store hash in memory (10-minute expiry)
    const otpHash = await bcrypt.hash(otp, 10);
    const OTP_EXPIRY_MS = 10 * 60 * 1000;

    passwordResetStore.set(cleanEmail, {
      otpHash,
      expiresAt: Date.now() + OTP_EXPIRY_MS,
      attempts: 0,
      createdAt: Date.now(),
      verified: false
    });

    // Return the generated OTP directly in response so frontend can display it in modal
    return res.json({
      success: true,
      message: 'OTP generated successfully',
      otp: otp
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
});

// =====================================
// POST /api/auth/verify-otp
// Step 2: Verify the 6-digit OTP
// =====================================
router.post('/verify-otp', async (req, res) => {
  cleanExpiredOtps();

  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required.'
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.toString().trim();

    if (!/^\d{6}$/.test(cleanOtp)) {
      return res.status(400).json({
        success: false,
        message: 'OTP must be exactly 6 digits.'
      });
    }

    const record = passwordResetStore.get(cleanEmail);

    if (!record) {
      return res.status(400).json({
        success: false,
        message: 'No active OTP found. Please request a new OTP.'
      });
    }

    if (Date.now() > record.expiresAt) {
      passwordResetStore.delete(cleanEmail);
      return res.status(400).json({
        success: false,
        message: 'Your OTP has expired. Please request a new OTP.'
      });
    }

    if (record.attempts >= 5) {
      passwordResetStore.delete(cleanEmail);
      return res.status(400).json({
        success: false,
        message: 'Too many incorrect attempts. Please request a new OTP.'
      });
    }

    const otpMatch = await bcrypt.compare(cleanOtp, record.otpHash);

    if (!otpMatch) {
      record.attempts += 1;
      if (record.attempts >= 5) {
        passwordResetStore.delete(cleanEmail);
        return res.status(400).json({
          success: false,
          message: 'Too many incorrect attempts. Please request a new OTP.'
        });
      }

      const attemptsLeft = 5 - record.attempts;
      return res.status(400).json({
        success: false,
        message: `Incorrect OTP. ${attemptsLeft} attempt${attemptsLeft !== 1 ? 's' : ''} remaining.`
      });
    }

    // Mark verified
    record.verified = true;

    return res.json({
      success: true,
      message: 'OTP verified successfully'
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
});

// =====================================
// POST /api/auth/reset-password
// Step 3: Update password after OTP verification
// =====================================
router.post('/reset-password', async (req, res) => {
  cleanExpiredOtps();

  try {
    const { email: rawEmail, otp, newPassword } = req.body;

    if (!rawEmail || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email and new password are required.'
      });
    }

    const email = rawEmail.trim().toLowerCase();

    // Validate new password length (minimum 6, matching signup rule)
    if (typeof newPassword !== 'string' || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters.'
      });
    }

    const record = passwordResetStore.get(email);

    if (!record) {
      return res.status(400).json({
        success: false,
        message: 'No active password reset session. Please request a new OTP.'
      });
    }

    if (Date.now() > record.expiresAt) {
      passwordResetStore.delete(email);
      return res.status(400).json({
        success: false,
        message: 'Session expired. Please request a new OTP.'
      });
    }

    // Validate OTP if passed, or verify that record was already marked verified
    if (otp) {
      const cleanOtp = otp.toString().trim();
      const otpMatch = await bcrypt.compare(cleanOtp, record.otpHash);
      if (!otpMatch) {
        return res.status(400).json({
          success: false,
          message: 'Invalid OTP. Please verify your OTP.'
        });
      }
    } else if (!record.verified) {
      return res.status(400).json({
        success: false,
        message: 'OTP must be verified before resetting password.'
      });
    }

    // Find the customer account
    const [users] = await pool.execute(
      `SELECT id FROM users WHERE email = ? AND role = 'customer' AND status = 'active' LIMIT 1`,
      [email]
    );

    if (users.length === 0) {
      passwordResetStore.delete(email);
      return res.status(400).json({
        success: false,
        message: 'Account not found. Please contact support.'
      });
    }

    // Hash the new password using bcrypt
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password in users table
    await pool.execute(
      `UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?`,
      [hashedPassword, users[0].id]
    );

    // Invalidate the OTP session immediately
    passwordResetStore.delete(email);

    return res.json({
      success: true,
      message: 'Password reset successful. You can now log in with your new password.'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
});

module.exports = router;