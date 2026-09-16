import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axiosConfig';

function CustomerMenu() {
    const { tableId } = useParams();

    // ---- Data loaded from the backend ----
    const [table, setTable] = useState(null);
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // ---- Cart lives in local component state — no backend call until checkout ----
    const [cart, setCart] = useState({}); // { menuItemId: quantity }

    // ---- Checkout form state ----
    const [checkoutOpen, setCheckoutOpen] = useState(false);
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [paymentMode, setPaymentMode] = useState('cash');
    const [placingOrder, setPlacingOrder] = useState(false);
    const [orderConfirmation, setOrderConfirmation] = useState(null);

    // STEP 1: On page load, figure out which table + restaurant this QR belongs to.
    // This is a PUBLIC call — no login token needed, matching our backend design.
    useEffect(() => {
        async function loadTableAndMenu() {
            try {
                const tableRes = await api.get(`/tables/${tableId}`);
                setTable(tableRes.data);

                const restaurantId = tableRes.data.restaurantId._id;
                // ?onlyAvailable=true — this is the exact filter we built and tested
                // in the backend, so sold-out items never show to the customer.
                const menuRes = await api.get(
                    `/menu/restaurant/${restaurantId}?onlyAvailable=true`
                );
                setMenuItems(menuRes.data);
            } catch (err) {
                setError('This table could not be found. Please ask staff for help.');
            } finally {
                setLoading(false);
            }
        }
        loadTableAndMenu();
    }, [tableId]);

    // Group items by category for display — {"Main Course": [...], "Beverages": [...]}
    const groupedMenu = menuItems.reduce((groups, item) => {
        if (!groups[item.category]) groups[item.category] = [];
        groups[item.category].push(item);
        return groups;
    }, {});

    const addToCart = (itemId) => {
        setCart((prev) => ({ ...prev, [itemId]: (prev[itemId] || 0) + 1 }));
    };

    const removeFromCart = (itemId) => {
        setCart((prev) => {
            const next = { ...prev };
            if (next[itemId] > 1) {
                next[itemId] -= 1;
            } else {
                delete next[itemId];
            }
            return next;
        });
    };

    const cartItemCount = Object.values(cart).reduce((sum, qty) => sum + qty, 0);

    const cartTotal = Object.entries(cart).reduce((sum, [itemId, qty]) => {
        const item = menuItems.find((m) => m._id === itemId);
        return sum + (item ? item.price * qty : 0);
    }, 0);

    const handlePlaceOrder = async () => {
        if (!customerName.trim() || !customerPhone.trim()) {
            setError('Please enter your name and phone number.');
            return;
        }

        setPlacingOrder(true);
        setError('');

        try {
            const orderItems = Object.entries(cart).map(([menuItemId, quantity]) => ({
                menuItemId,
                quantity,
            }));

            const res = await api.post('/orders', {
                restaurantId: table.restaurantId._id,
                tableId: table._id,
                customerName,
                customerPhone,
                items: orderItems,
                paymentMode,
            });

            setOrderConfirmation(res.data);
            setCart({});
        } catch (err) {
            setError(err.response?.data?.message || 'Could not place order. Please try again.');
        } finally {
            setPlacingOrder(false);
        }
    };

    // ---- Loading state ----
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-paper">
                <p className="font-body text-ink/60">Loading menu…</p>
            </div>
        );
    }

    // ---- Error state (table not found) ----
    if (error && !table) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-paper px-6 text-center">
                <p className="font-body text-ink/70">{error}</p>
            </div>
        );
    }

    // ---- Order confirmed state ----
    if (orderConfirmation) {
        return (
            <div className="min-h-screen bg-paper flex flex-col items-center justify-center px-6 text-center">
                <div className="w-14 h-14 rounded-full bg-sage/10 flex items-center justify-center mb-5">
                    <span className="text-sage text-2xl">✓</span>
                </div>
                <h1 className="font-display text-3xl text-ink mb-2">Order placed</h1>
                <p className="font-body text-ink/60 mb-6 max-w-xs">
                    Table {table.tableNumber} — your food is on its way to the kitchen.
                </p>
                <div className="bg-white border border-line rounded-lg px-6 py-4 text-left w-full max-w-xs">
                    {orderConfirmation.items.map((item) => (
                        <div key={item.menuItemId} className="flex justify-between text-sm py-1 font-body">
                            <span className="text-ink/80">
                                {item.quantity} × {item.name}
                            </span>
                            <span className="text-ink/60">₹{item.price * item.quantity}</span>
                        </div>
                    ))}
                    <div className="flex justify-between font-body font-semibold pt-3 mt-2 border-t border-line">
                        <span>Total</span>
                        <span>₹{orderConfirmation.totalAmount}</span>
                    </div>
                </div>
                <button
                    onClick={() => setOrderConfirmation(null)}
                    className="mt-8 font-body text-sm text-paprika underline underline-offset-4"
                >
                    Order more
                </button>
            </div>
        );
    }

    // ---- Main menu browsing view ----
    return (
        <div className="min-h-screen bg-paper pb-28">
            {/* Header */}
            <header className="bg-charcoal text-paper px-6 pt-8 pb-6">
                <p className="font-body text-xs tracking-wide text-paper/50 mb-1">
                    Table {table.tableNumber}
                </p>
                <h1 className="font-display text-3xl leading-tight">
                    {table.restaurantId.name}
                </h1>
            </header>

            {/* Menu, grouped by category */}
            <main className="px-6 pt-6">
                {Object.entries(groupedMenu).map(([category, items]) => (
                    <section key={category} className="mb-8">
                        <h2 className="font-display text-lg text-ink/80 mb-3">{category}</h2>
                        <div className="space-y-3">
                            {items.map((item) => {
                                const qty = cart[item._id] || 0;
                                return (
                                    <div
                                        key={item._id}
                                        className="bg-white border border-line rounded-lg px-4 py-3 flex items-center justify-between gap-4"
                                    >
                                        <div className="min-w-0">
                                            <p className="font-body font-medium text-ink truncate">{item.name}</p>
                                            {item.description && (
                                                <p className="font-body text-sm text-ink/50 truncate">
                                                    {item.description}
                                                </p>
                                            )}
                                            <p className="font-body text-sm text-ink/70 mt-1">₹{item.price}</p>
                                        </div>

                                        {qty === 0 ? (
                                            <button
                                                onClick={() => addToCart(item._id)}
                                                className="shrink-0 font-body text-sm font-medium text-paprika border border-paprika rounded-full px-4 py-1.5 hover:bg-paprika hover:text-white transition-colors"
                                            >
                                                Add
                                            </button>
                                        ) : (
                                            <div className="shrink-0 flex items-center gap-3 border border-paprika rounded-full px-1">
                                                <button
                                                    onClick={() => removeFromCart(item._id)}
                                                    className="w-7 h-7 flex items-center justify-center text-paprika text-lg"
                                                >
                                                    −
                                                </button>
                                                <span className="font-body text-sm w-4 text-center">{qty}</span>
                                                <button
                                                    onClick={() => addToCart(item._id)}
                                                    className="w-7 h-7 flex items-center justify-center text-paprika text-lg"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                ))}

                {menuItems.length === 0 && (
                    <p className="font-body text-ink/50 text-center mt-12">
                        No items available on the menu right now.
                    </p>
                )}
            </main>

            {/* Sticky cart bar — only appears once something is added */}
            {cartItemCount > 0 && !checkoutOpen && (
                <button
                    onClick={() => setCheckoutOpen(true)}
                    className="fixed bottom-4 left-4 right-4 bg-charcoal text-paper rounded-lg px-5 py-4 flex items-center justify-between font-body shadow-lg"
                >
                    <span className="text-sm">
                        {cartItemCount} item{cartItemCount > 1 ? 's' : ''} · ₹{cartTotal}
                    </span>
                    <span className="font-medium">Checkout →</span>
                </button>
            )}

            {/* Checkout sheet */}
            {checkoutOpen && (
                <div className="fixed inset-0 bg-charcoal/60 flex items-end z-10">
                    <div className="bg-paper w-full rounded-t-2xl px-6 pt-6 pb-8 max-h-[85vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="font-display text-2xl">Your order</h2>
                            <button
                                onClick={() => setCheckoutOpen(false)}
                                className="text-ink/40 font-body text-xl leading-none"
                            >
                                ×
                            </button>
                        </div>

                        <div className="space-y-2 mb-6">
                            {Object.entries(cart).map(([itemId, qty]) => {
                                const item = menuItems.find((m) => m._id === itemId);
                                if (!item) return null;
                                return (
                                    <div key={itemId} className="flex justify-between font-body text-sm">
                                        <span className="text-ink/80">
                                            {qty} × {item.name}
                                        </span>
                                        <span className="text-ink/60">₹{item.price * qty}</span>
                                    </div>
                                );
                            })}
                            <div className="flex justify-between font-body font-semibold pt-3 mt-3 border-t border-line">
                                <span>Total</span>
                                <span>₹{cartTotal}</span>
                            </div>
                        </div>

                        <div className="space-y-3 mb-5">
                            <input
                                type="text"
                                placeholder="Your name"
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                className="w-full font-body border border-line rounded-lg px-4 py-3 outline-none focus:border-paprika"
                            />
                            <input
                                type="tel"
                                placeholder="Phone number"
                                value={customerPhone}
                                onChange={(e) => setCustomerPhone(e.target.value)}
                                className="w-full font-body border border-line rounded-lg px-4 py-3 outline-none focus:border-paprika"
                            />

                            <div className="flex gap-2">
                                {['cash', 'upi', 'card'].map((mode) => (
                                    <button
                                        key={mode}
                                        onClick={() => setPaymentMode(mode)}
                                        className={`flex-1 font-body text-sm capitalize rounded-lg py-2.5 border transition-colors ${paymentMode === mode
                                                ? 'bg-charcoal text-paper border-charcoal'
                                                : 'border-line text-ink/60'
                                            }`}
                                    >
                                        {mode}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {error && (
                            <p className="font-body text-sm text-paprika-dark mb-3">{error}</p>
                        )}

                        <button
                            onClick={handlePlaceOrder}
                            disabled={placingOrder}
                            className="w-full bg-paprika text-white font-body font-medium rounded-lg py-3.5 disabled:opacity-60"
                        >
                            {placingOrder ? 'Placing order…' : `Place order · ₹${cartTotal}`}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CustomerMenu;