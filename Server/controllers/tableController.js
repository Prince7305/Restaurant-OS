const Table = require('../models/Table');
const QRCode = require('qrcode');

// @desc    Create a new table for a restaurant + generate its QR code
// @route   POST /api/tables   (protected — admin only)
exports.createTable = async (req, res) => {
  try {
    // SECURITY: restaurantId comes from the JWT (req.user), never from the
    // request body. Otherwise an admin could pass someone else's restaurantId
    // and create tables inside a restaurant they don't own.
    const restaurantId = req.user.restaurantId;
    const { tableNumber, capacity } = req.body;

    if (!tableNumber) {
      return res.status(400).json({ message: 'tableNumber is required' });
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

// @desc    Get all tables for the logged-in admin's restaurant
// @route   GET /api/tables/restaurant/:restaurantId   (protected — admin only)
exports.getTablesByRestaurant = async (req, res) => {
  try {
    // We ignore req.params.restaurantId on purpose — an admin should only
    // ever see THEIR OWN restaurant's tables, determined by their token,
    // not by whatever ID they type into the URL.
    const tables = await Table.find({ restaurantId: req.user.restaurantId });
    res.json(tables);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update table status (available/occupied/preparing/payment-pending)
// @route   PATCH /api/tables/:id/status   (protected — admin only)
exports.updateTableStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['available', 'occupied', 'preparing', 'payment-pending'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    // First fetch the table so we can check ownership BEFORE updating anything
    const existingTable = await Table.findById(req.params.id);
    if (!existingTable) {
      return res.status(404).json({ message: 'Table not found' });
    }

    // IDOR CHECK: does this table actually belong to the logged-in admin's restaurant?
    if (existingTable.restaurantId.toString() !== req.user.restaurantId.toString()) {
      return res.status(403).json({ message: 'You do not have access to this table' });
    }

    const table = await Table.findByIdAndUpdate(req.params.id, { status }, { new: true });

    res.json(table);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};