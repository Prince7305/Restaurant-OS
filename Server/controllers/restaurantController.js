const Restaurant = require('../models/Restaurant');
const bcrypt = require('bcryptjs');

// @desc    Register a new restaurant (admin signup)
// @route   POST /api/restaurants
exports.createRestaurant = async (req, res) => {
  try {
    const { name, ownerName, email, password, address, phone } = req.body;

    if (!name || !ownerName || !email || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const existing = await Restaurant.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Restaurant with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const restaurant = await Restaurant.create({
      name,
      ownerName,
      email,
      password: hashedPassword,
      address,
      phone,
    });

    res.status(201).json({
      _id: restaurant._id,
      name: restaurant.name,
      email: restaurant.email,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a single restaurant by id
// @route   GET /api/restaurants/:id
exports.getRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id).select('-password');
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
