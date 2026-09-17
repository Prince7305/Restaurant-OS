function LandingPage() {
    return (
        <main className="min-h-screen bg-paper text-ink">
            {/* Navigation */}
            <header className="px-6 py-5 md:px-10">
                <nav className="max-w-6xl mx-auto flex items-center justify-between">
                    <a href="/" className="font-display text-2xl">
                        RestaurantOS
                    </a>

                    <a
                        href="/admin/login"
                        className="font-body text-sm font-medium border border-line rounded-full px-4 py-2 hover:border-ink transition-colors"
                    >
                        Sign in
                    </a>
                </nav>
            </header>

            {/* Hero */}
            <section className="px-6 pt-16 pb-20 md:px-10 md:pt-24 md:pb-28">
                <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

                    {/* Hero copy */}
                    <div>
                        <p className="font-body text-sm font-medium text-paprika mb-5">
                            Restaurant operations, simplified
                        </p>

                        <h1 className="font-display text-5xl md:text-6xl lg:text-7xl leading-[0.95] tracking-tight">
                            From the table
                            <br />
                            to the kitchen.
                            <br />
                            <span className="text-paprika">In sync.</span>
                        </h1>

                        <p className="font-body text-base md:text-lg text-ink/60 max-w-xl mt-7 leading-relaxed">
                            RestaurantOS brings QR ordering, kitchen operations,
                            tables and customer management into one connected system.
                        </p>

                        <div className="flex flex-wrap gap-3 mt-8">
                            <a
                                href="/admin/login"
                                className="font-body text-sm font-medium bg-charcoal text-paper rounded-full px-5 py-3"
                            >
                                Open dashboard
                            </a>

                            <a
                                href="#how-it-works"
                                className="font-body text-sm font-medium border border-line rounded-full px-5 py-3"
                            >
                                See how it works
                            </a>
                        </div>
                    </div>

                    {/* Workflow */}
                    <div className="bg-charcoal text-paper rounded-2xl p-6 md:p-8">
                        <p className="font-body text-xs uppercase tracking-[0.18em] text-paper/40 mb-8">
                            The order lifecycle
                        </p>

                        <div className="space-y-5">
                            <div className="flex items-center gap-5">
                                <span className="font-display text-3xl text-paprika">
                                    01
                                </span>
                                <div>
                                    <h2 className="font-display text-2xl">Scan</h2>
                                    <p className="font-body text-sm text-paper/50">
                                        Customer scans the table QR.
                                    </p>
                                </div>
                            </div>

                            <div className="h-px bg-paper/10" />

                            <div className="flex items-center gap-5">
                                <span className="font-display text-3xl text-paprika">
                                    02
                                </span>
                                <div>
                                    <h2 className="font-display text-2xl">Order</h2>
                                    <p className="font-body text-sm text-paper/50">
                                        Browse the menu and place an order.
                                    </p>
                                </div>
                            </div>

                            <div className="h-px bg-paper/10" />

                            <div className="flex items-center gap-5">
                                <span className="font-display text-3xl text-paprika">
                                    03
                                </span>
                                <div>
                                    <h2 className="font-display text-2xl">Kitchen</h2>
                                    <p className="font-body text-sm text-paper/50">
                                        Kitchen receives the order in real time.
                                    </p>
                                </div>
                            </div>

                            <div className="h-px bg-paper/10" />

                            <div className="flex items-center gap-5">
                                <span className="font-display text-3xl text-sage">
                                    04
                                </span>
                                <div>
                                    <h2 className="font-display text-2xl">Served</h2>
                                    <p className="font-body text-sm text-paper/50">
                                        Waiter serves the ready order.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </section>

            {/* How it works */}
            <section
                id="how-it-works"
                className="bg-charcoal text-paper px-6 py-20 md:px-10 md:py-24"
            >
                <div className="max-w-6xl mx-auto">
                    <p className="font-body text-sm text-paper/40 mb-4">
                        One connected system
                    </p>

                    <h2 className="font-display text-4xl md:text-5xl max-w-2xl">
                        Every part of the restaurant works from the same order.
                    </h2>

                    <div className="grid md:grid-cols-3 gap-8 mt-14">
                        <div>
                            <p className="font-display text-3xl text-paprika">01</p>
                            <h3 className="font-display text-2xl mt-3">
                                QR ordering
                            </h3>
                            <p className="font-body text-sm text-paper/50 mt-2 leading-relaxed">
                                Customers open the menu directly from their table QR code.
                            </p>
                        </div>

                        <div>
                            <p className="font-display text-3xl text-paprika">02</p>
                            <h3 className="font-display text-2xl mt-3">
                                Live kitchen
                            </h3>
                            <p className="font-body text-sm text-paper/50 mt-2 leading-relaxed">
                                Orders move from pending to preparing to ready in real time.
                            </p>
                        </div>

                        <div>
                            <p className="font-display text-3xl text-sage">03</p>
                            <h3 className="font-display text-2xl mt-3">
                                Customer history
                            </h3>
                            <p className="font-body text-sm text-paper/50 mt-2 leading-relaxed">
                                Orders automatically contribute to the restaurant's customer
                                history.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="px-6 py-20 md:px-10 md:py-28">
                <div className="max-w-6xl mx-auto border-t border-line pt-10">
                    <h2 className="font-display text-4xl md:text-5xl max-w-2xl">
                        Your restaurant.
                        <br />
                        One connected operation.
                    </h2>

                    <a
                        href="/admin/login"
                        className="inline-block mt-7 font-body text-sm font-medium bg-paprika text-white rounded-full px-5 py-3"
                    >
                        Sign in to RestaurantOS
                    </a>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-line px-6 py-6 md:px-10">
                <div className="max-w-6xl mx-auto flex flex-col sm:flex-row gap-3 justify-between">
                    <p className="font-display text-lg">RestaurantOS</p>
                    <p className="font-body text-xs text-ink/40">
                        QR ordering & restaurant operations
                    </p>
                </div>
            </footer>
        </main>
    );
}

export default LandingPage;