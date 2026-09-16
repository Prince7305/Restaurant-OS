const express = require('express');
const router = express.Router();
const { getCustomersByRestaurant } = require('../controllers/customerController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/restaurant/:restaurantId', protect, authorize('admin'), getCustomersByRestaurant);

module.exports = router;