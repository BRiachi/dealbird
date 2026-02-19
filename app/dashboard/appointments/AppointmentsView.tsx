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
    startTime: string; // ISO
    endTime: string;   // ISO
    status: string;
    meetingUrl?: string | null;
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

        if (filter === "upcoming") return new Date(b.startTime) >= now;
        if (filter === "past") return new Date(b.startTime) < now;
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
                            <div key={product.id} className="p-4 border border-gray-100 rounded-xl bg-gray-50/50 hover:bg-gray-50 transition-colors cursor-pointer group" onClick={() => window.location.href = `/dashboard/appointments/${product.id}`}>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">📅</div>
                                    <div>
                                        <h3 className="font-bold text-sm group-hover:text-blue-600 transition-colors">{product.title}</h3>
                                        <div className="flex items-center gap-2 text-xs text-gray-400">
                                            <span>${product.price / 100}</span>
                                            <span>•</span>
                                            <span>{product.settings?.duration || 30} min</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-[10px] text-gray-400 font-bold bg-white border border-gray-200 rounded-md px-2 py-1 inline-block mt-2">
                                    Edit Availability →
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Bookings List */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
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
                                <th className="px-6 py-3.5">Scheduled For</th>
                                <th className="px-6 py-3.5">Status</th>
                                <th className="px-6 py-3.5">Amount</th>
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
                                                ? "Share your coaching product link to start getting booked!"
                                                : "Try adjusting your filters"}
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredBookings.map(booking => {
                                    const start = new Date(booking.startTime);
                                    const end = new Date(booking.endTime);
                                    const isPast = start < now;

                                    return (
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
                                                <span className="text-sm font-medium">{booking.productTitle}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className={`text-sm font-bold ${isPast ? "text-gray-400" : "text-gray-900"}`}>
                                                    {start.toLocaleDateString("en-US", { month: "short", day: "numeric", weekday: "short" })}
                                                </div>
                                                <div className="text-xs text-gray-400">
                                                    {start.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })} - {end.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${booking.status === "CONFIRMED" ? "bg-green-50 text-green-600 border-green-100" :
                                                        booking.status === "CANCELLED" ? "bg-red-50 text-red-600 border-red-100" :
                                                            "bg-gray-50 text-gray-600 border-gray-100"
                                                    }`}>
                                                    {booking.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-bold text-gray-600">${booking.amount.toFixed(2)}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {booking.meetingUrl ? (
                                                    <a
                                                        href={booking.meetingUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline"
                                                    >
                                                        Join Meeting ↗
                                                    </a>
                                                ) : (
                                                    <span className="text-xs text-gray-400 italic">No link</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
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
