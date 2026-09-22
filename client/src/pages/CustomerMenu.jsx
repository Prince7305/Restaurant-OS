import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axiosConfig';

function CustomerMenu() {
    const { tableId } = useParams();

    // Data
    const [table, setTable] = useState(null);
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Menu
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');

    // Cart
    const [cart, setCart] = useState({});

    // Checkout
    const [checkoutOpen, setCheckoutOpen] = useState(false);
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [paymentMode, setPaymentMode] = useState('cash');
    const [placingOrder, setPlacingOrder] = useState(false);
    const [orderConfirmation, setOrderConfirmation] = useState(null);

    // Load table + menu
    useEffect(() => {
        async function loadTableAndMenu() {
            try {
                const tableRes = await api.get(`/tables/${tableId}`);
                setTable(tableRes.data);

                const restaurantId = tableRes.data.restaurantId._id;

                const menuRes = await api.get(
                    `/menu/restaurant/${restaurantId}?onlyAvailable=true`
                );

                setMenuItems(menuRes.data);
            } catch (err) {
                setError(
                    'This table could not be found. Please ask staff for help.'
                );
            } finally {
                setLoading(false);
            }
        }

        loadTableAndMenu();
    }, [tableId]);

    // Categories
    const categories = useMemo(() => {
        return [
            'All',
            ...new Set(menuItems.map((item) => item.category).filter(Boolean)),
        ];
    }, [menuItems]);

    // Filter menu
    const filteredMenu = useMemo(() => {
        const query = search.trim().toLowerCase();

        return menuItems.filter((item) => {
            const matchesCategory =
                activeCategory === 'All' ||
                item.category === activeCategory;

            const matchesSearch =
                !query ||
                item.name.toLowerCase().includes(query) ||
                item.description?.toLowerCase().includes(query);

            return matchesCategory && matchesSearch;
        });
    }, [menuItems, search, activeCategory]);

    // Group menu by category
    const groupedMenu = filteredMenu.reduce((groups, item) => {
        if (!groups[item.category]) groups[item.category] = [];
        groups[item.category].push(item);
        return groups;
    }, {});

    // Cart actions
    const addToCart = (itemId) => {
        setCart((prev) => ({
            ...prev,
            [itemId]: (prev[itemId] || 0) + 1,
        }));
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

    // Cart totals
    const cartItemCount = Object.values(cart).reduce(
        (sum, qty) => sum + qty,
        0
    );

    const cartTotal = Object.entries(cart).reduce((sum, [itemId, qty]) => {
        const item = menuItems.find((m) => m._id === itemId);
        return sum + (item ? item.price * qty : 0);
    }, 0);

    // Place order
    const handlePlaceOrder = async () => {
        const name = customerName.trim();
        const phone = customerPhone.trim();

        if (!name) {
            setError('Please enter your name.');
            return;
        }

        if (!/^[6-9]\d{9}$/.test(phone)) {
            setError('Please enter a valid 10-digit phone number.');
            return;
        }

        if (cartItemCount === 0) {
            setError('Your cart is empty.');
            return;
        }

        setPlacingOrder(true);
        setError('');

        try {
            const orderItems = Object.entries(cart).map(
                ([menuItemId, quantity]) => ({
                    menuItemId,
                    quantity,
                })
            );

            const res = await api.post('/orders', {
                restaurantId: table.restaurantId._id,
                tableId: table._id,
                customerName: name,
                customerPhone: phone,
                items: orderItems,
                paymentMode,
            });

            setOrderConfirmation(res.data);
            setCart({});
            setCheckoutOpen(false);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Could not place order. Please try again.'
            );
        } finally {
            setPlacingOrder(false);
        }
    };

    // Loading
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-paper">
                <p className="font-body text-ink/60">Loading menu…</p>
            </div>
        );
    }

    // Table error
    if (error && !table) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-paper px-6 text-center">
                <p className="font-body text-ink/70">{error}</p>
            </div>
        );
    }

    // Order confirmation
    if (orderConfirmation) {
        return (
            <div className="min-h-screen bg-paper flex flex-col items-center justify-center px-6 text-center">
                <div className="w-14 h-14 rounded-full bg-sage/10 flex items-center justify-center mb-5">
                    <span className="text-sage text-2xl">✓</span>
                </div>

                <p className="font-body text-xs uppercase tracking-wider text-ink/40 mb-2">
                    Order confirmed
                </p>

                <h1 className="font-display text-3xl text-ink mb-2">
                    Order placed
                </h1>

                <p className="font-body text-ink/60 mb-6 max-w-xs">
                    Table {table.tableNumber} — your food is on its way to the
                    kitchen.
                </p>

                <div className="bg-white border border-line rounded-lg px-6 py-4 text-left w-full max-w-xs">
                    {orderConfirmation.items?.map((item, index) => (
                        <div
                            key={`${item.menuItemId}-${index}`}
                            className="flex justify-between text-sm py-1 font-body gap-4"
                        >
                            <span className="text-ink/80">
                                {item.quantity} × {item.name}
                            </span>

                            <span className="text-ink/60 shrink-0">
                                ₹{item.price * item.quantity}
                            </span>
                        </div>
                    ))}

                    <div className="flex justify-between font-body font-semibold pt-3 mt-2 border-t border-line">
                        <span>Total</span>
                        <span>₹{orderConfirmation.totalAmount}</span>
                    </div>
                </div>

                <button
                    onClick={() => {
                        setOrderConfirmation(null);
                        setError('');
                    }}
                    className="mt-8 font-body text-sm text-paprika underline underline-offset-4"
                >
                    Order more
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-paper pb-28">
            {/* Header */}
            <header className="bg-charcoal text-paper px-6 pt-8 pb-6">
                <div className="max-w-3xl mx-auto">
                    <p className="font-body text-xs tracking-wide text-paper/50 mb-1">
                        Table {table.tableNumber}
                    </p>

                    <h1 className="font-display text-3xl leading-tight">
                        {table.restaurantId.name}
                    </h1>

                    <p className="font-body text-sm text-paper/50 mt-2">
                        Browse the menu and order from your table.
                    </p>
                </div>
            </header>

            {/* Search + categories */}
            <div className="max-w-3xl mx-auto px-6 pt-5">
                <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search menu..."
                    className="w-full bg-white border border-line rounded-lg px-4 py-3 font-body text-sm outline-none focus:border-paprika"
                />

                {categories.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto py-4">
                        {categories.map((category) => (
                            <button
                                key={category}
                                onClick={() => setActiveCategory(category)}
                                className={`shrink-0 font-body text-sm px-4 py-2 rounded-full border transition-colors ${activeCategory === category
                                        ? 'bg-charcoal text-paper border-charcoal'
                                        : 'bg-white text-ink/60 border-line'
                                    }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Menu */}
            <main className="max-w-3xl mx-auto px-6 pt-2">
                {Object.entries(groupedMenu).map(([category, items]) => (
                    <section key={category} className="mb-8">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="font-display text-lg text-ink/80">
                                {category}
                            </h2>

                            <span className="font-body text-xs text-ink/40">
                                {items.length} item
                                {items.length > 1 ? 's' : ''}
                            </span>
                        </div>

                        <div className="space-y-3">
                            {items.map((item) => {
                                const qty = cart[item._id] || 0;

                                return (
                                    <div
                                        key={item._id}
                                        className="bg-white border border-line rounded-lg px-4 py-3 flex items-center justify-between gap-4"
                                    >
                                        <div className="min-w-0">
                                            <p className="font-body font-medium text-ink">
                                                {item.name}
                                            </p>

                                            {item.description && (
                                                <p className="font-body text-sm text-ink/50 mt-1 line-clamp-2">
                                                    {item.description}
                                                </p>
                                            )}

                                            <p className="font-body text-sm text-ink/70 mt-1">
                                                ₹{item.price}
                                            </p>
                                        </div>

                                        {qty === 0 ? (
                                            <button
                                                onClick={() =>
                                                    addToCart(item._id)
                                                }
                                                className="shrink-0 font-body text-sm font-medium text-paprika border border-paprika rounded-full px-4 py-1.5 hover:bg-paprika hover:text-white transition-colors"
                                            >
                                                Add
                                            </button>
                                        ) : (
                                            <div className="shrink-0 flex items-center gap-2 border border-paprika rounded-full px-1">
                                                <button
                                                    onClick={() =>
                                                        removeFromCart(
                                                            item._id
                                                        )
                                                    }
                                                    className="w-7 h-7 flex items-center justify-center text-paprika text-lg"
                                                    aria-label={`Remove one ${item.name}`}
                                                >
                                                    −
                                                </button>

                                                <span className="font-body text-sm w-4 text-center">
                                                    {qty}
                                                </span>

                                                <button
                                                    onClick={() =>
                                                        addToCart(item._id)
                                                    }
                                                    className="w-7 h-7 flex items-center justify-center text-paprika text-lg"
                                                    aria-label={`Add one ${item.name}`}
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

                {filteredMenu.length === 0 && (
                    <div className="text-center mt-12">
                        <p className="font-display text-xl text-ink mb-2">
                            No items found
                        </p>

                        <p className="font-body text-sm text-ink/50">
                            {search
                                ? 'Try a different search term.'
                                : 'No items are available right now.'}
                        </p>

                        {(search || activeCategory !== 'All') && (
                            <button
                                onClick={() => {
                                    setSearch('');
                                    setActiveCategory('All');
                                }}
                                className="mt-4 font-body text-sm text-paprika"
                            >
                                Clear filters
                            </button>
                        )}
                    </div>
                )}
            </main>

            {/* Error */}
            {error && table && (
                <div className="fixed left-4 right-4 bottom-24 z-20">
                    <div className="max-w-3xl mx-auto bg-charcoal text-paper rounded-lg px-4 py-3 flex justify-between gap-4 shadow-lg">
                        <p className="font-body text-sm">{error}</p>

                        <button
                            onClick={() => setError('')}
                            className="text-paper/50 hover:text-paper"
                            aria-label="Close error"
                        >
                            ×
                        </button>
                    </div>
                </div>
            )}

            {/* Sticky cart */}
            {cartItemCount > 0 && !checkoutOpen && (
                <div className="fixed bottom-0 left-0 right-0 z-10 p-4 bg-paper/95 border-t border-line">
                    <button
                        onClick={() => {
                            setError('');
                            setCheckoutOpen(true);
                        }}
                        className="max-w-3xl mx-auto w-full bg-charcoal text-paper rounded-lg px-5 py-4 flex items-center justify-between font-body shadow-lg"
                    >
                        <span className="text-sm">
                            {cartItemCount} item
                            {cartItemCount > 1 ? 's' : ''} · ₹{cartTotal}
                        </span>

                        <span className="font-medium">
                            View cart →
                        </span>
                    </button>
                </div>
            )}

            {/* Checkout */}
            {checkoutOpen && (
                <div className="fixed inset-0 bg-charcoal/60 flex items-end z-30">
                    <div className="bg-paper w-full rounded-t-2xl px-6 pt-6 pb-8 max-h-[88vh] overflow-y-auto">
                        <div className="max-w-3xl mx-auto">
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="font-display text-2xl">
                                    Your order
                                </h2>

                                <button
                                    onClick={() => {
                                        setCheckoutOpen(false);
                                        setError('');
                                    }}
                                    className="w-8 h-8 border border-line rounded-full text-ink/50"
                                    aria-label="Close checkout"
                                >
                                    ×
                                </button>
                            </div>

                            {/* Order summary */}
                            <div className="space-y-2 mb-6">
                                {Object.entries(cart).map(([itemId, qty]) => {
                                    const item = menuItems.find(
                                        (m) => m._id === itemId
                                    );

                                    if (!item) return null;

                                    return (
                                        <div
                                            key={itemId}
                                            className="flex justify-between font-body text-sm gap-4"
                                        >
                                            <span className="text-ink/80">
                                                {qty} × {item.name}
                                            </span>

                                            <span className="text-ink/60">
                                                ₹{item.price * qty}
                                            </span>
                                        </div>
                                    );
                                })}

                                <div className="flex justify-between font-body font-semibold pt-3 mt-3 border-t border-line">
                                    <span>Total</span>
                                    <span>₹{cartTotal}</span>
                                </div>
                            </div>

                            {/* Customer details */}
                            <div className="space-y-3 mb-5">
                                <input
                                    type="text"
                                    placeholder="Your name"
                                    value={customerName}
                                    onChange={(e) =>
                                        setCustomerName(e.target.value)
                                    }
                                    autoComplete="name"
                                    className="w-full bg-white font-body border border-line rounded-lg px-4 py-3 outline-none focus:border-paprika"
                                />

                                <input
                                    type="tel"
                                    inputMode="numeric"
                                    maxLength={10}
                                    placeholder="10-digit phone number"
                                    value={customerPhone}
                                    onChange={(e) =>
                                        setCustomerPhone(
                                            e.target.value
                                                .replace(/\D/g, '')
                                                .slice(0, 10)
                                        )
                                    }
                                    autoComplete="tel"
                                    className="w-full bg-white font-body border border-line rounded-lg px-4 py-3 outline-none focus:border-paprika"
                                />

                                <div className="flex gap-2">
                                    {['cash', 'upi', 'card'].map((mode) => (
                                        <button
                                            key={mode}
                                            onClick={() =>
                                                setPaymentMode(mode)
                                            }
                                            className={`flex-1 font-body text-sm capitalize rounded-lg py-2.5 border transition-colors ${paymentMode === mode
                                                    ? 'bg-charcoal text-paper border-charcoal'
                                                    : 'bg-white border-line text-ink/60'
                                                }`}
                                        >
                                            {mode}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {error && (
                                <p className="font-body text-sm text-paprika-dark mb-3">
                                    {error}
                                </p>
                            )}

                            <button
                                onClick={handlePlaceOrder}
                                disabled={placingOrder}
                                className="w-full bg-paprika text-white font-body font-medium rounded-lg py-3.5 disabled:opacity-60"
                            >
                                {placingOrder
                                    ? 'Placing order…'
                                    : `Place order · ₹${cartTotal}`}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CustomerMenu;