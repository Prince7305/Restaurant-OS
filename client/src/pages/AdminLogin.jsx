import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';

function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { email, password });

      // We store the token + user info in localStorage so it survives
      // page refreshes. Every protected API call from here on will read
      // this token and attach it as an Authorization header.
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));

      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-6">
      <form onSubmit={handleLogin} className="w-full max-w-sm">
        <h1 className="font-display text-3xl text-ink mb-1">RestaurantOS</h1>
        <p className="font-body text-ink/50 mb-8">Sign in to manage your restaurant</p>

        <div className="space-y-3 mb-5">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full font-body border border-line rounded-lg px-4 py-3 outline-none focus:border-paprika bg-white"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full font-body border border-line rounded-lg px-4 py-3 outline-none focus:border-paprika bg-white"
          />
        </div>

        {error && <p className="font-body text-sm text-paprika-dark mb-4">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-charcoal text-paper font-body font-medium rounded-lg py-3.5 disabled:opacity-60"
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}

export default AdminLogin;
