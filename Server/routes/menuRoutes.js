const express = require('express');
const router = express.Router();
const {
    createMenuItem,
    getMenuByRestaurant,
    updateMenuItem,
    deleteMenuItem,
} = require('../controllers/menuController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('admin'), createMenuItem);
router.patch('/:id', protect, authorize('admin'), updateMenuItem);
router.delete('/:id', protect, authorize('admin'), deleteMenuItem);

// PUBLIC — customers browse the menu after scanning the QR, with no login
router.get('/restaurant/:restaurantId', getMenuByRestaurant);

module.exports = router;