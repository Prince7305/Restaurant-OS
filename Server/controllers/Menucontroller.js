const MenuItem = require('../models/MenuItem');

// @desc    Add a new menu item
// @route   POST /api/menu
exports.createMenuItem = async (req, res) => {
    try {
        const { restaurantId, name, description, price, category, imageUrl } = req.body;

        if (!restaurantId || !name || !price || !category) {
            return res.status(400).json({
                message: 'restaurantId, name, price and category are required',
            });
        }

        const menuItem = await MenuItem.create({
            restaurantId,
            name,
            description,
            price,
            category,
            imageUrl,
        });

        res.status(201).json(menuItem);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all menu items for a restaurant (customer-facing menu)
// @route   GET /api/menu/restaurant/:restaurantId
exports.getMenuByRestaurant = async (req, res) => {
    try {
        const { onlyAvailable } = req.query;

        // Build the filter dynamically:
        // customer app calls this with ?onlyAvailable=true so sold-out items don't show
        // admin dashboard calls it without the flag, to see everything including hidden items
        const filter = { restaurantId: req.params.restaurantId };
        if (onlyAvailable === 'true') {
            filter.isAvailable = true;
        }

        const items = await MenuItem.find(filter).sort({ category: 1, name: 1 });
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a menu item (price, description, availability, etc.)
// @route   PATCH /api/menu/:id
exports.updateMenuItem = async (req, res) => {
    try {
        const menuItem = await MenuItem.findByIdAndUpdate(req.params.id, req.body, {
            new: true, // return the updated document, not the old one
            runValidators: true, // re-check schema rules (e.g. price min: 0) on update too
        });

        if (!menuItem) {
            return res.status(404).json({ message: 'Menu item not found' });
        }

        res.json(menuItem);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Permanently delete a menu item
// @route   DELETE /api/menu/:id
exports.deleteMenuItem = async (req, res) => {
    try {
        const menuItem = await MenuItem.findByIdAndDelete(req.params.id);

        if (!menuItem) {
            return res.status(404).json({ message: 'Menu item not found' });
        }

        res.json({ message: 'Menu item deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};