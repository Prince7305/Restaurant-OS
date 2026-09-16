const jwt = require('jsonwebtoken');

// STEP 1: "protect" — checks that a valid JWT was sent. Runs BEFORE the
// controller. If the token is missing/invalid, the request never reaches
// the controller at all.
exports.protect = (req, res, next) => {
    const authHeader = req.headers.authorization; // expected format: "Bearer <token>"

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Not authorized, no token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Attach the decoded identity to the request so every controller
        // downstream can read req.user.role, req.user.restaurantId, etc.
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Not authorized, invalid token' });
    }
};

// STEP 2: "authorize" — a second, optional gate that checks the user's ROLE.
// Usage: router.post('/', protect, authorize('admin'), createSomething)
// It's a function that RETURNS a middleware, so we can pass in which
// roles are allowed for this specific route.
exports.authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: 'You do not have permission to do this' });
        }
        next();
    };
};