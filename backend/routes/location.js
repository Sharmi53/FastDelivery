const express = require('express');
const router = express.Router();

router.get('/nearby-stores', (req, res) => {
  res.json({
    success: true,
    stores: [
      { id: 101, name: 'FreshCart Superstore - Downtown', distance: '1.2 km', estDeliveryTime: '20-30 mins' },
      { id: 102, name: 'FreshCart Express - Westside', distance: '2.5 km', estDeliveryTime: '30-40 mins' }
    ]
  });
});

module.exports = router;
