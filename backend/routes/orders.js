const express = require('express');
const crypto = require('crypto');
const Razorpay = require('razorpay');
const router = express.Router();

const { pool } = require('../config/db');
const {
  authenticateToken,
  authorizeRoles
} = require('../middleware/authMiddleware');
const { sendAdminNewOrderEmail } = require('../utils/email');
const { calculateOrderPricing } = require('../utils/orderPricing');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});
// =====================================
// GET SINGLE ORDER DETAILS WITH ITEMS
// =====================================
router.get(
  '/admin/:id/details',
  authenticateToken,
  authorizeRoles('admin'),
  async (req, res) => {
    try {
      const { id } = req.params;

      const [orders] = await pool.query(
        `
        SELECT
          o.id,
          o.order_number,
          o.user_id,
          o.address_id,
          o.subtotal,
          o.delivery_charge,
          o.discount,
          o.total_amount,
          o.payment_method,
          o.payment_status,
          o.order_status,
          o.created_at,
          o.updated_at,

          a.full_name,
          a.phone,
          a.address_line,
          a.landmark,
          a.city,
          a.state,
          a.pincode,
          a.latitude,
          a.longitude

        FROM orders o
        LEFT JOIN addresses a
          ON a.id = o.address_id

        WHERE o.id = ?
        `,
        [id]
      );

      if (orders.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      const [items] = await pool.query(
        `
        SELECT
          id,
          order_id,
          product_id,
          product_name,
          price,
          quantity,
          subtotal
        FROM order_items
        WHERE order_id = ?
        ORDER BY id ASC
        `,
        [id]
      );

      return res.json({
        success: true,
        order: orders[0],
        items
      });

    } catch (error) {
      console.error(
        'Get order details error:',
        error
      );

      return res.status(500).json({
        success: false,
        message: 'Failed to load order details'
      });
    }
  }
);
// ==========================================
// GET LOGGED-IN CUSTOMER ORDERS WITH ITEMS
// ==========================================
router.get(
  '/',
  authenticateToken,
  authorizeRoles('customer'),
  async (req, res) => {
    try {
      const userId = req.user.id;

      // ------------------------------------------
      // 1. Get all orders for the logged-in customer
      // ------------------------------------------
      const [orders] = await pool.execute(
        `
        SELECT
          o.id,
          o.order_number,
          o.subtotal,
          o.delivery_charge,
          o.discount,
          o.total_amount,
          o.payment_method,
          o.payment_status,
          o.order_status,
          o.created_at,
          o.updated_at,
          o.delivered_at,

          a.full_name,
          a.phone,
          a.address_line,
          a.landmark,
          a.city,
          a.state,
          a.pincode,
          a.latitude,
          a.longitude

        FROM orders o

        LEFT JOIN addresses a
          ON o.address_id = a.id

        WHERE o.user_id = ?

        ORDER BY o.created_at DESC
        `,
        [userId]
      );

      // ------------------------------------------
      // 2. Get items for each order
      // ------------------------------------------
      for (const order of orders) {
        const [items] = await pool.execute(
          `
          SELECT
            id,
            order_id,
            product_id,
            product_name,
            price,
            quantity,
            subtotal
          FROM order_items
          WHERE order_id = ?
          ORDER BY id ASC
          `,
          [order.id]
        );

        // Attach items directly to the order
        order.items = items;
      }

      // ------------------------------------------
      // 3. Return orders with items
      // ------------------------------------------
      res.json({
        success: true,
        orders
      });

    } catch (error) {
      console.error('Get customer orders error:', error);

      res.status(500).json({
        success: false,
        message: 'Failed to fetch orders.'
      });
    }
  }
);

// ==========================================
// CREATE NEW ORDER
// ==========================================
router.post(
  '/',
  authenticateToken,
  authorizeRoles('customer'),
  async (req, res) => {
    let connection;

    try {
      connection = await pool.getConnection();

      const userId = req.user.id;

      const {
        items,
        address,
        paymentMethod = 'cod',
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature
      } = req.body;
      // -----------------------------
      // Validate cart items
      // -----------------------------
      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Your cart is empty.'
        });
      }

      // -----------------------------
      // Validate address
      // -----------------------------
      if (
        !address ||
        !address.fullName ||
        !address.phone ||
        !address.addressLine ||
        !address.city ||
        !address.state ||
        !address.pincode
      ) {
        return res.status(400).json({
          success: false,
          message: 'Please provide complete delivery address details.'
        });
      }

      // -----------------------------
      // Validate payment method
      // -----------------------------
      const allowedPaymentMethods = ['cod', 'online'];

      if (!allowedPaymentMethods.includes(paymentMethod)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid payment method.'
        });
      }
      // ------------------------------------------
      // Verify Razorpay payment for online orders
      // ------------------------------------------
      if (paymentMethod === 'online') {
        if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
          return res.status(400).json({
            success: false,
            message: 'Missing Razorpay payment details.'
          });
        }

        const generatedSignature = crypto
          .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
          .update(`${razorpayOrderId}|${razorpayPaymentId}`)
          .digest('hex');

        if (generatedSignature !== razorpaySignature) {
          return res.status(400).json({
            success: false,
            message: 'Razorpay payment verification failed.'
          });
        }
      }
      await connection.beginTransaction();

      // ==========================================
      // 1. SAVE DELIVERY ADDRESS
      // ==========================================
      const [addressResult] = await connection.execute(
        `
        INSERT INTO addresses (
          user_id,
          full_name,
          phone,
          address_line,
          landmark,
          city,
          state,
          pincode,
          latitude,
          longitude,
          is_default,
          created_at,
          updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `,
        [
          userId,
          address.fullName,
          address.phone,
          address.addressLine,
          address.landmark || '',
          address.city,
          address.state,
          address.pincode,
          address.latitude || null,
          address.longitude || null,
          0
        ]
      );

      const addressId = addressResult.insertId;

      // ==========================================
      // 2. CALCULATE TRUSTED ORDER PRICING
      // ==========================================
      const {
        orderItems,
        subtotal,
        deliveryCharge,
        discountAmount,
        totalAmount
      } = await calculateOrderPricing(
        connection,
        items,
        0
      );
      // ==========================================
      // VERIFY RAZORPAY ORDER AMOUNT
      // ==========================================
      if (paymentMethod === 'online') {
        const razorpayOrder = await razorpay.orders.fetch(
          razorpayOrderId
        );

        const expectedAmountInPaise = Math.round(
          totalAmount * 100
        );

        if (
          Number(razorpayOrder.amount) !== expectedAmountInPaise
        ) {
          throw new Error(
            'Razorpay payment amount does not match the order total.'
          );
        }
      }
      // ==========================================
      // 4. GENERATE ORDER NUMBER
      // ==========================================
      const orderNumber =
        'ORD-' +
        Date.now().toString().slice(-10) +
        Math.floor(Math.random() * 10);

      const paymentStatus =
        paymentMethod === 'cod' ? 'pending' : 'paid';
      // ==========================================
      // 5. INSERT INTO ORDERS
      // ==========================================
      const [orderResult] = await connection.execute(
        `
        INSERT INTO orders (
          user_id,
          address_id,
          order_number,
          subtotal,
          delivery_charge,
          discount,
          total_amount,
          payment_method,
          payment_status,
          order_status,
          created_at,
          updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `,
        [
          userId,
          addressId,
          orderNumber,
          subtotal.toFixed(2),
          deliveryCharge.toFixed(2),
          discountAmount.toFixed(2),
          totalAmount.toFixed(2),
          paymentMethod,
          paymentStatus,
          'placed'
        ]
      );

      const orderId = orderResult.insertId;
      // ==========================================
      // 5A. INSERT PAYMENT RECORD
      // ==========================================
      if (paymentMethod === 'online') {
        const [existingPayment] = await connection.execute(
          `
          SELECT id
          FROM payments
          WHERE razorpay_order_id = ?
          LIMIT 1
          `,
          [razorpayOrderId]
        );

        if (existingPayment.length > 0) {
          throw new Error(
            'This Razorpay payment has already been used.'
          );
        }

        await connection.execute(
          `
          INSERT INTO payments (
            order_id,
            payment_method,
            transaction_id,
            razorpay_order_id,
            amount,
            payment_status,
            paid_at,
            created_at,
            updated_at
          )
          VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW(), NOW())
          `,
          [
            orderId,
            'online',
            razorpayPaymentId,
            razorpayOrderId,
            totalAmount.toFixed(2),
            'paid'
          ]
        );
      }
      // ==========================================
      // 6. INSERT INTO ORDER_ITEMS
      // ==========================================
      for (const item of orderItems) {
        await connection.execute(
          `
          INSERT INTO order_items (
            order_id,
            product_id,
            product_name,
            price,
            quantity,
            subtotal,
            created_at
          )
          VALUES (?, ?, ?, ?, ?, ?, NOW())
          `,
          [
            orderId,
            item.productId,
            item.productName,
            item.price.toFixed(2),
            item.quantity,
            item.subtotal.toFixed(2)
          ]
        );

        // ------------------------------------------
        // Reduce stock after successful item insert
        // ------------------------------------------
        await connection.execute(
          `
          UPDATE products
          SET stock_quantity = stock_quantity - ?
          WHERE id = ?
          `,
          [item.quantity, item.productId]
        );
      }

      await connection.commit();
      console.log('ORDER INSERTED SUCCESSFULLY:', {
        orderId,
        orderNumber,
        userId
      });

      // ==========================================
      // 7. SEND ADMIN EMAIL NOTIFICATION
      // Non-blocking: email failure must NEVER affect the order.
      // ==========================================
      // Fetch customer name from the JWT token (req.user) if available,
      // otherwise fall back to the address name provided.
      const customerName = (req.user && req.user.name) ? req.user.name : (address.fullName || 'Customer');
      const customerEmail = (req.user && req.user.email) ? req.user.email : '';
      const customerPhone = (req.user && req.user.phone) ? req.user.phone : (address.phone || '');


      sendAdminNewOrderEmail({
        orderNumber,
        orderId,
        customerName,
        customerEmail,
        customerPhone,
        orderDate: new Date().toISOString(),
        items: orderItems,
        subtotal: subtotal.toFixed(2),
        deliveryCharge: deliveryCharge.toFixed(2),
        discount: discountAmount.toFixed(2),
        totalAmount: totalAmount.toFixed(2),
        paymentMethod,
        paymentStatus,
        orderStatus: 'placed',
        address
      }).then(() => {
        console.log(`✅  Admin email sent for order ${orderNumber}`);
      }).catch((emailErr) => {
        // Log the failure — do NOT re-throw so order remains unaffected

      });

      res.status(201).json({
        success: true,
        message: 'Order created successfully.',
        order: {
          id: orderId,
          orderNumber,
          subtotal: Number(subtotal.toFixed(2)),
          deliveryCharge,
          discount: discountAmount,
          totalAmount,
          paymentMethod,
          paymentStatus,
          orderStatus: 'placed',
          address
        }
      });

    } catch (error) {
      if (connection) {
        await connection.rollback();
      }

      console.error('Create order error:', error);

      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create order.'
      });
    } finally {
      if (connection) {
        connection.release();
      }
    }
  }
);

