const express = require('express');
const cors    = require('cors');
require('dotenv').config();

const path   = require('path');

const { testConnection } = require('./config/db');
const app  = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ──────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Routes ──────────────────────────────────────────────────
const authRoutes          = require('./routes/auth');
const productRoutes       = require('./routes/products');
const categoryRoutes      = require('./routes/categories');
const cartRoutes          = require('./routes/cart');
const orderRoutes         = require('./routes/orders');
const paymentRoutes       = require('./routes/payments');
const deliveryRoutes      = require('./routes/delivery');
const notificationRoutes  = require('./routes/notifications');
const locationRoutes      = require('./routes/location');
const contactRoutes       = require('./routes/contact');

app.use('/api/auth',          authRoutes);
app.use('/api/products',      productRoutes);
app.use('/api/categories',    categoryRoutes);
app.use('/api/cart',          cartRoutes);
app.use('/api/orders',        orderRoutes);
app.use('/api/payments',      paymentRoutes);
app.use('/api/delivery',      deliveryRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/location',      locationRoutes);
app.use('/api/contact',       contactRoutes);

// ── Admin Dashboard Statistics ────────────────────────────────
const { authenticateToken, authorizeRoles } = require('./middleware/authMiddleware');
const { getDashboardStats } = require('./routes/orders');
app.get('/api/admin/dashboard/stats', authenticateToken, authorizeRoles('admin'), getDashboardStats);


// ── Health Check (Step 2: includes DB status) ───────────────
app.get('/api/health', async (req, res) => {
  const { pool } = require('./config/db');
  let dbStatus = 'disconnected';

  try {
    const conn = await pool.getConnection();
    conn.release();
    dbStatus = 'connected';
  } catch {
    dbStatus = 'disconnected';
  }

  res.json({
    success:   true,
    message:   'API is running',
    database:  dbStatus,
    app:       'FreshBasket Grocery E-Commerce Backend',
    timestamp: new Date().toISOString()
  });
});

// ── Root ─────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.send('FreshBasket Grocery Backend is running. Visit /api/health to check database status.');
});

// ── Start server ─────────────────────────────────────────────
app.listen(PORT, async () => {
  console.log(`🚀  Backend server running on http://localhost:${PORT}`);
  await testConnection();
});
