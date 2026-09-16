import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CustomerMenu from './pages/CustomerMenu';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import KitchenDashboard from './pages/KitchenDashboard';
import WaiterView from './pages/WaiterView';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Customer flow — encoded inside each table's QR code */}
        <Route path="/table/:tableId" element={<CustomerMenu />} />

        {/* Admin/staff flow */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/kitchen" element={<KitchenDashboard />} />
        <Route path="/admin/waiter" element={<WaiterView />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
