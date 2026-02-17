"use client";

import { useState } from "react";

interface CoachingProduct {
    id: string;
    title: string;
    price: number;
    settings: any;
}

interface Booking {
    id: string;
    buyerName: string;
    buyerEmail: string;
    productTitle: string;
    amount: number;
    createdAt: string;
    duration: number;
    calendarUrl: string;
}

export function AppointmentsView({
    coachingProducts,
    bookings,
}: {
    coachingProducts: CoachingProduct[];
    bookings: Booking[];
}) {
    const [filter, setFilter] = useState<"all" | "upcoming" | "past">("all");
    const [search, setSearch] = useState("");

    const now = new Date();
    const filteredBookings = bookings.filter(b => {
        const matchesSearch =
            b.buyerName.toLowerCase().includes(search.toLowerCase()) ||
            b.buyerEmail.toLowerCase().includes(search.toLowerCase()) ||
            b.productTitle.toLowerCase().includes(search.toLowerCase());

        if (!matchesSearch) return false;

        if (filter === "upcoming") return new Date(b.createdAt) >= now;
        if (filter === "past") return new Date(b.createdAt) < now;
        return true;
    });

    const totalRevenue = bookings.reduce((sum, b) => sum + b.amount, 0);

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">📅 Total Bookings</div>
                    <div className="text-2xl font-black">{bookings.length}</div>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">📦 Coaching Products</div>
                    <div className="text-2xl font-black text-blue-600">{coachingProducts.length}</div>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">💰 Coaching Revenue</div>
                    <div className="text-2xl font-black text-green-600">${totalRevenue.toFixed(2)}</div>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">⏱️ Avg Duration</div>
                    <div className="text-2xl font-black">
                        {coachingProducts.length > 0
                            ? Math.round(coachingProducts.reduce((s, p) => s + (p.settings?.duration || 30), 0) / coachingProducts.length)
                            : 0} min
                    </div>
                </div>
            </div>

            {/* Coaching Products Overview */}
            {coachingProducts.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <h2 className="font-bold text-lg mb-4">Your Coaching Products</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {coachingProducts.map(product => (
                            <div key={product.id} className="p-4 border border-gray-100 rounded-xl bg-gray-50/50 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-xl">📅</div>
                                    <div>
                                        <h3 className="font-bold text-sm">{product.title}</h3>
                                        <div className="flex items-center gap-2 text-xs text-gray-400">
                                            <span>${product.price / 100}</span>
                                            <span>•</span>
                                            <span>{product.settings?.duration || 30} min</span>
                                        </div>
                                    </div>
                                </div>
                                {product.settings?.url && (
                                    <a
                                        href={product.settings.url}
                                        target="_blank"
                                        className="text-[11px] font-mono text-blue-500 hover:underline break-all"
                                    >
                                        {product.settings.url}
                                    </a>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Bookings List */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-100 space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                        {/* Search */}
                        <div className="relative flex-1 min-w-[200px]">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                            <input
                                placeholder="Search bookings..."
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50/50 text-sm focus:ring-2 focus:ring-[#C8FF00] focus:border-transparent outline-none transition-all"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        {/* Filter */}
                        <div className="flex rounded-xl border border-gray-200 overflow-hidden">
                            {(["all", "upcoming", "past"] as const).map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-4 py-2 text-xs font-bold capitalize transition-colors ${filter === f
                                        ? "bg-black text-white"
                                        : "bg-white text-gray-500 hover:bg-gray-50"
                                        }`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bookings Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50/80 text-gray-500 uppercase font-bold text-[11px] tracking-wider">
                            <tr>
                                <th className="px-6 py-3.5">Client</th>
                                <th className="px-6 py-3.5">Product</th>
                                <th className="px-6 py-3.5">Duration</th>
                                <th className="px-6 py-3.5">Amount</th>
                                <th className="px-6 py-3.5">Date</th>
                                <th className="px-6 py-3.5">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredBookings.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-16 text-center">
                                        <div className="text-4xl mb-3">📅</div>
                                        <div className="text-gray-500 font-semibold mb-1">
                                            {bookings.length === 0 ? "No bookings yet" : "No matching bookings"}
                                        </div>
                                        <div className="text-gray-400 text-xs">
                                            {bookings.length === 0
                                                ? "Create a coaching product and share your link to start getting bookings!"
                                                : "Try adjusting your filters"}
                                        </div>
                                        {coachingProducts.length === 0 && (
                                            <a
                                                href="/dashboard/links"
                                                className="inline-block mt-4 px-6 py-2.5 bg-[#C8FF00] text-black font-bold text-sm rounded-xl hover:bg-[#B8EB00] transition-all"
                                            >
                                                Create Coaching Product
                                            </a>
                                        )}
                                    </td>
                                </tr>
                            ) : (
                                filteredBookings.map(booking => (
                                    <tr key={booking.id} className="hover:bg-[#C8FF00]/5 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-xs font-bold text-blue-600 shrink-0">
                                                    {booking.buyerName.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-900 text-sm">{booking.buyerName}</div>
                                                    <div className="text-gray-400 text-xs">{booking.buyerEmail}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm">{booking.productTitle}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="bg-blue-50 text-blue-600 px-2.5 py-1 rounded-lg text-xs font-bold">
                                                {booking.duration} min
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-bold text-green-600">${booking.amount.toFixed(2)}</span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 text-xs">
                                            {new Date(booking.createdAt).toLocaleDateString("en-US", {
                                                month: "short",
                                                day: "numeric",
                                                year: "numeric",
                                            })}
                                        </td>
                                        <td className="px-6 py-4">
                                            {booking.calendarUrl && (
                                                <a
                                                    href={booking.calendarUrl}
                                                    target="_blank"
                                                    className="text-xs font-bold text-blue-500 hover:text-blue-700 transition-colors"
                                                >
                                                    View Calendar →
                                                </a>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between text-xs text-gray-400">
                    <span>Showing {filteredBookings.length} of {bookings.length} bookings</span>
                    <span className="font-mono" suppressHydrationWarning>{new Date().toLocaleDateString()}</span>
                </div>
            </div>
        </div>
    );
}
