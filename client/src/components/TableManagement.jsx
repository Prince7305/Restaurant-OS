import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

function TableManagement({ restaurantId, token }) {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [tableNumber, setTableNumber] = useState('');
  const [capacity, setCapacity] = useState('4');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [qrPreview, setQrPreview] = useState(null); // shows the newly generated QR

  const loadTables = async () => {
    try {
      // NOTE: the :restaurantId in this URL is actually ignored by the backend —
      // it derives the real restaurant from our token instead (see
      // tableController.js -> getTablesByRestaurant). We still pass it here
      // for readability, so the URL isn't a mysterious placeholder.
      const res = await api.get(`/tables/restaurant/${restaurantId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTables(res.data);
    } catch (err) {
      console.error('Failed to load tables', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTables();
  }, [restaurantId]);

  const handleAddTable = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const res = await api.post(
        '/tables',
        { tableNumber: Number(tableNumber), capacity: Number(capacity) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setQrPreview(res.data);
      setTableNumber('');
      setShowForm(false);
      loadTables();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not add table');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="font-body text-ink/50">Loading tables…</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-display text-xl">Tables</h2>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="font-body text-sm font-medium bg-charcoal text-paper rounded-full px-4 py-2"
        >
          {showForm ? 'Cancel' : '+ Add table'}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleAddTable}
          className="bg-white border border-line rounded-lg p-4 mb-6 flex gap-3 items-start"
        >
          <input
            type="number"
            placeholder="Table number"
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
            required
            min="1"
            className="flex-1 font-body border border-line rounded-lg px-3 py-2 outline-none focus:border-paprika"
          />
          <input
            type="number"
            placeholder="Seats"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            min="1"
            className="w-24 font-body border border-line rounded-lg px-3 py-2 outline-none focus:border-paprika"
          />
          <button
            type="submit"
            disabled={saving}
            className="font-body text-sm font-medium bg-paprika text-white rounded-lg px-4 py-2 disabled:opacity-60"
          >
            {saving ? '…' : 'Create'}
          </button>
        </form>
      )}
      {error && <p className="font-body text-sm text-paprika-dark mb-4">{error}</p>}

      {/* Show the freshly generated QR right after creating a table */}
      {qrPreview && (
        <div className="bg-white border border-paprika rounded-lg p-4 mb-6 flex items-center gap-4">
          <img src={qrPreview.qrCodeUrl} alt="Table QR" className="w-24 h-24" />
          <div>
            <p className="font-body font-medium">Table {qrPreview.tableNumber} is ready</p>
            <p className="font-body text-sm text-ink/50">
              Print this QR and place it on the table
            </p>
            <button
              onClick={() => setQrPreview(null)}
              className="font-body text-sm text-paprika mt-1"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {tables.map((table) => (
          <div
            key={table._id}
            className="bg-white border border-line rounded-lg p-4 text-center"
          >
            <img src={table.qrCodeUrl} alt="" className="w-full mb-2" />
            <p className="font-body font-medium">Table {table.tableNumber}</p>
            <p className="font-body text-xs text-ink/40 capitalize">{table.status}</p>
          </div>
        ))}

        {tables.length === 0 && (
          <p className="font-body text-ink/40 text-sm col-span-full">
            No tables yet — add your first one.
          </p>
        )}
      </div>
    </div>
  );
}

export default TableManagement;
