import { useEffect, useState } from 'react';
import api from '../api/axiosConfig';

function TableManagement({ restaurantId, token }) {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [tableNumber, setTableNumber] = useState('');
  const [capacity, setCapacity] = useState('4');

  const [saving, setSaving] = useState(false);
  const [updatingTable, setUpdatingTable] = useState(null);

  const [error, setError] = useState('');
  const [qrPreview, setQrPreview] = useState(null);

  const loadTables = async () => {
    try {
      setLoading(true);
      setError('');

      const res = await api.get(
        `/tables/restaurant/${restaurantId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTables(res.data);
    } catch (err) {
      console.error('Failed to load tables', err);

      setError(
        err.response?.data?.message ||
        'Could not load tables.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (restaurantId) {
      loadTables();
    }
  }, [restaurantId]);

  const handleAddTable = async (e) => {
    e.preventDefault();

    setError('');
    setSaving(true);

    try {
      const res = await api.post(
        '/tables',
        {
          tableNumber: Number(tableNumber),
          capacity: Number(capacity),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setQrPreview(res.data);

      setTableNumber('');
      setCapacity('4');
      setShowForm(false);

      await loadTables();
    } catch (err) {
      console.error('Failed to add table', err);

      setError(
        err.response?.data?.message ||
        'Could not add table.'
      );
    } finally {
      setSaving(false);
    }
  };

  const updateTableStatus = async (tableId, status) => {
    try {
      setError('');
      setUpdatingTable(tableId);

      const res = await api.patch(
        `/tables/${tableId}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTables((prev) =>
        prev.map((table) =>
          table._id === tableId ? res.data : table
        )
      );
    } catch (err) {
      console.error(
        'Failed to update table status',
        err
      );

      setError(
        err.response?.data?.message ||
        'Could not update table status.'
      );
    } finally {
      setUpdatingTable(null);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'available':
        return 'border-sage text-sage bg-sage/5';

      case 'occupied':
        return 'border-paprika text-paprika bg-paprika/5';

      case 'preparing':
        return 'border-ink/20 text-ink/60 bg-paper';

      case 'payment-pending':
        return 'border-ink/20 text-ink/60 bg-paper';

      default:
        return 'border-line text-ink/50 bg-white';
    }
  };

  const getCustomerUrl = (tableId) => {
    return `${window.location.origin}/table/${tableId}`;
  };

  const openCustomerView = (tableId) => {
    window.open(
      getCustomerUrl(tableId),
      '_blank',
      'noopener,noreferrer'
    );
  };

  const copyCustomerUrl = async (tableId) => {
    try {
      await navigator.clipboard.writeText(
        getCustomerUrl(tableId)
      );

      alert('Customer table link copied.');
    } catch (err) {
      console.error(
        'Could not copy table URL',
        err
      );
    }
  };

  const downloadQr = (table) => {
    const link = document.createElement('a');

    link.href = table.qrCodeUrl;
    link.download = `restaurantos-table-${table.tableNumber}-qr.png`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div>
        <p className="font-body text-sm text-ink/50">
          Loading tables…
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
            Restaurant tables
          </p>

          <h2 className="font-display text-3xl text-ink">
            Tables
          </h2>

          <p className="font-body text-sm text-ink/50 mt-1">
            Create tables and manage their QR ordering access.
          </p>
        </div>

        <button
          onClick={() => {
            setShowForm((value) => !value);
            setError('');
          }}
          className="font-body text-sm font-medium bg-charcoal text-paper rounded-full px-5 py-2.5 hover:opacity-90 transition"
        >
          {showForm ? 'Cancel' : '+ Add table'}
        </button>
      </div>

      {/* Add table form */}
      {showForm && (
        <form
          onSubmit={handleAddTable}
          className="bg-white border border-line rounded-xl p-5 mb-7"
        >
          <div className="mb-5">
            <h3 className="font-display text-2xl text-ink">
              Add table
            </h3>

            <p className="font-body text-sm text-ink/50 mt-1">
              Create a table and generate its QR code automatically.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-body text-xs text-ink/50 block mb-1.5">
                Table number
              </label>

              <input
                type="number"
                placeholder="e.g. 6"
                value={tableNumber}
                onChange={(e) =>
                  setTableNumber(e.target.value)
                }
                required
                min="1"
                className="w-full font-body border border-line rounded-lg px-3 py-2.5 outline-none focus:border-paprika"
              />
            </div>

            <div>
              <label className="font-body text-xs text-ink/50 block mb-1.5">
                Seating capacity
              </label>

              <input
                type="number"
                placeholder="e.g. 4"
                value={capacity}
                onChange={(e) =>
                  setCapacity(e.target.value)
                }
                required
                min="1"
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
              {saving ? 'Creating…' : 'Create table'}
            </button>

            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setError('');
              }}
              className="font-body text-sm text-ink/50 hover:text-ink"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Error */}
      {error && !showForm && (
        <div className="mb-5 border border-line bg-white rounded-lg px-4 py-3">
          <p className="font-body text-sm text-paprika">
            {error}
          </p>
        </div>
      )}

      {/* Newly generated QR */}
      {qrPreview && (
        <div className="bg-white border border-paprika rounded-xl p-5 mb-7">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <img
              src={qrPreview.qrCodeUrl}
              alt={`Table ${qrPreview.tableNumber} QR code`}
              className="w-32 h-32 border border-line rounded-lg p-2"
            />

            <div className="flex-1">
              <p className="font-body text-xs uppercase tracking-wider text-paprika">
                QR generated
              </p>

              <h3 className="font-display text-2xl text-ink mt-1">
                Table {qrPreview.tableNumber} is ready
              </h3>

              <p className="font-body text-sm text-ink/50 mt-1">
                Place this QR code on the table so customers can
                open the menu without logging in.
              </p>

              <div className="flex flex-wrap gap-2 mt-4">
                <button
                  onClick={() =>
                    downloadQr(qrPreview)
                  }
                  className="font-body text-sm border border-line rounded-lg px-4 py-2 hover:bg-paper transition"
                >
                  Download QR
                </button>

                <button
                  onClick={() =>
                    openCustomerView(qrPreview._id)
                  }
                  className="font-body text-sm bg-charcoal text-paper rounded-lg px-4 py-2 hover:opacity-90 transition"
                >
                  Open customer view
                </button>

                <button
                  onClick={() =>
                    setQrPreview(null)
                  }
                  className="font-body text-sm text-ink/50 px-3 py-2 hover:text-ink"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Table count */}
      <div className="flex items-center justify-between mb-3">
        <p className="font-body text-xs text-ink/40">
          {tables.length}{' '}
          {tables.length === 1 ? 'table' : 'tables'} total
        </p>
      </div>

      {/* Tables */}
      {tables.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tables.map((table) => (
            <div
              key={table._id}
              className="bg-white border border-line rounded-xl overflow-hidden"
            >
              {/* QR */}
              <div className="bg-paper p-5 flex justify-center">
                <img
                  src={table.qrCodeUrl}
                  alt={`Table ${table.tableNumber} QR code`}
                  className="w-40 h-40"
                />
              </div>

              {/* Table information */}
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-2xl text-ink">
                      Table {table.tableNumber}
                    </p>

                    <p className="font-body text-sm text-ink/50 mt-1">
                      {table.capacity || '—'} seats
                    </p>
                  </div>

                  <span
                    className={`font-body text-xs capitalize rounded-full border px-2.5 py-1 whitespace-nowrap ${getStatusClass(
                      table.status
                    )}`}
                  >
                    {table.status?.replace(
                      '-',
                      ' '
                    )}
                  </span>
                </div>

                {/* Status */}
                <div className="mt-5">
                  <label className="font-body text-xs text-ink/40 block mb-1.5">
                    Table status
                  </label>

                  <select
                    value={table.status}
                    disabled={
                      updatingTable === table._id
                    }
                    onChange={(e) =>
                      updateTableStatus(
                        table._id,
                        e.target.value
                      )
                    }
                    className="w-full font-body border border-line rounded-lg px-3 py-2.5 bg-white outline-none focus:border-paprika disabled:opacity-60"
                  >
                    <option value="available">
                      Available
                    </option>

                    <option value="occupied">
                      Occupied
                    </option>

                    <option value="preparing">
                      Preparing
                    </option>

                    <option value="payment-pending">
                      Payment pending
                    </option>
                  </select>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <button
                    onClick={() =>
                      openCustomerView(table._id)
                    }
                    className="font-body text-xs border border-line rounded-lg px-3 py-2 hover:bg-paper transition"
                  >
                    Open menu
                  </button>

                  <button
                    onClick={() =>
                      downloadQr(table)
                    }
                    className="font-body text-xs border border-line rounded-lg px-3 py-2 hover:bg-paper transition"
                  >
                    Download QR
                  </button>
                </div>

                <button
                  onClick={() =>
                    copyCustomerUrl(table._id)
                  }
                  className="w-full font-body text-xs text-ink/50 mt-3 hover:text-ink transition"
                >
                  Copy customer link
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-line rounded-xl p-8 text-center">
          <p className="font-display text-2xl text-ink">
            No tables yet
          </p>

          <p className="font-body text-sm text-ink/50 mt-2">
            Create your first table to generate its QR ordering
            code.
          </p>

          <button
            onClick={() => setShowForm(true)}
            className="font-body text-sm font-medium bg-charcoal text-paper rounded-full px-4 py-2 mt-4"
          >
            + Add table
          </button>
        </div>
      )}
    </div>
  );
}

export default TableManagement;