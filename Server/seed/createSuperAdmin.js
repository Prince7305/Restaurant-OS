// Run this ONCE from the server/ folder with: node seed/createSuperAdmin.js
// This is intentionally NOT an API endpoint — superadmin should never be
// publicly self-registrable (see authController.js comments for why).

require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

async function createSuperAdmin() {
    await mongoose.connect(process.env.MONGO_URI);

    const email = 'superadmin@restaurantos.com'; // change if you like
    const plainPassword = 'ChangeThisPassword123'; // CHANGE THIS before running

    const existing = await User.findOne({ email });
    if (existing) {
        console.log('Super Admin already exists with this email.');
        process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(plainPassword, salt);

    const superAdmin = await User.create({
        name: 'Super Admin',
        email,
        password: hashedPassword,
        role: 'superadmin',
        // no restaurantId — superadmin isn't tied to one restaurant
    });

    console.log('Super Admin created:', superAdmin.email);
    process.exit(0);
}

createSuperAdmin().catch((err) => {
    console.error(err);
    process.exit(1);
});