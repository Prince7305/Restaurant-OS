const express = require('express');
const router = express.Router();
const { createRestaurant, getRestaurant } = require('../controllers/restaurantController');

router.post('/', createRestaurant);
router.get('/:id', getRestaurant);

module.exports = router;
