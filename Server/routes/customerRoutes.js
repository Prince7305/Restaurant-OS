const express = require('express');
const router = express.Router();
const { getCustomersByRestaurant } = require('../controllers/customerController');

router.get('/restaurant/:restaurantId', getCustomersByRestaurant);

module.exports = router;