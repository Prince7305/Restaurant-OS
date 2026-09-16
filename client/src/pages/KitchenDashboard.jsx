import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import api from '../api/axiosConfig';

const STATUS_FLOW = ['pending', 'preparing', 'ready', 'served'];
const STATUS_LABELS = {
  pending: 'Pending',
  preparing: 'Preparing',
  ready: 'Ready',
  served: 'Served',
};

function KitchenDashboard() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  // STEP 1: Guard — if there's no token, this page has no business being open.
  // Redirect straight to login instead of showing a broken/empty dashboard.
  useEffect(() => {
    if (!token || !user) {
      navigate('/admin/login');
    }
  }, [token, user, navigate]);

  // STEP 2: Load existing orders once on mount (REST — the initial snapshot)
  useEffect(() => {
    if (!token) return;

    async function loadOrders() {
      try {
        const res = await api.get(`/orders/restaurant/${user.restaurantId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(res.data);
      } catch (err) {
        console.error('Failed to load orders', err);
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, [token]);

  // STEP 3: Connect Socket.io for live updates (WebSocket — everything AFTER the snapshot)
  // This is the exact same pattern we proved worked in test-socket.html,
  // just now wired into a real React component instead of raw HTML.
  useEffect(() => {
    if (!user) return;

    const socket = io('http://localhost:5000');

    socket.on('connect', () => {
      socket.emit('joinRestaurant', user.restaurantId);
    });

    // A brand new order came in — add it to the top of the list
    socket.on('newOrder', (newOrder) => {
      setOrders((prev) => [newOrder, ...prev]);
    });

    // An order's status changed (possibly from another device/tab) — update it in place
    socket.on('orderStatusUpdated', (updatedOrder) => {
      setOrders((prev) =>
        prev.map((o) => (o._id === updatedOrder._id ? updatedOrder : o))
      );
    });

    // Cleanup: disconnect when this component unmounts, so we don't leak
    // sockets every time the dashboard is opened/closed.
    return () => socket.disconnect();
  }, [user]);

  const advanceStatus = async (order) => {
    const currentIndex = STATUS_FLOW.indexOf(order.status);
    const nextStatus = STATUS_FLOW[currentIndex + 1];
    if (!nextStatus) return; // already 'served', nothing further to do

    try {
      await api.patch(
        `/orders/${order._id}/status`,
        { status: nextStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Note: we don't need to manually update state here — the
      // 'orderStatusUpdated' socket event we're listening to above will
      // fire and update it for us. This keeps ALL tabs/devices in sync,
      // not just the one that clicked the button.
    } catch (err) {
      console.error('Failed to update status', err);
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
        <p className="font-body text-ink/60">Loading orders…</p>
      </div>
    );
  }

  // Group orders into columns by status, oldest active orders first
  const activeOrders = orders.filter((o) => o.status !== 'served');
  const columns = STATUS_FLOW.slice(0, 3).map((status) => ({
    status,
    orders: activeOrders.filter((o) => o.status === status),
  }));

  return (
    <div className="min-h-screen bg-paper">
      <header className="bg-charcoal text-paper px-6 py-5 flex items-center justify-between">
        <h1 className="font-display text-2xl">Kitchen</h1>
        <button onClick={handleLogout} className="font-body text-sm text-paper/60">
          Sign out
        </button>
      </header>

      <main className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {columns.map((col) => (
          <div key={col.status}>
            <h2 className="font-body text-sm font-semibold text-ink/50 uppercase tracking-wide mb-3 px-1">
              {STATUS_LABELS[col.status]} · {col.orders.length}
            </h2>

            <div className="space-y-3">
              {col.orders.map((order) => (
                <div
                  key={order._id}
                  className="bg-white border border-line rounded-lg p-4"
                >
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-display text-lg">
                      Table {order.tableId?.tableNumber ?? '—'}
                    </p>
                    <p className="font-body text-xs text-ink/40">
                      {new Date(order.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>

                  <ul className="font-body text-sm text-ink/70 mb-3 space-y-0.5">
                    {order.items.map((item, i) => (
                      <li key={i}>
                        {item.quantity} × {item.name}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => advanceStatus(order)}
                    className="w-full font-body text-sm font-medium bg-paprika text-white rounded-lg py-2"
                  >
                    Mark as {STATUS_LABELS[STATUS_FLOW[STATUS_FLOW.indexOf(order.status) + 1]]}
                  </button>
                </div>
              ))}

              {col.orders.length === 0 && (
                <p className="font-body text-sm text-ink/30 px-1">No orders</p>
              )}
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}

export default KitchenDashboard;
