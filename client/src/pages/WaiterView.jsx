import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import api from '../api/axiosConfig';

function WaiterView() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    useEffect(() => {
        if (!token || !user) navigate('/admin/login');
    }, [token, user, navigate]);

    // Load only the orders that are already 'ready' — the backend's
    // ?status= filter (built back in the Order module) does the work here.
    useEffect(() => {
        if (!token) return;
        async function loadReadyOrders() {
            try {
                const res = await api.get(
                    `/orders/restaurant/${user.restaurantId}?status=ready`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setOrders(res.data);
            } catch (err) {
                console.error('Failed to load orders', err);
            } finally {
                setLoading(false);
            }
        }
        loadReadyOrders();
    }, [token]);

    // Same live-sync pattern as the Kitchen Dashboard, but this screen only
    // cares about orders entering or leaving the 'ready' state.
    useEffect(() => {
        if (!user) return;
        const socket = io('http://localhost:5000');

        socket.on('connect', () => socket.emit('joinRestaurant', user.restaurantId));

        socket.on('orderStatusUpdated', (updatedOrder) => {
            setOrders((prev) => {
                const alreadyListed = prev.some((o) => o._id === updatedOrder._id);

                if (updatedOrder.status === 'ready') {
                    // Just became ready (or was already here and got re-updated) — show/update it
                    return alreadyListed
                        ? prev.map((o) => (o._id === updatedOrder._id ? updatedOrder : o))
                        : [updatedOrder, ...prev];
                }
                // Moved to 'served' (or anything else) — it no longer belongs on this screen
                return prev.filter((o) => o._id !== updatedOrder._id);
            });
        });

        return () => socket.disconnect();
    }, [user]);

    const markServed = async (order) => {
        try {
            await api.patch(
                `/orders/${order._id}/status`,
                { status: 'served' },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            // No manual state update needed — the socket listener above removes
            // it from the list as soon as the 'orderStatusUpdated' event arrives.
        } catch (err) {
            console.error('Failed to mark as served', err);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/admin/login');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-paper">
                <p className="font-body text-ink/60">Loading…</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-paper">
            <header className="bg-charcoal text-paper px-6 py-5 flex items-center justify-between">
                <h1 className="font-display text-2xl">Waiter</h1>
                <div className="flex items-center gap-4">
                    <Link to="/admin/kitchen" className="font-body text-sm text-paper/60">
                        Kitchen
                    </Link>
                    <Link to="/admin/dashboard" className="font-body text-sm text-paper/60">
                        Dashboard
                    </Link>
                    <button onClick={handleLogout} className="font-body text-sm text-paper/60">
                        Sign out
                    </button>
                </div>
            </header>

            <main className="p-4 md:p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {orders.map((order) => (
                    <div key={order._id} className="bg-white border border-sage rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                            <p className="font-display text-xl">Table {order.tableId?.tableNumber ?? '—'}</p>
                            <span className="font-body text-xs text-sage bg-sage/10 rounded-full px-2 py-1">
                                Ready
                            </span>
                        </div>

                        <ul className="font-body text-sm text-ink/70 mb-4 space-y-0.5">
                            {order.items.map((item, i) => (
                                <li key={i}>
                                    {item.quantity} × {item.name}
                                </li>
                            ))}
                        </ul>

                        <button
                            onClick={() => markServed(order)}
                            className="w-full font-body text-sm font-medium bg-sage text-white rounded-lg py-2"
                        >
                            Mark as Served
                        </button>
                    </div>
                ))}

                {orders.length === 0 && (
                    <p className="font-body text-ink/40 text-sm col-span-full">
                        No orders waiting to be served right now.
                    </p>
                )}
            </main>
        </div>
    );
}

export default WaiterView;