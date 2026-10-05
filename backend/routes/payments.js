const express = require('express');
const Razorpay = require('razorpay');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

router.post('/initiate', authenticateToken, async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment amount.'
      });
    }

    const amountInPaise = Math.round(Number(amount) * 100);

    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`
    };

    const razorpayOrder = await razorpay.orders.create(options);

    res.json({
      success: true,
      message: 'Razorpay order created successfully.',
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID
    });

  } catch (error) {
    console.error('Razorpay order creation error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to create Razorpay order.'
    });
  }
});


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


module.exports = router;