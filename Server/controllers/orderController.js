const Order = require('../models/Order');
const Customer = require('../models/Customer');
const MenuItem = require('../models/MenuItem');
const Table = require('../models/Table');
const { getIO } = require('../Socket');

// @desc    Place a new order (customer checkout — no login, just name + phone)
// @route   POST /api/orders
exports.createOrder = async (req, res) => {
    try {
        const { restaurantId, tableId, customerName, customerPhone, items, paymentMode } = req.body;

        if (!restaurantId || !tableId || !customerName || !customerPhone || !items || !items.length) {
            return res.status(400).json({ message: 'Missing required order details' });
        }

        // STEP 1: Find or create the customer by phone number (CRM identity)
        // This is the "no login" flow — phone number is the unique key.
        let customer = await Customer.findOne({ restaurantId, phone: customerPhone });

        if (customer) {
            // Returning customer — update their visit stats
            customer.visitCount += 1;
            customer.lastVisit = Date.now();
            customer.name = customerName; // keep name in sync in case they typed it differently
        } else {
            // First-time customer — create a fresh CRM record
            customer = new Customer({
                restaurantId,
                name: customerName,
                phone: customerPhone,
            });
        }

        // STEP 2: Rebuild the items list from the DATABASE, not from what the client sent.
        // SECURITY REASON: if we trusted req.body.items[i].price directly, a malicious
        // customer could open dev tools, edit the network request, and set price: 1
        // for a ₹500 item. So we look up the real MenuItem for each item ourselves.
        let totalAmount = 0;
        const orderItems = [];

        for (const item of items) {
            const menuItem = await MenuItem.findById(item.menuItemId);

            if (!menuItem) {
                return res.status(404).json({ message: `Menu item not found: ${item.menuItemId}` });
            }
            if (!menuItem.isAvailable) {
                return res.status(400).json({ message: `${menuItem.name} is currently unavailable` });
            }

            const quantity = item.quantity || 1;
            const lineTotal = menuItem.price * quantity;
            totalAmount += lineTotal;

            orderItems.push({
                menuItemId: menuItem._id,
                name: menuItem.name,   // snapshot — see model comments on why
                price: menuItem.price, // snapshot — locks in today's price
                quantity,
            });
        }

        // STEP 3: Create the order
        const order = await Order.create({
            restaurantId,
            tableId,
            customerId: customer._id,
            items: orderItems,
            totalAmount,
            paymentMode,
        });

        // STEP 4: Update customer's total spend, then save
        customer.totalSpend += totalAmount;
        await customer.save();

        // STEP 5: Mark the table as occupied now that an active order exists
        await Table.findByIdAndUpdate(tableId, { status: 'occupied' });

        // STEP 6: Notify the Kitchen Dashboard in real time — no refresh needed.
        // We emit only to this restaurant's room, so other tenants don't see it.
        getIO().to(restaurantId.toString()).emit('newOrder', order);

        res.status(201).json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all orders for the logged-in admin's restaurant (Kitchen Dashboard)
// @route   GET /api/orders/restaurant/:restaurantId   (protected — admin only)
exports.getOrdersByRestaurant = async (req, res) => {
    try {
        const { status } = req.query;

        const filter = { restaurantId: req.user.restaurantId };
        if (status) {
            filter.status = status;
        }

        const orders = await Order.find(filter)
            .populate('tableId', 'tableNumber')
            .sort({ createdAt: 1 });

        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update order status (kitchen moves it through the workflow)
// @route   PATCH /api/orders/:id/status
exports.updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['pending', 'preparing', 'ready', 'served'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status value' });
        }

        const existingOrder = await Order.findById(req.params.id);
        if (!existingOrder) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // IDOR CHECK: this order must belong to the logged-in admin's own restaurant
        if (existingOrder.restaurantId.toString() !== req.user.restaurantId.toString()) {
            return res.status(403).json({ message: 'You do not have access to this order' });
        }

        const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });

        getIO().to(order.restaurantId.toString()).emit('orderStatusUpdated', order);

        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get a single order's details
// @route   GET /api/orders/:id
exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('tableId', 'tableNumber')
            .populate('customerId', 'name phone');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};