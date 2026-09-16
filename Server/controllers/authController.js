const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');

// Helper — creates a signed JWT containing the identity info we'll need
// on every request: who is this user, what role, which restaurant (if any).
const generateToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
            role: user.role,
            restaurantId: user.restaurantId || null,
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
};

// @desc    Restaurant owner signup — creates the Restaurant AND the admin User together.
//          We combine these two steps into one because from the user's point of view,
//          "signing up my restaurant" IS "creating my restaurant + my login" at once.
// @route   POST /api/auth/register-admin
exports.registerAdmin = async (req, res) => {
    try {
        const { restaurantName, address, phone, name, email, password } = req.body;

        if (!restaurantName || !name || !email || !password) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'A user with this email already exists' });
        }

        // Step 1: create the business entity
        const restaurant = await Restaurant.create({
            name: restaurantName,
            address,
            phone,
        });

        // Step 2: create the admin user, linked to that restaurant
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: 'admin',
            restaurantId: restaurant._id,
        });

        const token = generateToken(user);

        res.status(201).json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                restaurantId: user.restaurantId,
            },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Login for restaurant Admins — this is the PUBLIC, visible login page
// @route   POST /api/auth/login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const user = await User.findOne({ email });

        // Notice: we check role !== 'admin' here too. Even if someone enters
        // correct superadmin credentials on THIS endpoint, we reject them with
        // the exact same generic message — so there's no way to tell from the
        // outside whether the email belongs to an admin, a superadmin, or nobody.
        if (!user || user.role !== 'admin') {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = generateToken(user);

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                restaurantId: user.restaurantId,
            },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Login for Super Admin ONLY — this endpoint is never linked from any
//          visible UI. Only someone who already knows this exact URL can reach it.
// @route   POST /api/auth/superadmin-login
exports.superAdminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const user = await User.findOne({ email });

        if (!user || user.role !== 'superadmin') {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = generateToken(user);

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};