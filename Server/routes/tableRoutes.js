const express = require('express');
const router = express.Router();
const {
  createTable,
  getTable,
  getTablesByRestaurant,
  updateTableStatus,
} = require('../controllers/tableController');

router.post('/', createTable);
router.get('/restaurant/:restaurantId', getTablesByRestaurant);
router.get('/:id', getTable);
router.patch('/:id/status', updateTableStatus);

module.exports = router;
