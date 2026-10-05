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

      connection =
        await pool.getConnection();

      await connection.beginTransaction();

      const userId = req.user.id;

      // ==========================================
      // 3. CALCULATE TRUSTED PRICING
      // ==========================================
      //
      // Prices come from the database.
      // Browser-provided prices are NOT trusted.
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
      // 4. SAVE DELIVERY ADDRESS
      // ==========================================
      const [addressResult] =
        await connection.execute(
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
          VALUES (
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW()
          )
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

      const addressId =
        addressResult.insertId;

      // ==========================================
      // 5. GENERATE FASTDELIVERY ORDER NUMBER
      // ==========================================
      const orderNumber =
        'ORD-' +
        Date.now()
          .toString()
          .slice(-10) +
        Math.floor(
          Math.random() * 10
        );

      // ==========================================
      // 6. CREATE PENDING FASTDELIVERY ORDER
      // ==========================================
      //
      // Payment is NOT marked paid yet.
      // Stock is NOT reduced yet.
      //
      const [orderResult] =
        await connection.execute(
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
          VALUES (
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW()
          )
          `,
          [
            userId,
            addressId,
            orderNumber,
            subtotal.toFixed(2),
            deliveryCharge.toFixed(2),
            discountAmount.toFixed(2),
            totalAmount.toFixed(2),
            'online',
            'pending',
            'placed'
          ]
        );

      const orderId =
        orderResult.insertId;

      // ==========================================
      // 7. SAVE ORDER ITEMS
      // ==========================================
      //
      // These prices are snapshots of the trusted
      // database prices at checkout time.
      //
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
          VALUES (
            ?, ?, ?, ?, ?, ?, NOW()
          )
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
      }

      // ==========================================
      // 8. CREATE RAZORPAY ORDER
      // ==========================================
      const amountInPaise =
        Math.round(
          totalAmount * 100
        );

      const razorpayOrder =
        await razorpay.orders.create({
          amount: amountInPaise,
          currency: 'INR',
          receipt: orderNumber
        });

      // ==========================================
      // 9. CREATE PENDING PAYMENT RECORD
      // ==========================================
      //
      // transaction_id and paid_at remain NULL.
      //
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
        VALUES (
          ?, ?, ?, ?, ?, ?, ?, NOW(), NOW()
        )
        `,
        [
          orderId,
          'online',
          null,
          razorpayOrder.id,
          totalAmount.toFixed(2),
          'pending',
          null
        ]
      );

      // ==========================================
      // 10. COMMIT EVERYTHING
      // ==========================================
      await connection.commit();

      console.log(
        'ONLINE PAYMENT INITIATED:',
        {
          orderId,
          orderNumber,
          razorpayOrderId:
            razorpayOrder.id,
          userId,
          totalAmount
        }
      );

      // ==========================================
      // 11. SEND DATA TO CUSTOMER
      // ==========================================
      return res.json({
        success: true,
        message:
          'Razorpay order created successfully.',

        orderId,

        orderNumber,

        razorpayOrderId:
          razorpayOrder.id,

        amount:
          razorpayOrder.amount,

        currency:
          razorpayOrder.currency,

        keyId:
          process.env.RAZORPAY_KEY_ID,

        pricing: {
          subtotal,
          deliveryCharge,
          discount:
            discountAmount,
          totalAmount
        }
      });

    } catch (error) {
      // ==========================================
      // ROLLBACK IF ANYTHING FAILS
      // ==========================================
      if (connection) {
        await connection.rollback();
      }

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

      const result =
        await finalizeOnlineOrder({
          razorpayOrderId:
            razorpay_order_id,

          razorpayPaymentId:
            razorpay_payment_id,

          razorpaySignature:
            razorpay_signature,

          userId: req.user.id
        });

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

        const result =
          await finalizeOnlineOrder({
            razorpayOrderId,
            razorpayPaymentId,
            razorpaySignature: null,
            userId: null
          });

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