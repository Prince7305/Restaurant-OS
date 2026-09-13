const Table = require('../models/Table');
const QRCode = require('qrcode');

// @desc    Create a new table for a restaurant + generate its QR code
// @route   POST /api/tables
exports.createTable = async (req, res) => {
  try {
    const { restaurantId, tableNumber, capacity } = req.body;

    if (!restaurantId || !tableNumber) {
      return res.status(400).json({ message: 'restaurantId and tableNumber are required' });
    }

    // Create the table first so we have its _id to encode in the QR
    const table = await Table.create({ restaurantId, tableNumber, capacity });

    // The QR encodes a URL the customer's phone will open on scan.
    // Example: https://yourapp.com/table/<tableId>
    const baseUrl = process.env.CLIENT_BASE_URL || 'http://localhost:3000';
    const tableUrl = `${baseUrl}/table/${table._id}`;

    const qrCodeUrl = await QRCode.toDataURL(tableUrl);

    table.qrCodeUrl = qrCodeUrl;
    await table.save();

    res.status(201).json(table);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a single table's info (used when customer scans QR)
// @route   GET /api/tables/:id
exports.getTable = async (req, res) => {
  try {
    const table = await Table.findById(req.params.id).populate('restaurantId', 'name address');
    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }
    res.json(table);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all tables for a restaurant
// @route   GET /api/tables/restaurant/:restaurantId
exports.getTablesByRestaurant = async (req, res) => {
  try {
    const tables = await Table.find({ restaurantId: req.params.restaurantId });
    res.json(tables);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update table status (available/occupied/preparing/payment-pending)
// @route   PATCH /api/tables/:id/status
exports.updateTableStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['available', 'occupied', 'preparing', 'payment-pending'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const table = await Table.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }

    res.json(table);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
