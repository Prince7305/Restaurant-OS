import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import api from '../api/axiosConfig';

const STATUS_FLOW = ['pending', 'preparing', 'ready'];

const STATUS_LABELS = {
  pending: 'Pending',
  preparing: 'Preparing',
  ready: 'Ready',
};

function KitchenDashboard() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrder, setUpdatingOrder] = useState(null);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  // Auth guard
  useEffect(() => {
    if (!token || !user) {
      navigate('/admin/login');
    }
  }, [token, user, navigate]);

  // Initial order snapshot
  useEffect(() => {
    if (!token || !user?.restaurantId) return;

    async function loadOrders() {
      try {
        const res = await api.get(
          `/orders/restaurant/${user.restaurantId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setOrders(res.data);
      } catch (err) {
        console.error('Failed to load orders', err);
        setError('Could not load kitchen orders.');
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, [token, user?.restaurantId]);

  // Real-time order updates
  useEffect(() => {
    if (!user?.restaurantId) return;

    const socket = io('http://localhost:5000');

    socket.on('connect', () => {
      socket.emit('joinRestaurant', user.restaurantId);
    });

    socket.on('newOrder', (newOrder) => {
      setOrders((prev) => {
        const exists = prev.some((order) => order._id === newOrder._id);
        return exists ? prev : [newOrder, ...prev];
      });
    });

    socket.on('orderStatusUpdated', (updatedOrder) => {
      setOrders((prev) => {
        const exists = prev.some(
          (order) => order._id === updatedOrder._id
        );

        if (!exists) return [updatedOrder, ...prev];

        return prev.map((order) =>
          order._id === updatedOrder._id ? updatedOrder : order
        );
      });
    });

    return () => socket.disconnect();
  }, [user?.restaurantId]);

  // Move order to next kitchen status
  const advanceStatus = async (order) => {
    const currentIndex = STATUS_FLOW.indexOf(order.status);
    const nextStatus = STATUS_FLOW[currentIndex + 1];

    if (!nextStatus || updatingOrder === order._id) return;

    setUpdatingOrder(order._id);
    setError('');

    try {
      await api.patch(
        `/orders/${order._id}/status`,
        { status: nextStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    } catch (err) {
      console.error('Failed to update status', err);
      setError('Could not update order status.');
    } finally {
      setUpdatingOrder(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/admin/login');
  };

  const columns = STATUS_FLOW.map((status) => ({
    status,
    orders: orders.filter((order) => order.status === status),
  }));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <p className="font-body text-ink/60">Loading orders…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper">
      {/* Header */}
      <header className="bg-charcoal text-paper px-5 md:px-6 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div>
            <p className="font-body text-xs uppercase tracking-wider text-paper/40">
              RestaurantOS
            </p>

            <h1 className="font-display text-2xl mt-1">
              Kitchen
            </h1>
          </div>

          <nav className="flex items-center gap-3 md:gap-5">
            <Link
              to="/admin/waiter"
              className="font-body text-sm text-paper/60 hover:text-paper"
            >
              Waiter
            </Link>

            <Link
              to="/admin/dashboard"
              className="font-body text-sm text-paper/60 hover:text-paper"
            >
              Dashboard
            </Link>

            <button
              onClick={handleLogout}
              className="font-body text-sm text-paper/60 hover:text-paper"
            >
              Sign out
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        {/* Error */}
        {error && (
          <div className="mb-5 bg-paprika/10 border border-paprika/20 rounded-lg px-4 py-3 flex items-center justify-between gap-4">
            <p className="font-body text-sm text-paprika-dark">
              {error}
            </p>

            <button
              onClick={() => setError('')}
              className="text-paprika"
              aria-label="Close error"
            >
              ×
            </button>
          </div>
        )}

        {/* Status columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {columns.map((column) => (
            <section key={column.status}>
              <div className="flex items-center justify-between mb-3 px-1">
                <h2 className="font-body text-sm font-semibold text-ink/60 uppercase tracking-wide">
                  {STATUS_LABELS[column.status]}
                </h2>

                <span className="font-body text-xs text-ink/40">
                  {column.orders.length}
                </span>
              </div>

              <div className="space-y-3">
                {column.orders.map((order) => {
                  const nextIndex =
                    STATUS_FLOW.indexOf(order.status) + 1;

                  const nextStatus = STATUS_FLOW[nextIndex];

                  return (
                    <article
                      key={order._id}
                      className="bg-white border border-line rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <p className="font-display text-lg text-ink">
                            Table {order.tableId?.tableNumber ?? '—'}
                          </p>

                          <p className="font-body text-xs text-ink/40 mt-1">
                            {new Date(order.createdAt).toLocaleTimeString(
                              [],
                              {
                                hour: '2-digit',
                                minute: '2-digit',
                              }
                            )}
                          </p>
                        </div>

                        <span className="font-body text-xs px-2 py-1 rounded-full bg-paper text-ink/50">
                          {STATUS_LABELS[order.status]}
                        </span>
                      </div>

                      <ul className="font-body text-sm text-ink/70 space-y-1 mb-3">
                        {order.items.map((item, index) => (
                          <li key={index}>
                            {item.quantity} × {item.name}
                          </li>
                        ))}
                      </ul>

                      <div className="flex items-center justify-between border-t border-line pt-3 mb-3">
                        <span className="font-body text-xs text-ink/40">
                          Total
                        </span>

                        <span className="font-body text-sm font-semibold text-ink">
                          ₹{order.totalAmount}
                        </span>
                      </div>

                      {nextStatus && (
                        <button
                          onClick={() => advanceStatus(order)}
                          disabled={updatingOrder === order._id}
                          className="w-full font-body text-sm font-medium bg-paprika text-white rounded-lg py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {updatingOrder === order._id
                            ? 'Updating…'
                            : `Mark as ${STATUS_LABELS[nextStatus]}`}
                        </button>
                      )}
                    </article>
                  );
                })}

                {column.orders.length === 0 && (
                  <div className="bg-white/50 border border-dashed border-line rounded-lg px-4 py-8 text-center">
                    <p className="font-body text-sm text-ink/30">
                      No orders
                    </p>
                  </div>
                )}
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}

export default KitchenDashboard;