const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    success: true,
    cart: {
      items: [],
      subtotal: 0,
      deliveryFee: 30,
      total: 30
    }
  });
});

router.post('/add', (req, res) => {
  const { productId, quantity } = req.body;
  res.json({
    success: true,
    message: 'Item added to cart scaffolding',
    item: { productId, quantity: quantity || 1 }
  });
});

module.exports = router;
