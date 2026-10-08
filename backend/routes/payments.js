const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { authenticateToken } = require('../middleware/authMiddleware');
const { pool } = require('../config/db');
const { calculateOrderPricing } = require('../utils/orderPricing');
const {
  finalizeOnlineOrder
} = require('../services/paymentService');
const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// ==========================================================
// In-memory payment session store
//
// Keyed by razorpayOrderId.
// Stores cart + address + pricing so that /confirm can
// perform the full atomic DB insertion AFTER Razorpay
// payment succeeds.
//
// Sessions expire after 2 hours (7 200 000 ms) to prevent
// memory leaks from abandoned checkouts.
// ==========================================================
const paymentSessions = new Map();
const SESSION_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours

function storePaymentSession(razorpayOrderId, data) {
  paymentSessions.set(razorpayOrderId, {
    ...data,
    expiresAt: Date.now() + SESSION_TTL_MS
  });
}

function getPaymentSession(razorpayOrderId) {
  const session = paymentSessions.get(razorpayOrderId);
  if (!session) return null;
  if (Date.now() > session.expiresAt) {
    paymentSessions.delete(razorpayOrderId);
    return null;
  }
  return session;
}

function deletePaymentSession(razorpayOrderId) {
  paymentSessions.delete(razorpayOrderId);
}

router.post(
  '/initiate',
  authenticateToken,
  async (req, res) => {
    let connection;

    try {
      const {
        items,
        address
      } = req.body;

      // ==========================================
      // 1. VALIDATE CART
      // ==========================================
      if (
        !Array.isArray(items) ||
        items.length === 0
      ) {
        return res.status(400).json({
          success: false,
          message: 'Your cart is empty.'
        });
      }

      // ==========================================
      // 2. VALIDATE ADDRESS
      // ==========================================
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
          message:
            'Please provide complete delivery address details.'
        });
      }

      connection = await pool.getConnection();

      const userId = req.user.id;

      // ==========================================
      // 3. CALCULATE TRUSTED PRICING
      // ==========================================
      //
      // Prices come from the database.
      // Browser-provided prices are NOT trusted.
      // Stock is validated here (early rejection).
      // Stock is NOT deducted yet.
      //
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

      if (
        !totalAmount ||
        totalAmount <= 0
      ) {
        throw new Error(
          'Invalid order amount.'
        );
      }

      // ==========================================
      // 4. CREATE RAZORPAY ORDER
      // ==========================================
      //
      // No database writes happen here.
      // The order is only created in the DB after
      // Razorpay payment is successfully verified.
      //
      const orderNumber =
        'ORD-' +
        Date.now()
          .toString()
          .slice(-10) +
        Math.floor(
          Math.random() * 10
        );

      const amountInPaise = Math.round(totalAmount * 100);

      const razorpayOrder = await razorpay.orders.create({
        amount: amountInPaise,
        currency: 'INR',
        receipt: orderNumber
      });

      // ==========================================
      // 5. STORE SESSION IN MEMORY
      // ==========================================
      //
      // No DB commit. Session lives only until:
      // - /confirm succeeds (session deleted)
      // - /confirm fails (session remains for retry)
      // - TTL expires (garbage collected)
      //
      storePaymentSession(razorpayOrder.id, {
        userId,
        orderNumber,
        items,
        address,
        orderItems,
        subtotal,
        deliveryCharge,
        discountAmount,
        totalAmount
      });

      console.log(
        'ONLINE PAYMENT INITIATED (no DB write):',
        {
          razorpayOrderId: razorpayOrder.id,
          orderNumber,
          userId,
          totalAmount
        }
      );

      // ==========================================
      // 6. SEND DATA TO CUSTOMER
      // ==========================================
      return res.json({
        success: true,
        message: 'Razorpay order created successfully.',

        razorpayOrderId: razorpayOrder.id,

        amount: razorpayOrder.amount,

        currency: razorpayOrder.currency,

        keyId: process.env.RAZORPAY_KEY_ID,

        pricing: {
          subtotal,
          deliveryCharge,
          discount: discountAmount,
          totalAmount
        }
      });

    } catch (error) {
      console.error(
        'Razorpay initiation error:',
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          'Failed to create payment.'
      });

    } finally {
      if (connection) {
        connection.release();
      }
    }
  }
);

router.post('/verify', authenticateToken, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message: 'Missing Razorpay payment details.'
      });
    }

    const crypto = require('crypto');

    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Payment signature verification failed.'
      });
    }

    res.json({
      success: true,
      message: 'Payment verified successfully.',
      paymentStatus: 'SUCCESS',
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id
    });

  } catch (error) {
    console.error('Razorpay payment verification error:', error);

    res.status(500).json({
      success: false,
      message: 'Payment verification failed.'
    });
  }
});

