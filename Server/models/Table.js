const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
    },
    tableNumber: {
      type: Number,
      required: true,
    },
    qrCodeUrl: {
      // Data URL / image string of the generated QR code
      type: String,
    },
    status: {
      type: String,
      enum: ['available', 'occupied', 'preparing', 'payment-pending'],
      default: 'available',
    },
    capacity: {
      type: Number,
      default: 4,
    },
  },
  { timestamps: true }
);

// A restaurant shouldn't have two tables with the same number
tableSchema.index(
  { restaurantId: 1, tableNumber: 1 },
  { unique: true }
);

module.exports = mongoose.model('Table', tableSchema);
