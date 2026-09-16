import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import MenuManagement from '../components/MenuManagement';
import TableManagement from '../components/TableManagement';

function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('menu');

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  // Guard: no valid session, bounce straight to login instead of
  // showing a broken dashboard with no data.
  useEffect(() => {
    if (!token || !user) {
      navigate('/admin/login');
    }
  }, [token, user, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/admin/login');
  };

  if (!user) return null; // brief flash before the redirect above kicks in

  return (
    <div className="min-h-screen bg-paper">
      <header className="bg-charcoal text-paper px-6 py-5 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl">RestaurantOS</h1>
          <p className="font-body text-xs text-paper/40">{user.name}</p>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/admin/kitchen" className="font-body text-sm text-paper/60">
            Kitchen
          </Link>
          <Link to="/admin/waiter" className="font-body text-sm text-paper/60">
            Waiter
          </Link>
          <button onClick={handleLogout} className="font-body text-sm text-paper/60">
            Sign out
          </button>
        </div>
      </header>

      {/* Tab switcher */}
      <div className="px-6 pt-5 flex gap-2 border-b border-line">
        {['menu', 'tables'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`font-body text-sm capitalize px-4 py-2.5 -mb-px border-b-2 ${activeTab === tab
                ? 'border-paprika text-ink font-medium'
                : 'border-transparent text-ink/40'
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <main className="p-6 max-w-3xl">
        {activeTab === 'menu' && (
          <MenuManagement restaurantId={user.restaurantId} token={token} />
        )}
        {activeTab === 'tables' && (
          <TableManagement restaurantId={user.restaurantId} token={token} />
        )}
      </main>
    </div>
  );
}

export default AdminDashboard;