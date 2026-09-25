const express = require('express');
const router = express.Router();

router.post('/initiate', (req, res) => {
  res.json({
    success: true,
    message: 'Payment gateway initialization scaffolding (Razorpay ready in future steps)',
    orderId: 'pay_order_mock_' + Date.now(),
    amount: req.body.amount,
    currency: 'USD'
  });
});

router.post('/verify', (req, res) => {
  res.json({
    success: true,
    message: 'Payment verification mock response',
    paymentStatus: 'SUCCESS'
  });
});

module.exports = router;
