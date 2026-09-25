const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

// Ensure contact_inquiries table exists
const ensureContactTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS contact_inquiries (
        id INT UNSIGNED NOT NULL AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        email VARCHAR(150) NULL,
        subject VARCHAR(200) NULL,
        message TEXT NOT NULL,
        status ENUM('unread', 'read', 'resolved') NOT NULL DEFAULT 'unread',
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
      ) ENGINE=InnoDB;
    `);
  } catch (err) {
    console.error('Ensure contact table error:', err.message);
  }
};
ensureContactTable();

// POST /api/contact - Record inquiry in database
router.post('/', async (req, res) => {
  const { name, phone, email, subject, message } = req.body;

  if (!name || !phone || !message) {
    return res.status(400).json({ 
      success: false, 
      message: 'Name, phone, and message are required.' 
    });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO contact_inquiries (name, phone, email, subject, message) VALUES (?, ?, ?, ?, ?)',
      [name.trim(), phone.trim(), (email || '').trim(), (subject || 'General Inquiry').trim(), message.trim()]
    );

    return res.status(201).json({
      success: true,
      message: 'Message saved successfully',
      inquiryId: result.insertId
    });
  } catch (err) {
    console.error('Save inquiry error:', err);
    return res.status(500).json({ success: false, message: 'Failed to record message in database' });
  }
});

// GET /api/contact - View inquiries
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM contact_inquiries ORDER BY created_at DESC');
    res.json({ success: true, inquiries: rows });
  } catch (err) {
    console.error('Fetch inquiries error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch messages' });
  }
});

module.exports = router;
