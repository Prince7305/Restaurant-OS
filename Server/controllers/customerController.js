const Customer = require('../models/Customer');

// @desc    Get all customers for a restaurant (CRM view)
// @route   GET /api/customers/restaurant/:restaurantId
exports.getCustomersByRestaurant = async (req, res) => {
    try {
        const customers = await Customer.find({ restaurantId: req.params.restaurantId }).sort({
            visitCount: -1, // most frequent customers first
        });
        res.json(customers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};