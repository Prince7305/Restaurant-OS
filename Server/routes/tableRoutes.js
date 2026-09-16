const express = require('express');
const router = express.Router();
const {
  createTable,
  getTable,
  getTablesByRestaurant,
  updateTableStatus,
} = require('../controllers/tableController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Admin-only actions — require a valid token AND the 'admin' role
router.post('/', protect, authorize('admin'), createTable);
router.get('/restaurant/:restaurantId', protect, authorize('admin'), getTablesByRestaurant);
router.patch('/:id/status', protect, authorize('admin'), updateTableStatus);

// PUBLIC — a customer scans a QR code and hits this with no login at all.
// This must stay open, or the entire "no login for customers" design breaks.
router.get('/:id', getTable);

module.exports = router;