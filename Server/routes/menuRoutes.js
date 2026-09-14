const express = require('express');
const router = express.Router();
const {
    createMenuItem,
    getMenuByRestaurant,
    updateMenuItem,
    deleteMenuItem,
} = require('../controllers/menuController');

router.post('/', createMenuItem);
router.get('/restaurant/:restaurantId', getMenuByRestaurant);
router.patch('/:id', updateMenuItem);
router.delete('/:id', deleteMenuItem);

module.exports = router;