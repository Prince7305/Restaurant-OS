import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

import MenuManagement from '../components/MenuManagement';
import TableManagement from '../components/TableManagement';

const AdminDashboard = () => {
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const storedUser = localStorage.getItem('user');

  const user = storedUser ? JSON.parse(storedUser) : null;

  const [activeTab, setActiveTab] = useState('overview');

  const [dashboardData, setDashboardData] = useState({
    menuItems: 0,
    tables: 0,
    occupiedTables: 0,
    customers: 0,
    activeOrders: 0,
    pendingOrders: 0,
    preparingOrders: 0,
    readyOrders: 0,
    recentOrders: [],
  });

  useEffect(() => {
    if (!token || !user) {
      navigate('/admin/login');
    }
  }, [token, user, navigate]);

  useEffect(() => {
    if (!token || !user?.restaurantId) return;

    const fetchDashboardData = async () => {
      try {
        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const [
          menuRes,
          tablesRes,
          customersRes,
          ordersRes,
        ] = await Promise.all([
          axios.get(
            `http://localhost:5000/api/menu/restaurant/${user.restaurantId}`,
            { headers }
          ),

          axios.get(
            `http://localhost:5000/api/tables/restaurant/${user.restaurantId}`,
            { headers }
          ),

          axios.get(
            `http://localhost:5000/api/customers/restaurant/${user.restaurantId}`,
            { headers }
          ),

          axios.get(
            `http://localhost:5000/api/orders/restaurant/${user.restaurantId}`,
            { headers }
          ),
        ]);

        const menuItems = menuRes.data;
        const tables = tablesRes.data;
        const customers = customersRes.data;
        const orders = ordersRes.data;

        const pendingOrders = orders.filter(
          (order) => order.status === 'pending'
        );

        const preparingOrders = orders.filter(
          (order) => order.status === 'preparing'
        );

        const readyOrders = orders.filter(
          (order) => order.status === 'ready'
        );

        setDashboardData({
          menuItems: menuItems.length,

          tables: tables.length,

          occupiedTables: tables.filter(
            (table) => table.status === 'occupied'
          ).length,

          customers: customers.length,

          activeOrders:
            pendingOrders.length +
            preparingOrders.length +
            readyOrders.length,

          pendingOrders: pendingOrders.length,

          preparingOrders: preparingOrders.length,

          readyOrders: readyOrders.length,

          recentOrders: orders.slice(0, 5),
        });
      } catch (error) {
        console.error(
          'Failed to load dashboard data:',
          error
        );
      }
    };

    fetchDashboardData();
  }, [token, user?.restaurantId]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    navigate('/admin/login');
  };

  if (!token || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-paper text-ink">

      {/* Header */}
      <header className="border-b border-line bg-paper">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

          <div>
            <Link
              to="/admin/dashboard"
              className="font-display text-2xl text-ink"
            >
              RestaurantOS
            </Link>

            <p className="font-body text-xs text-ink/40 mt-1">
              {user.name}
            </p>
          </div>

          <div className="flex items-center gap-4">

            <Link
              to="/admin/kitchen"
              className="font-body text-sm text-ink/60 hover:text-ink transition"
            >
              Kitchen
            </Link>

            <Link
              to="/admin/waiter"
              className="font-body text-sm text-ink/60 hover:text-ink transition"
            >
              Waiter
            </Link>

            <button
              onClick={handleLogout}
              className="font-body text-sm text-paprika hover:underline"
            >
              Sign out
            </button>

          </div>
        </div>
      </header>

      {/* Navigation */}
      <div className="border-b border-line bg-paper">
        <div className="max-w-7xl mx-auto px-6">

          <div className="flex items-center gap-6 overflow-x-auto">

            {['overview', 'menu', 'tables'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 font-body text-sm capitalize border-b-2 transition whitespace-nowrap ${activeTab === tab
                    ? 'border-paprika text-ink'
                    : 'border-transparent text-ink/40 hover:text-ink'
                  }`}
              >
                {tab}
              </button>
            ))}

          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">

        {/* ================= OVERVIEW ================= */}
        {activeTab === 'overview' && (
          <section>

            {/* Intro */}
            <div className="mb-8">

              <p className="font-body text-sm text-paprika mb-2">
                Restaurant operations
              </p>

              <h1 className="font-display text-4xl sm:text-5xl text-ink">
                Good evening, {user.name}
              </h1>

              <p className="font-body text-sm text-ink/50 mt-3">
                Here's what's happening in your restaurant.
              </p>

            </div>

            {/* Main Statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

              {/* Active Orders */}
              <div className="border border-line bg-white rounded-xl p-5">

                <p className="font-body text-xs text-ink/40 uppercase tracking-wider">
                  Active orders
                </p>

                <p className="font-display text-3xl text-ink mt-3">
                  {dashboardData.activeOrders}
                </p>

              </div>

              {/* Tables */}
              <div className="border border-line bg-white rounded-xl p-5">

                <p className="font-body text-xs text-ink/40 uppercase tracking-wider">
                  Tables
                </p>

                <div className="flex items-baseline gap-2 mt-3">

                  <p className="font-display text-3xl text-ink">
                    {dashboardData.occupiedTables}
                  </p>

                  <span className="font-body text-sm text-ink/40">
                    / {dashboardData.tables} occupied
                  </span>

                </div>

              </div>

              {/* Menu Items */}
              <div className="border border-line bg-white rounded-xl p-5">

                <p className="font-body text-xs text-ink/40 uppercase tracking-wider">
                  Menu items
                </p>

                <p className="font-display text-3xl text-ink mt-3">
                  {dashboardData.menuItems}
                </p>

              </div>

              {/* Customers */}
              <div className="border border-line bg-white rounded-xl p-5">

                <p className="font-body text-xs text-ink/40 uppercase tracking-wider">
                  Customers
                </p>

                <p className="font-display text-3xl text-ink mt-3">
                  {dashboardData.customers}
                </p>

              </div>

            </div>

            {/* Order Status */}
            <div className="mt-10">

              <div className="mb-4">

                <h2 className="font-display text-2xl text-ink">
                  Order status
                </h2>

                <p className="font-body text-sm text-ink/50 mt-1">
                  Current orders across the restaurant.
                </p>

              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                {/* Pending */}
                <div className="border border-line bg-white rounded-xl p-5">

                  <p className="font-body text-xs text-ink/40 uppercase tracking-wider">
                    Pending
                  </p>

                  <p className="font-display text-3xl text-ink mt-3">
                    {dashboardData.pendingOrders}
                  </p>

                </div>

                {/* Preparing */}
                <div className="border border-line bg-white rounded-xl p-5">

                  <p className="font-body text-xs text-ink/40 uppercase tracking-wider">
                    Preparing
                  </p>

                  <p className="font-display text-3xl text-ink mt-3">
                    {dashboardData.preparingOrders}
                  </p>

                </div>

                {/* Ready */}
                <div className="border border-line bg-white rounded-xl p-5">

                  <p className="font-body text-xs text-ink/40 uppercase tracking-wider">
                    Ready
                  </p>

                  <p className="font-display text-3xl text-ink mt-3">
                    {dashboardData.readyOrders}
                  </p>

                </div>

              </div>

            </div>

            {/* Recent Orders */}
            <div className="mt-10">

              <div className="mb-4">

                <h2 className="font-display text-2xl text-ink">
                  Recent orders
                </h2>

                <p className="font-body text-sm text-ink/50 mt-1">
                  Latest orders from your restaurant.
                </p>

              </div>

              <div className="border border-line bg-white rounded-xl overflow-hidden">

                {dashboardData.recentOrders.length === 0 ? (

                  <div className="p-6">

                    <p className="font-body text-sm text-ink/50">
                      No orders yet.
                    </p>

                  </div>

                ) : (

                  <div className="divide-y divide-line">

                    {dashboardData.recentOrders.map((order) => (

                      <div
                        key={order._id}
                        className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                      >

                        <div>

                          <p className="font-body text-sm text-ink">
                            {order.customerName || 'Guest customer'}
                          </p>

                          <p className="font-body text-xs text-ink/40 mt-1">
                            Table{' '}
                            {order.tableId?.tableNumber ||
                              order.tableId ||
                              '—'}
                          </p>

                        </div>

                        <div className="flex items-center gap-4">

                          <span className="font-body text-xs capitalize text-ink/50">
                            {order.status}
                          </span>

                          <span className="font-body text-sm text-ink">
                            ₹{order.totalAmount}
                          </span>

                        </div>

                      </div>

                    ))}

                  </div>

                )}

              </div>

            </div>

            {/* Quick Access */}
            <div className="mt-10">

              <div className="mb-4">

                <h2 className="font-display text-2xl text-ink">
                  Quick access
                </h2>

                <p className="font-body text-sm text-ink/50 mt-1">
                  Jump directly into restaurant operations.
                </p>

              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Kitchen */}
                <Link
                  to="/admin/kitchen"
                  className="border border-line bg-charcoal text-paper rounded-xl p-6 block hover:opacity-95 transition"
                >

                  <p className="font-body text-sm text-paper/50">
                    Kitchen
                  </p>

                  <h3 className="font-display text-2xl mt-2">
                    Manage live orders
                  </h3>

                  <p className="font-body text-sm text-paper/50 mt-2">
                    View incoming orders and update their preparation
                    status.
                  </p>

                </Link>

                {/* Waiter */}
                <Link
                  to="/admin/waiter"
                  className="border border-line bg-white rounded-xl p-6 block hover:bg-paper transition"
                >

                  <p className="font-body text-sm text-ink/40">
                    Waiter
                  </p>

                  <h3 className="font-display text-2xl text-ink mt-2">
                    Serve ready orders
                  </h3>

                  <p className="font-body text-sm text-ink/50 mt-2">
                    See orders that are ready to be served.
                  </p>

                </Link>

              </div>

            </div>

          </section>
        )}

        {/* ================= MENU ================= */}
        {activeTab === 'menu' && (
          <MenuManagement
            restaurantId={user.restaurantId}
            token={token}
          />
        )}

        {/* ================= TABLES ================= */}
        {activeTab === 'tables' && (
          <TableManagement
            restaurantId={user.restaurantId}
            token={token}
          />
        )}

      </main>

    </div>
  );
};

export default AdminDashboard;