// =====================================
// ADMIN: GET ALL ORDERS
// =====================================
router.get(
  '/admin/all',
  authenticateToken,
  authorizeRoles('admin'),
  async (req, res) => {
    try {
      const [orders] = await pool.query(`
        SELECT
          o.id,
          o.order_number,
          o.user_id,
          o.address_id,
          o.subtotal,
          o.delivery_charge,
          o.discount,
          o.total_amount,
          o.payment_method,
          o.payment_status,
          o.order_status,
          o.created_at,
          o.updated_at,
          a.full_name,
          a.phone,
          a.address_line,
          a.landmark,
          a.city,
          a.state,
          a.pincode,
          a.latitude,
          a.longitude
        FROM orders o
        LEFT JOIN addresses a
          ON a.id = o.address_id
        ORDER BY o.created_at DESC
      `);

      return res.status(200).json({
        success: true,
        orders
      });
    } catch (error) {
      console.error('Admin load orders error:', error);

      return res.status(500).json({
        success: false,
        message: 'Failed to load orders.',
        error: error.message
      });
    }
  }
);

// =====================================
// ADMIN: UPDATE ORDER STATUS
// =====================================
router.put(
  '/admin/:id/status',
  authenticateToken,
  authorizeRoles('admin'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const allowedStatuses = [
        'placed',
        'confirmed',
        'preparing',
        'ready_for_pickup',
        'assigned',
        'picked_up',
        'out_for_delivery',
        'delivered',
        'cancelled'
      ];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid order status.'
        });
      }

      const [result] = await pool.query(
        `
        UPDATE orders
        SET
          order_status = ?,
          updated_at = NOW(),
          cancelled_at = CASE
            WHEN ? = 'cancelled' THEN COALESCE(cancelled_at, NOW())
            ELSE cancelled_at
          END
        WHERE id = ?
        `,
        [status, status, id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: 'Order not found.'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Order status updated successfully.'
      });
    } catch (error) {
      console.error('Admin update order status error:', error);

      return res.status(500).json({
        success: false,
        message: 'Failed to update order status.',
        error: error.message
      });
    }
  }
);
// =====================================
// DELIVERY PARTNER - VIEW AVAILABLE ORDERS
// =====================================
router.get(
  '/delivery/available',
  authenticateToken,
  authorizeRoles('delivery_partner'),
  async (req, res) => {
    try {
      const [orders] = await pool.query(`
        SELECT
          o.id,
          o.order_number,
          o.total_amount,
          o.payment_method,
          o.payment_status,
          o.order_status,
          o.created_at,

          a.full_name,
          a.phone,
          a.address_line,
          a.landmark,
          a.city,
          a.state,
          a.pincode,
          a.latitude,
          a.longitude

        FROM orders o

        LEFT JOIN addresses a
          ON a.id = o.address_id

        WHERE o.delivery_partner_id IS NULL
          AND o.order_status IN ('confirmed', 'preparing', 'ready_for_pickup')

        ORDER BY o.created_at ASC
      `);

      res.json({
        success: true,
        orders
      });
    } catch (error) {
      console.error(
        'Load available delivery orders error:',
        error
      );

      res.status(500).json({
        success: false,
        message: 'Failed to load available orders'
      });
    }
  }
);


