"use client";

import { useState, useMemo, useEffect } from "react";
import { downloadCSV } from "@/lib/utils";

interface Customer {
    email: string;
    name: string;
    totalSpend: number;
    orders: number;
    lastOrder: string;
    products: string;
    tags: string[];
}

type SortKey = "name" | "totalSpend" | "orders" | "lastOrder";
type SortDir = "asc" | "desc";

const TAG_OPTIONS = ["VIP", "Repeat Buyer", "Newsletter", "Lead", "High Value", "New"];
const TAG_COLORS: Record<string, string> = {
    "VIP": "bg-amber-100 text-amber-700 border-amber-200",
    "Repeat Buyer": "bg-blue-100 text-blue-700 border-blue-200",
    "Newsletter": "bg-purple-100 text-purple-700 border-purple-200",
    "Lead": "bg-green-100 text-green-700 border-green-200",
    "High Value": "bg-rose-100 text-rose-700 border-rose-200",
    "New": "bg-cyan-100 text-cyan-700 border-cyan-200",
};

export function AudienceTable({ data, allProducts }: { data: Customer[]; allProducts: string[] }) {
    const [search, setSearch] = useState("");
    const [productFilter, setProductFilter] = useState("all");
    const [tagFilter, setTagFilter] = useState("all");
    const [sortKey, setSortKey] = useState<SortKey>("lastOrder");
    const [sortDir, setSortDir] = useState<SortDir>("desc");
    const [customerTags, setCustomerTags] = useState<Record<string, string[]>>(() => {
        const map: Record<string, string[]> = {};
        data.forEach(c => { map[c.email] = c.tags || []; });
        return map;
    });
    const [tagDropdown, setTagDropdown] = useState<string | null>(null);
    const [expandedRow, setExpandedRow] = useState<string | null>(null);

    const toggleTag = (email: string, tag: string) => {
        setCustomerTags(prev => {
            const current = prev[email] || [];
            const updated = current.includes(tag) ? current.filter(t => t !== tag) : [...current, tag];
            return { ...prev, [email]: updated };
        });
    };

    const filtered = useMemo(() => {
        let result = data.filter(c =>
            c.email.toLowerCase().includes(search.toLowerCase()) ||
            c.name.toLowerCase().includes(search.toLowerCase())
        );

        if (productFilter !== "all") {
            result = result.filter(c => c.products.includes(productFilter));
        }

        if (tagFilter !== "all") {
            result = result.filter(c => (customerTags[c.email] || []).includes(tagFilter));
        }

        result.sort((a, b) => {
            let cmp = 0;
            switch (sortKey) {
                case "name": cmp = a.name.localeCompare(b.name); break;
                case "totalSpend": cmp = a.totalSpend - b.totalSpend; break;
                case "orders": cmp = a.orders - b.orders; break;
                case "lastOrder": cmp = new Date(a.lastOrder).getTime() - new Date(b.lastOrder).getTime(); break;
            }
            return sortDir === "desc" ? -cmp : cmp;
        });

        return result;
    }, [data, search, productFilter, tagFilter, sortKey, sortDir, customerTags]);

    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortDir(d => d === "asc" ? "desc" : "asc");
        } else {
            setSortKey(key);
            setSortDir("desc");
        }
    };

    const sortIcon = (key: SortKey) => {
        if (sortKey !== key) return "↕";
        return sortDir === "asc" ? "↑" : "↓";
    };

    const handleExport = () => {
        const exportData = filtered.map(c => ({
            ...c,
            tags: (customerTags[c.email] || []).join(", "),
        }));
        downloadCSV(exportData, "dealbird-audience.csv");
    };

    const totalRevenue = data.reduce((s, c) => s + c.totalSpend, 0);
    const avgSpend = data.length > 0 ? totalRevenue / data.length : 0;

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">👥 Total Customers</div>
                    <div className="text-2xl font-black">{data.length}</div>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">💰 Total Revenue</div>
                    <div className="text-2xl font-black text-green-600">${totalRevenue.toFixed(2)}</div>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">📊 Avg. Spend</div>
                    <div className="text-2xl font-black">${avgSpend.toFixed(2)}</div>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">🔍 Filtered</div>
                    <div className="text-2xl font-black">{filtered.length}</div>
                </div>
            </div>

            {/* Main Table Card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Toolbar */}
                <div className="p-4 border-b border-gray-100 space-y-3">
                    <div className="flex flex-wrap gap-3 items-center">
                        {/* Search */}
                        <div className="relative flex-1 min-w-[200px]">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                            <input
                                placeholder="Search by name or email..."
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50/50 text-sm focus:ring-2 focus:ring-[#C8FF00] focus:border-transparent outline-none transition-all"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        {/* Product Filter */}
                        <select
                            value={productFilter}
                            onChange={(e) => setProductFilter(e.target.value)}
                            className="px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50/50 text-sm font-medium focus:ring-2 focus:ring-[#C8FF00] outline-none cursor-pointer"
                        >
                            <option value="all">All Products</option>
                            {allProducts.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>

                        {/* Tag Filter */}
                        <select
                            value={tagFilter}
                            onChange={(e) => setTagFilter(e.target.value)}
                            className="px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50/50 text-sm font-medium focus:ring-2 focus:ring-[#C8FF00] outline-none cursor-pointer"
                        >
                            <option value="all">All Tags</option>
                            {TAG_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>

                        {/* Export */}
                        <button
                            onClick={handleExport}
                            className="px-5 py-2.5 bg-[#C8FF00] text-black border border-[#B8EB00] rounded-xl text-sm font-bold hover:bg-[#B8EB00] transition-all flex items-center gap-2 shadow-sm"
                        >
                            📥 Export CSV
                        </button>
                    </div>
                    {(search || productFilter !== "all" || tagFilter !== "all") && (
                        <div className="flex items-center gap-2 text-xs">
                            <span className="text-gray-400">Active filters:</span>
                            {search && (
                                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-lg flex items-center gap-1">
                                    &quot;{search}&quot;
                                    <button onClick={() => setSearch("")} className="hover:text-black">✕</button>
                                </span>
                            )}
                            {productFilter !== "all" && (
                                <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded-lg flex items-center gap-1">
                                    {productFilter}
                                    <button onClick={() => setProductFilter("all")} className="hover:text-blue-900">✕</button>
                                </span>
                            )}
                            {tagFilter !== "all" && (
                                <span className={`px-2 py-1 rounded-lg flex items-center gap-1 border ${TAG_COLORS[tagFilter] || "bg-gray-100 text-gray-600"}`}>
                                    {tagFilter}
                                    <button onClick={() => setTagFilter("all")} className="hover:opacity-70">✕</button>
                                </span>
                            )}
                            <button
                                onClick={() => { setSearch(""); setProductFilter("all"); setTagFilter("all"); }}
                                className="text-gray-400 hover:text-black underline ml-1"
                            >
                                Clear all
                            </button>
                        </div>
                    )}
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50/80 text-gray-500 uppercase font-bold text-[11px] tracking-wider">
                            <tr>
                                <th className="px-6 py-3.5 cursor-pointer hover:text-black transition-colors" onClick={() => handleSort("name")}>
                                    Customer {sortIcon("name")}
                                </th>
                                <th className="px-6 py-3.5">Tags</th>
                                <th className="px-6 py-3.5 cursor-pointer hover:text-black transition-colors" onClick={() => handleSort("totalSpend")}>
                                    Revenue {sortIcon("totalSpend")}
                                </th>
                                <th className="px-6 py-3.5 cursor-pointer hover:text-black transition-colors" onClick={() => handleSort("orders")}>
                                    Orders {sortIcon("orders")}
                                </th>
                                <th className="px-6 py-3.5 cursor-pointer hover:text-black transition-colors" onClick={() => handleSort("lastOrder")}>
                                    Last Order {sortIcon("lastOrder")}
                                </th>
                                <th className="px-6 py-3.5">Products</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-16 text-center">
                                        <div className="text-4xl mb-3">👤</div>
                                        <div className="text-gray-500 font-semibold mb-1">No customers found</div>
                                        <div className="text-gray-400 text-xs">
                                            {search || productFilter !== "all" || tagFilter !== "all"
                                                ? "Try adjusting your filters"
                                                : "Share your store link to start getting customers!"}
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((c) => (
                                    <tr
                                        key={c.email}
                                        className="hover:bg-[#C8FF00]/5 transition-colors cursor-pointer group"
                                        onClick={() => setExpandedRow(expandedRow === c.email ? null : c.email)}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-sm font-bold text-gray-600 shrink-0">
                                                    {c.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-900">{c.name}</div>
                                                    <div className="text-gray-400 text-xs">{c.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex flex-wrap gap-1 items-center">
                                                {(customerTags[c.email] || []).map(tag => (
                                                    <span key={tag} className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${TAG_COLORS[tag] || "bg-gray-100 text-gray-600"}`}>
                                                        {tag}
                                                    </span>
                                                ))}
                                                <div className="relative">
                                                    <button
                                                        onClick={() => setTagDropdown(tagDropdown === c.email ? null : c.email)}
                                                        className="w-5 h-5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-400 hover:text-gray-600 flex items-center justify-center text-xs transition-colors"
                                                    >
                                                        +
                                                    </button>
                                                    {tagDropdown === c.email && (
                                                        <div className="absolute top-7 left-0 bg-white border border-gray-200 rounded-xl shadow-xl z-20 py-2 w-40 animate-in fade-in">
                                                            {TAG_OPTIONS.map(tag => (
                                                                <button
                                                                    key={tag}
                                                                    onClick={() => toggleTag(c.email, tag)}
                                                                    className="w-full px-3 py-1.5 text-left text-xs hover:bg-gray-50 flex items-center justify-between"
                                                                >
                                                                    <span>{tag}</span>
                                                                    {(customerTags[c.email] || []).includes(tag) && <span className="text-green-500">✓</span>}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-bold text-green-600">${c.totalSpend.toFixed(2)}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="bg-gray-100 px-2.5 py-1 rounded-lg text-xs font-bold">{c.orders}</span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 text-xs">
                                            {new Date(c.lastOrder).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                        </td>
                                        <td className="px-6 py-4 max-w-[200px]">
                                            <div className="flex flex-wrap gap-1">
                                                {c.products.split(", ").map((p, i) => (
                                                    <span key={i} className="text-[10px] bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-lg text-gray-600 truncate max-w-[120px]">
                                                        {p}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between text-xs text-gray-400">
                    <span>Showing {filtered.length} of {data.length} customers</span>
                    <span className="font-mono" suppressHydrationWarning>{new Date().toLocaleDateString()}</span>
                </div>
            </div>
        </div>
    );
}
