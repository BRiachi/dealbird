"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navGroups = [
    {
        label: "",
        items: [
            { label: "Home", href: "/dashboard", icon: "🏠" },
        ],
    },
    {
        label: "Sales & Money",
        items: [
            { label: "Proposals", href: "/dashboard/proposals", icon: "📝" },
            { label: "Invoices", href: "/dashboard/invoices", icon: "🧾" },
            { label: "Income", href: "/dashboard/income", icon: "💰" },
        ],
    },
    {
        label: "Store",
        items: [
            { label: "Link-in-Bio", href: "/dashboard/links", icon: "🔗" },
            { label: "Design", href: "/dashboard/design", icon: "🎨" },
            { label: "Referrals", href: "/dashboard/referrals", icon: "🤝" },
        ],
    },
    {
        label: "Growth",
        items: [
            { label: "Analytics", href: "/dashboard/analytics", icon: "📊" },
            { label: "Audience", href: "/dashboard/audience", icon: "👥" },
            { label: "Appointments", href: "/dashboard/appointments", icon: "📅" },
        ],
    },
];

export function DashboardSidebar() {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);

    const isActive = (href: string) =>
        href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);

    return (
        <>
            {/* Mobile toggle */}
            <button
                onClick={() => setCollapsed(!collapsed)}
                className="lg:hidden fixed bottom-4 left-4 z-[60] w-12 h-12 bg-black text-white rounded-full flex items-center justify-center text-lg shadow-xl hover:scale-105 transition-transform"
            >
                {collapsed ? "✕" : "☰"}
            </button>

            {/* Overlay for mobile */}
            {collapsed && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/30 z-[45] backdrop-blur-sm"
                    onClick={() => setCollapsed(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 h-full z-[50] bg-white border-r border-gray-100 flex flex-col transition-transform duration-300 ${collapsed ? "translate-x-0" : "-translate-x-full"
                    } lg:translate-x-0 lg:static lg:z-auto w-[220px] shrink-0`}
            >
                {/* Logo */}
                <Link
                    href="/dashboard"
                    className="h-16 px-5 flex items-center gap-2.5 border-b border-gray-100 shrink-0"
                >
                    <img src="/logo.png" alt="DealBird" className="w-7 h-7 rounded-lg -rotate-[5deg]" />
                    <span className="font-extrabold text-base tracking-tight">DealBird</span>
                </Link>

                {/* Nav Groups */}
                <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
                    {navGroups.map((group) => (
                        <div key={group.label || "_home"}>
                            {group.label && (
                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 mb-2">
                                    {group.label}
                                </div>
                            )}
                            <div className="space-y-0.5">
                                {group.items.map((item) => {
                                    const active = isActive(item.href);
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setCollapsed(false)}
                                            className={`flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-semibold transition-all ${active
                                                ? "bg-[#C8FF00]/20 text-black"
                                                : "text-gray-500 hover:text-black hover:bg-gray-50"
                                                }`}
                                        >
                                            <span className="text-base w-5 text-center">{item.icon}</span>
                                            <span>{item.label}</span>
                                            {active && (
                                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#C8FF00]" />
                                            )}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* Settings — pinned at bottom */}
                <div className="px-3 pb-2">
                    <Link
                        href="/dashboard/settings"
                        onClick={() => setCollapsed(false)}
                        className={`flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-semibold transition-all ${isActive("/dashboard/settings")
                            ? "bg-[#C8FF00]/20 text-black"
                            : "text-gray-500 hover:text-black hover:bg-gray-50"
                            }`}
                    >
                        <span className="text-base w-5 text-center">⚙️</span>
                        <span>Settings</span>
                    </Link>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-[10px] text-gray-300 font-bold tracking-wider">
                        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                        dealbird.ai
                    </div>
                </div>
            </aside>
        </>
    );
}