// =====================================
// DELIVERY PARTNER - VIEW ASSIGNED ORDERS
// =====================================
// =====================================
// DELIVERY PARTNER - VIEW ASSIGNED ORDERS
// =====================================
router.get(
  '/delivery/assigned',
  authenticateToken,
  authorizeRoles('delivery_partner'),
  async (req, res) => {
    try {
      const [orders] = await pool.query(
        `
        SELECT
          o.id,
          o.order_number,
          o.total_amount,
          o.payment_method,
          o.payment_status,
          o.order_status,
          o.created_at,
          o.delivery_partner_id,
          o.assigned_at,

          a.full_name,
          a.phone,
          a.address_line,
          a.landmark,
          a.city,
          a.state,
          a.pincode,
          a.latitude,
          a.longitude,

          COALESCE(
            SUM(oi.quantity),
            0
          ) AS total_items

        FROM orders o

        LEFT JOIN addresses a
          ON a.id = o.address_id

        LEFT JOIN order_items oi
          ON oi.order_id = o.id

        WHERE o.delivery_partner_id = ?

        GROUP BY
          o.id,
          o.order_number,
          o.total_amount,
          o.payment_method,
          o.payment_status,
          o.order_status,
          o.created_at,
          o.delivery_partner_id,
          o.assigned_at,
          a.full_name,
          a.phone,
          a.address_line,
          a.landmark,
          a.city,
          a.state,
          a.pincode,
          a.latitude,
          a.longitude

        ORDER BY o.created_at DESC
        `,
        [req.user.id]
      );

      res.json({
        success: true,
        orders
      });

    } catch (error) {
      console.error(
        'Load assigned delivery orders error:',
        error
      );

      res.status(500).json({
        success: false,
        message: 'Failed to load assigned orders'
      });
    }
  }
);

