const express = require('express');
const router = express.Router();
const {
    createOrder,
    getOrdersByRestaurant,
    updateOrderStatus,
    getOrderById,
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/authMiddleware');

// PUBLIC — customer places the order after checkout, with no login at all
router.post('/', createOrder);

// Admin/kitchen-only
router.get('/restaurant/:restaurantId', protect, authorize('admin'), getOrdersByRestaurant);
router.patch('/:id/status', protect, authorize('admin'), updateOrderStatus);

router.get('/:id', getOrderById);

module.exports = router;