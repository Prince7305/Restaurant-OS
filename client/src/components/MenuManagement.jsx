import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

function MenuManagement({ restaurantId, token }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // ---- Add item form state ----
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadItems = async () => {
    try {
      // No onlyAvailable filter here — admin needs to see sold-out items too
      const res = await api.get(`/menu/restaurant/${restaurantId}`);
      setItems(res.data);
    } catch (err) {
      console.error('Failed to load menu', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, [restaurantId]);

  const handleAddItem = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      await api.post(
        '/menu',
        { name, price: Number(price), category, description },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Reset the form and refresh the list from the server — simpler and
      // more reliable than manually patching local state, and this list
      // is small enough that an extra fetch costs nothing noticeable.
      setName('');
      setPrice('');
      setCategory('');
      setDescription('');
      setShowForm(false);
      loadItems();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not add item');
    } finally {
      setSaving(false);
    }
  };

  const toggleAvailability = async (item) => {
    try {
      await api.patch(
        `/menu/${item._id}`,
        { isAvailable: !item.isAvailable },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setItems((prev) =>
        prev.map((i) => (i._id === item._id ? { ...i, isAvailable: !i.isAvailable } : i))
      );
    } catch (err) {
      console.error('Failed to toggle availability', err);
    }
  };

  const deleteItem = async (itemId) => {
    if (!confirm('Delete this item permanently?')) return;
    try {
      await api.delete(`/menu/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setItems((prev) => prev.filter((i) => i._id !== itemId));
    } catch (err) {
      console.error('Failed to delete item', err);
    }
  };

  if (loading) return <p className="font-body text-ink/50">Loading menu…</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-display text-xl">Menu</h2>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="font-body text-sm font-medium bg-charcoal text-paper rounded-full px-4 py-2"
        >
          {showForm ? 'Cancel' : '+ Add item'}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleAddItem}
          className="bg-white border border-line rounded-lg p-4 mb-6 space-y-3"
        >
          <input
            type="text"
            placeholder="Item name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full font-body border border-line rounded-lg px-3 py-2 outline-none focus:border-paprika"
          />
          <div className="flex gap-3">
            <input
              type="number"
              placeholder="Price (₹)"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              min="0"
              className="w-1/2 font-body border border-line rounded-lg px-3 py-2 outline-none focus:border-paprika"
            />
            <input
              type="text"
              placeholder="Category (e.g. Starters)"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className="w-1/2 font-body border border-line rounded-lg px-3 py-2 outline-none focus:border-paprika"
            />
          </div>
          <input
            type="text"
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full font-body border border-line rounded-lg px-3 py-2 outline-none focus:border-paprika"
          />
          {error && <p className="font-body text-sm text-paprika-dark">{error}</p>}
          <button
            type="submit"
            disabled={saving}
            className="font-body text-sm font-medium bg-paprika text-white rounded-lg px-4 py-2 disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save item'}
          </button>
        </form>
      )}

      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item._id}
            className="bg-white border border-line rounded-lg px-4 py-3 flex items-center justify-between gap-4"
          >
            <div className="min-w-0">
              <p className="font-body font-medium text-ink">
                {item.name}{' '}
                <span className="font-body text-sm text-ink/40">· {item.category}</span>
              </p>
              <p className="font-body text-sm text-ink/60">₹{item.price}</p>
            </div>

            <div className="shrink-0 flex items-center gap-3">
              <button
                onClick={() => toggleAvailability(item)}
                className={`font-body text-xs rounded-full px-3 py-1.5 border ${
                  item.isAvailable
                    ? 'border-sage text-sage'
                    : 'border-ink/20 text-ink/40'
                }`}
              >
                {item.isAvailable ? 'Available' : 'Sold out'}
              </button>
              <button
                onClick={() => deleteItem(item._id)}
                className="font-body text-xs text-ink/30 hover:text-paprika-dark"
              >
                Delete
              </button>
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <p className="font-body text-ink/40 text-sm">No menu items yet — add your first one.</p>
        )}
      </div>
    </div>
  );
}

export default MenuManagement;