// =====================================
// DELIVERY PARTNER - ACCEPT ORDER
// =====================================
router.put(
  '/delivery/:orderId/accept',
  authenticateToken,
  authorizeRoles('delivery_partner'),
  async (req, res) => {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const [result] = await connection.query(
        `
        UPDATE orders

        SET
          delivery_partner_id = ?,
          assigned_at = NOW(),
          order_status = 'assigned',
          updated_at = NOW()

        WHERE id = ?
          AND delivery_partner_id IS NULL
          AND order_status IN (
            'confirmed',
            'preparing',
            'ready_for_pickup'
          )
        `,
        [req.user.id, req.params.orderId]
      );

      if (result.affectedRows === 0) {
        await connection.rollback();

        return res.status(400).json({
          success: false,
          message: 'This order is no longer available.'
        });
      }

      await connection.commit();

      res.json({
        success: true,
        message: 'Order accepted successfully'
      });
    } catch (error) {
      await connection.rollback();

      console.error(
        'Accept delivery order error:',
        error
      );

      res.status(500).json({
        success: false,
        message: 'Failed to accept order'
      });
    } finally {
      connection.release();
    }
  }
);


// =====================================
// DELIVERY PARTNER - UPDATE ORDER STATUS
// =====================================
router.put(
  '/delivery/:orderId/status',
  authenticateToken,
  authorizeRoles('delivery_partner'),
  async (req, res) => {
    try {
      const { status } = req.body;

      const allowedStatuses = [
        'assigned',
        'picked_up',
        'out_for_delivery',
        'delivered'
      ];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid delivery status'
        });
      }

      const [result] = await pool.query(
        `
        UPDATE orders

        SET
          order_status = ?,
          updated_at = NOW(),
          delivered_at = CASE
            WHEN ? = 'delivered' THEN NOW()
            ELSE delivered_at
          END

        WHERE id = ?
          AND delivery_partner_id = ?
          `,
        [
          status,
          status,
          req.params.orderId,
          req.user.id
        ]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: 'Order not found or not assigned to you'
        });
      }

      res.json({
        success: true,
        message: 'Order status updated successfully'
      });
    } catch (error) {
      console.error(
        'Update delivery order status error:',
        error
      );

      res.status(500).json({
        success: false,
        message: 'Failed to update order status'
      });
    }
  }
);
// =====================================
// ADMIN - GET DELIVERY PARTNERS
// =====================================
router.get(
  '/admin/delivery-partners',
  authenticateToken,
  authorizeRoles('admin'),
  async (req, res) => {
    try {
      const [partners] = await pool.query(`
        SELECT
          id,
          name,
          phone,
          email
        FROM users
        WHERE role = 'delivery_partner'
        ORDER BY name ASC
      `);

      res.json({
        success: true,
        deliveryPartners: partners
      });
    } catch (error) {
      console.error(
        'Load delivery partners error:',
        error
      );

      res.status(500).json({
        success: false,
        message: 'Failed to load delivery partners'
      });
    }
  }
);
// =====================================
// ADMIN - ASSIGN DELIVERY PARTNER
// =====================================
router.put(
  '/admin/:orderId/assign',
  authenticateToken,
  authorizeRoles('admin'),
  async (req, res) => {
    try {
      const { deliveryPartnerId } = req.body;

      if (!deliveryPartnerId) {
        return res.status(400).json({
          success: false,
          message: 'Delivery partner is required.'
        });
      }

      const [partner] = await pool.query(
        `
        SELECT id
        FROM users
        WHERE id = ?
          AND role = 'delivery_partner'
        `,
        [deliveryPartnerId]
      );

      if (partner.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Delivery partner not found.'
        });
      }

      const [result] = await pool.query(
        `
        UPDATE orders
        SET
          delivery_partner_id = ?,
          assigned_at = NOW(),
          order_status = 'assigned',
          updated_at = NOW()
        WHERE id = ?
        `,
        [
          deliveryPartnerId,
          req.params.orderId
        ]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: 'Order not found.'
        });
      }

      res.json({
        success: true,
        message: 'Delivery partner assigned successfully.'
      });

    } catch (error) {
      console.error(
        'Assign delivery partner error:',
        error
      );

      res.status(500).json({
        success: false,
        message: 'Failed to assign delivery partner.'
      });
    }
  }
);

