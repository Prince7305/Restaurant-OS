const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: ['superadmin', 'admin'], // 'kitchen' and 'waiter' can be added here later
            required: true,
        },
        restaurantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Restaurant',
            // Required ONLY for admins — a superadmin isn't tied to one restaurant.
            // This is a conditional requirement, enforced in the validator below.
            required: function () {
                return this.role === 'admin';
            },
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);