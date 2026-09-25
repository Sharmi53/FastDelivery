const express = require('express');
const router = express.Router();

router.get('/assigned-orders', (req, res) => {
  res.json({
    success: true,
    deliveries: [
      {
        orderId: 'ORD-10929',
        customerName: 'Alice Smith',
        customerPhone: '+1 555-0199',
        pickupStore: 'FreshCart Store #4',
        deliveryAddress: '456 Oak Avenue, Apt 12',
        status: 'Out for Delivery',
        totalItems: 3
      }
    ]
  });
});

router.put('/update-status', (req, res) => {
  const { orderId, status } = req.body;
  res.json({
    success: true,
    message: `Delivery status for ${orderId} updated to ${status} (scaffolding)`
  });
});

module.exports = router;
