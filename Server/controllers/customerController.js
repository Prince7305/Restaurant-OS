const Customer = require('../models/Customer');

// @desc    Get all customers for the logged-in admin's restaurant (CRM view)
// @route   GET /api/customers/restaurant/:restaurantId   (protected — admin only)
exports.getCustomersByRestaurant = async (req, res) => {
    try {
        const customers = await Customer.find({ restaurantId: req.user.restaurantId }).sort({
            visitCount: -1,
        });
        res.json(customers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};