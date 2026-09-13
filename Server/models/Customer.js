const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema(
    {
        restaurantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Restaurant',
            required: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        phone: {
            type: String,
            required: true,
            trim: true,
        },
        visitCount: {
            type: Number,
            default: 1,
        },
        totalSpend: {
            type: Number,
            default: 0,
        },
        lastVisit: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

// Same phone number can exist for different restaurants (different tenants),
// but within ONE restaurant, a phone number should map to exactly one customer record.
customerSchema.index({ restaurantId: 1, phone: 1 }, { unique: true });

module.exports = mongoose.model('Customer', customerSchema);