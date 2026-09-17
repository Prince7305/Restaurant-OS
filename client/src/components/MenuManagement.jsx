import { useEffect, useMemo, useState } from 'react';
import api from '../api/axiosConfig';

function MenuManagement({ restaurantId, token }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add / Edit form
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Search / filter
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const loadItems = async () => {
    try {
      setLoading(true);

      const res = await api.get(
        `/menu/restaurant/${restaurantId}`
      );

      setItems(res.data);
    } catch (err) {
      console.error('Failed to load menu', err);
      setError('Could not load menu items.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (restaurantId) {
      loadItems();
    }
  }, [restaurantId]);

  // Unique categories
  const categories = useMemo(() => {
    return [...new Set(items.map((item) => item.category).filter(Boolean))].sort();
  }, [items]);

  // Search + category filtering
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.description?.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        categoryFilter === 'all' ||
        item.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [items, search, categoryFilter]);

  const resetForm = () => {
    setName('');
    setPrice('');
    setCategory('');
    setDescription('');
    setEditingItem(null);
    setError('');
  };

  const openAddForm = () => {
    resetForm();
    setShowForm(true);
  };

  const openEditForm = (item) => {
    setEditingItem(item);

    setName(item.name || '');
    setPrice(item.price ?? '');
    setCategory(item.category || '');
    setDescription(item.description || '');

    setError('');
    setShowForm(true);
  };

  const closeForm = () => {
    resetForm();
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');
    setSaving(true);

    try {
      const payload = {
        name: name.trim(),
        price: Number(price),
        category: category.trim(),
        description: description.trim(),
      };

      if (editingItem) {
        // Update existing item
        const res = await api.patch(
          `/menu/${editingItem._id}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setItems((prev) =>
          prev.map((item) =>
            item._id === editingItem._id
              ? res.data
              : item
          )
        );
      } else {
        // Create new item
        const res = await api.post(
          '/menu',
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setItems((prev) => [...prev, res.data]);
      }

      closeForm();
    } catch (err) {
      console.error('Failed to save menu item', err);

      setError(
        err.response?.data?.message ||
        'Could not save menu item.'
      );
    } finally {
      setSaving(false);
    }
  };

  const toggleAvailability = async (item) => {
    try {
      const res = await api.patch(
        `/menu/${item._id}`,
        {
          isAvailable: !item.isAvailable,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setItems((prev) =>
        prev.map((currentItem) =>
          currentItem._id === item._id
            ? res.data
            : currentItem
        )
      );
    } catch (err) {
      console.error(
        'Failed to update availability',
        err
      );

      setError(
        err.response?.data?.message ||
        'Could not update availability.'
      );
    }
  };

  const deleteItem = async (itemId) => {
    const confirmed = window.confirm(
      'Delete this menu item permanently?'
    );

    if (!confirmed) return;

    try {
      await api.delete(`/menu/${itemId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setItems((prev) =>
        prev.filter((item) => item._id !== itemId)
      );
    } catch (err) {
      console.error('Failed to delete item', err);

      setError(
        err.response?.data?.message ||
        'Could not delete menu item.'
      );
    }
  };

  if (loading) {
    return (
      <div>
        <p className="font-body text-sm text-ink/50">
          Loading menu…
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <p className="font-body text-xs uppercase tracking-wider text-paprika mb-1">
            Restaurant menu
          </p>

          <h2 className="font-display text-3xl text-ink">
            Menu
          </h2>

          <p className="font-body text-sm text-ink/50 mt-1">
            Manage dishes, prices and availability.
          </p>
        </div>

        <button
          onClick={showForm ? closeForm : openAddForm}
          className="font-body text-sm font-medium bg-charcoal text-paper rounded-full px-5 py-2.5 hover:opacity-90 transition"
        >
          {showForm ? 'Cancel' : '+ Add item'}
        </button>
      </div>

      {/* Add / Edit Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-line rounded-xl p-5 mb-7"
        >
          <div className="mb-5">
            <h3 className="font-display text-2xl text-ink">
              {editingItem
                ? 'Edit menu item'
                : 'Add menu item'}
            </h3>

            <p className="font-body text-sm text-ink/50 mt-1">
              {editingItem
                ? 'Update the details of this menu item.'
                : 'Add a new item to your restaurant menu.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-body text-xs text-ink/50 block mb-1.5">
                Item name
              </label>

              <input
                type="text"
                placeholder="e.g. Butter Chicken"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full font-body border border-line rounded-lg px-3 py-2.5 outline-none focus:border-paprika"
              />
            </div>

            <div>
              <label className="font-body text-xs text-ink/50 block mb-1.5">
                Price
              </label>

              <input
                type="number"
                placeholder="₹320"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                min="0"
                step="0.01"
                className="w-full font-body border border-line rounded-lg px-3 py-2.5 outline-none focus:border-paprika"
              />
            </div>

            <div>
              <label className="font-body text-xs text-ink/50 block mb-1.5">
                Category
              </label>

              <input
                type="text"
                placeholder="e.g. Main Course"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="w-full font-body border border-line rounded-lg px-3 py-2.5 outline-none focus:border-paprika"
              />
            </div>

            <div>
              <label className="font-body text-xs text-ink/50 block mb-1.5">
                Description
              </label>

              <input
                type="text"
                placeholder="Short description"
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
                className="w-full font-body border border-line rounded-lg px-3 py-2.5 outline-none focus:border-paprika"
              />
            </div>
          </div>

          {error && (
            <p className="font-body text-sm text-paprika mt-4">
              {error}
            </p>
          )}

          <div className="flex items-center gap-3 mt-5">
            <button
              type="submit"
              disabled={saving}
              className="font-body text-sm font-medium bg-paprika text-white rounded-lg px-5 py-2.5 disabled:opacity-60"
            >
              {saving
                ? 'Saving…'
                : editingItem
                  ? 'Update item'
                  : 'Save item'}
            </button>

            <button
              type="button"
              onClick={closeForm}
              className="font-body text-sm text-ink/50 hover:text-ink"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Search + Filter */}
      <div className="bg-white border border-line rounded-xl p-4 mb-5">
        <div className="flex flex-col md:flex-row gap-3">
          <input
            type="text"
            placeholder="Search menu items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 font-body border border-line rounded-lg px-3 py-2.5 outline-none focus:border-paprika"
          />

          <select
            value={categoryFilter}
            onChange={(e) =>
              setCategoryFilter(e.target.value)
            }
            className="font-body border border-line rounded-lg px-3 py-2.5 bg-white outline-none focus:border-paprika"
          >
            <option value="all">
              All categories
            </option>

            {categories.map((categoryName) => (
              <option
                key={categoryName}
                value={categoryName}
              >
                {categoryName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Error */}
      {error && !showForm && (
        <div className="mb-5 border border-line bg-white rounded-lg px-4 py-3">
          <p className="font-body text-sm text-paprika">
            {error}
          </p>
        </div>
      )}

      {/* Menu count */}
      <div className="flex items-center justify-between mb-3">
        <p className="font-body text-xs text-ink/40">
          Showing {filteredItems.length} of {items.length} items
        </p>
      </div>

      {/* Menu list */}
      <div className="space-y-2">
        {filteredItems.map((item) => (
          <div
            key={item._id}
            className="bg-white border border-line rounded-xl px-4 py-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
          >
            {/* Item information */}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-body font-medium text-ink">
                  {item.name}
                </p>

                <span className="font-body text-xs text-ink/40 border border-line rounded-full px-2 py-0.5">
                  {item.category}
                </span>
              </div>

              {item.description && (
                <p className="font-body text-sm text-ink/50 mt-1">
                  {item.description}
                </p>
              )}

              <p className="font-display text-xl text-ink mt-2">
                ₹{item.price}
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                onClick={() => toggleAvailability(item)}
                className={`font-body text-xs rounded-full px-3 py-1.5 border transition ${item.isAvailable
                    ? 'border-sage text-sage hover:bg-sage/5'
                    : 'border-ink/20 text-ink/40 hover:bg-paper'
                  }`}
              >
                {item.isAvailable
                  ? 'Available'
                  : 'Sold out'}
              </button>

              <button
                onClick={() => openEditForm(item)}
                className="font-body text-xs border border-line text-ink/60 rounded-full px-3 py-1.5 hover:text-ink hover:bg-paper transition"
              >
                Edit
              </button>

              <button
                onClick={() => deleteItem(item._id)}
                className="font-body text-xs text-ink/40 rounded-full px-3 py-1.5 hover:text-paprika transition"
              >
                Delete
              </button>
            </div>
          </div>
        ))}

        {/* No items */}
        {items.length === 0 && (
          <div className="bg-white border border-line rounded-xl p-8 text-center">
            <p className="font-display text-2xl text-ink">
              No menu items yet
            </p>

            <p className="font-body text-sm text-ink/50 mt-2">
              Add your first dish to start building your menu.
            </p>

            <button
              onClick={openAddForm}
              className="font-body text-sm font-medium bg-charcoal text-paper rounded-full px-4 py-2 mt-4"
            >
              + Add item
            </button>
          </div>
        )}

        {/* Search/filter returned nothing */}
        {items.length > 0 &&
          filteredItems.length === 0 && (
            <div className="bg-white border border-line rounded-xl p-8 text-center">
              <p className="font-display text-2xl text-ink">
                No matching items
              </p>

              <p className="font-body text-sm text-ink/50 mt-2">
                Try a different search term or category.
              </p>
            </div>
          )}
      </div>
    </div>
  );
}

export default MenuManagement;