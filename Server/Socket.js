const { Server } = require('socket.io');

let io;

// Called once, when the HTTP server starts
function initSocket(httpServer) {
    io = new Server(httpServer, {
        cors: {
            origin: '*', // for development; restrict this to your real frontend domain in production
        },
    });

    io.on('connection', (socket) => {
        console.log(`Socket connected: ${socket.id}`);

        // A client (kitchen/waiter dashboard) tells us which restaurant it belongs to.
        // We put it in a "room" named after the restaurantId, so events for
        // Restaurant A never leak to Restaurant B's staff.
        socket.on('joinRestaurant', (restaurantId) => {
            socket.join(restaurantId);
            console.log(`Socket ${socket.id} joined room: ${restaurantId}`);
        });

        socket.on('disconnect', () => {
            console.log(`Socket disconnected: ${socket.id}`);
        });
    });

    return io;
}

// Controllers call this to get access to the already-initialized io instance
function getIO() {
    if (!io) {
        throw new Error('Socket.io not initialized yet');
    }
    return io;
}

module.exports = { initSocket, getIO };