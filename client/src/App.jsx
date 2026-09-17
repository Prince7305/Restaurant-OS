import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import CustomerMenu from './pages/CustomerMenu';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import KitchenDashboard from './pages/KitchenDashboard';
import WaiterView from './pages/WaiterView';
import LandingPage from './pages/LandingPage';

// If user has an active session, send them to dashboard, otherwise login
function HomeRedirect() {
  const token = localStorage.getItem('token');
  return <Navigate to={token ? "/admin/dashboard" : "/admin/login"} replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Root redirect */}
        <Route path="/" element={<LandingPage />} />

        {/* Customer flow — encoded inside each table's QR code */}
        <Route path="/table/:tableId" element={<CustomerMenu />} />

        {/* Admin/staff flow */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/kitchen" element={<KitchenDashboard />} />
        <Route path="/admin/waiter" element={<WaiterView />} />

        {/* Catch-all fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