// =====================================
// ADMIN: GET CURRENT MONTH DASHBOARD STATISTICS
// =====================================
const getDashboardStats = async (req, res) => {
  try {
    const now = new Date();

    // Dynamically calculate current month, with support for test parameters
    let year = req.query.year ? parseInt(req.query.year, 10) : now.getFullYear();
    let month = req.query.month ? parseInt(req.query.month, 10) : now.getMonth() + 1;

    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      year = now.getFullYear();
      month = now.getMonth() + 1;
    }

    const lastDay = new Date(year, month, 0).getDate();
    const mStr = String(month).padStart(2, '0');

    const startOfMonth = `${year}-${mStr}-01 00:00:00`;
    const endOfMonth = `${year}-${mStr}-${String(lastDay).padStart(2, '0')} 23:59:59`;

    const monthDate = new Date(year, month - 1, 1);
    const monthLabel = monthDate.toLocaleString('en-US', {
      month: 'long',
      year: 'numeric'
    });

    const [rows] = await pool.query(
      `
      SELECT
        COUNT(CASE WHEN order_status != 'cancelled' THEN 1 END) AS orders,
        COALESCE(SUM(CASE WHEN order_status != 'cancelled' THEN total_amount ELSE 0 END), 0) AS revenue
      FROM orders
      WHERE created_at >= ? AND created_at <= ?
      `,
      [startOfMonth, endOfMonth]
    );

    const qualifyingOrders = Number(rows[0]?.orders || 0);
    const qualifyingRevenue = Number(Number(rows[0]?.revenue || 0).toFixed(2));

    return res.status(200).json({
      success: true,
      month: monthLabel,
      orders: qualifyingOrders,
      revenue: qualifyingRevenue
    });
  } catch (error) {
    console.error('Admin dashboard stats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to load dashboard statistics.',
      error: error.message
    });
  }
};

router.get(
  '/admin/dashboard/stats',
  authenticateToken,
  authorizeRoles('admin'),
  getDashboardStats
);

module.exports = router;
module.exports.getDashboardStats = getDashboardStats;