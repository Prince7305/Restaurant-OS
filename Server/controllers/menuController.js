const MenuItem = require('../models/MenuItem');

// @desc    Add a new menu item
// @route   POST /api/menu   (protected — admin only)
exports.createMenuItem = async (req, res) => {
    try {
        const restaurantId = req.user.restaurantId; // from token, not body
        const { name, description, price, category, imageUrl } = req.body;

        if (!name || !price || !category) {
            return res.status(400).json({
                message: 'name, price and category are required',
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
// @route   PATCH /api/menu/:id   (protected — admin only)
exports.updateMenuItem = async (req, res) => {
    try {
        const existingItem = await MenuItem.findById(req.params.id);
        if (!existingItem) {
            return res.status(404).json({ message: 'Menu item not found' });
        }

        // IDOR CHECK: this item must belong to the logged-in admin's own restaurant
        if (existingItem.restaurantId.toString() !== req.user.restaurantId.toString()) {
            return res.status(403).json({ message: 'You do not have access to this menu item' });
        }

        const menuItem = await MenuItem.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        res.json(menuItem);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Permanently delete a menu item
// @route   DELETE /api/menu/:id   (protected — admin only)
exports.deleteMenuItem = async (req, res) => {
    try {
        const existingItem = await MenuItem.findById(req.params.id);
        if (!existingItem) {
            return res.status(404).json({ message: 'Menu item not found' });
        }

        if (existingItem.restaurantId.toString() !== req.user.restaurantId.toString()) {
            return res.status(403).json({ message: 'You do not have access to this menu item' });
        }

        await MenuItem.findByIdAndDelete(req.params.id);

        res.json({ message: 'Menu item deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};