router.post(
  '/confirm',
  authenticateToken,
  async (req, res) => {
    try {
      const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
      } = req.body;

      if (
        !razorpay_order_id ||
        !razorpay_payment_id ||
        !razorpay_signature
      ) {
        return res.status(400).json({
          success: false,
          message:
            'Missing Razorpay payment details.'
        });
      }

      // ==========================================
      // RETRIEVE SESSION
      // ==========================================
      //
      // The session was stored in /initiate and contains
      // the pre-validated items, address, and pricing.
      //
      const session = getPaymentSession(razorpay_order_id);

      if (!session) {
        return res.status(400).json({
          success: false,
          message:
            'Payment session expired or not found. Please start checkout again.'
        });
      }

      const result =
        await finalizeOnlineOrder({
          razorpayOrderId:
            razorpay_order_id,

          razorpayPaymentId:
            razorpay_payment_id,

          razorpaySignature:
            razorpay_signature,

          userId: req.user.id,

          session
        });

      // ==========================================
      // CLEAN UP SESSION AFTER SUCCESS
      // ==========================================
      deletePaymentSession(razorpay_order_id);

      const [orderRows] = await pool.execute(
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
    AND o.user_id = ?

  LIMIT 1
  `,
        [
          result.orderId,
          req.user.id
        ]
      );

      if (orderRows.length === 0) {
        throw new Error(
          'Payment was successful, but the order could not be loaded.'
        );
      }

      const order = orderRows[0];

      return res.json({
        success: true,

        message:
          result.alreadyFinalized
            ? 'Payment was already confirmed.'
            : 'Payment confirmed and order finalized.',

        orderId:
          result.orderId,

        orderNumber:
          result.orderNumber,

        paymentStatus:
          result.paymentStatus,

        orderStatus:
          result.orderStatus,

        totalAmount:
          result.totalAmount,

        order
      });

    } catch (error) {
      console.error(
        'Razorpay payment confirmation error:',
        error
      );

      return res.status(400).json({
        success: false,
        message:
          error.message ||
          'Payment confirmation failed.'
      });
    }
  }
);

// ==========================================================
// Razorpay Webhook
// ==========================================================

router.post(
  '/webhook',
  async (req, res) => {
    try {
      const webhookSignature =
        req.headers['x-razorpay-signature'];

      if (!webhookSignature) {
        return res.status(400).json({
          success: false,
          message: 'Missing Razorpay webhook signature.'
        });
      }

      if (!req.rawBody) {
        return res.status(400).json({
          success: false,
          message: 'Raw webhook body is missing.'
        });
      }

      const expectedSignature =
        crypto
          .createHmac(
            'sha256',
            process.env.RAZORPAY_WEBHOOK_SECRET
          )
          .update(req.rawBody)
          .digest('hex');

      if (
        expectedSignature !== webhookSignature
      ) {
        console.error(
          '❌ Invalid Razorpay webhook signature.'
        );

        return res.status(400).json({
          success: false,
          message: 'Invalid webhook signature.'
        });
      }

      const event = req.body.event;

      console.log(
        '✅ Razorpay webhook received:',
        event
      );

      // --------------------------------------------------
      // Payment captured
      // --------------------------------------------------

      if (
        event === 'payment.captured'
      ) {
        const paymentEntity =
          req.body.payload?.payment?.entity;

        if (!paymentEntity) {
          return res.status(400).json({
            success: false,
            message: 'Payment information is missing.'
          });
        }

        const razorpayOrderId =
          paymentEntity.order_id;

        const razorpayPaymentId =
          paymentEntity.id;

        if (
          !razorpayOrderId ||
          !razorpayPaymentId
        ) {
          return res.status(400).json({
            success: false,
            message:
              'Razorpay order or payment ID is missing.'
          });
        }

        const {
          finalizeOnlineOrder
        } = require('../services/paymentService');

        // Retrieve the in-memory session for this
        // Razorpay order. The session is required to
        // create the order record in the database.
        const webhookSession =
          getPaymentSession(razorpayOrderId);

        if (!webhookSession) {
          console.warn(
            '⚠️ Webhook: No session found for Razorpay order',
            razorpayOrderId,
            '— skipping DB finalization (customer /confirm will handle it).'
          );
          return res.json({ success: true });
        }

        const result =
          await finalizeOnlineOrder({
            razorpayOrderId,
            razorpayPaymentId,
            razorpaySignature: null,
            userId: null,
            session: webhookSession
          });

        // Clean up session after webhook finalization.
        deletePaymentSession(razorpayOrderId);

        console.log(
          '✅ Razorpay webhook finalized order:',
          result
        );
      }

      // --------------------------------------------------
      // Payment failed
      // --------------------------------------------------

      if (
        event === 'payment.failed'
      ) {
        const paymentEntity =
          req.body.payload?.payment?.entity;

        console.log(
          '⚠️ Razorpay payment failed:',
          paymentEntity?.id
        );
      }

      return res.json({
        success: true
      });

    } catch (error) {
      console.error(
        '❌ Razorpay webhook error:',
        error
      );

      return res.status(500).json({
        success: false,
        message: 'Webhook processing failed.'
      });
    }
  }
);
module.exports = router;