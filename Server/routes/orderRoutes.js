const express = require('express');
const router = express.Router();
const {
    createOrder,
    getOrdersByRestaurant,
    updateOrderStatus,
    getOrderById,
} = require('../controllers/orderController');

router.post('/', createOrder);
router.get('/restaurant/:restaurantId', getOrdersByRestaurant);
router.patch('/:id/status', updateOrderStatus);
router.get('/:id', getOrderById);

module.exports = router;