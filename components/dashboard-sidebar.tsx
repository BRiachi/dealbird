"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";

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
            { label: "My Bookings", href: "/dashboard/bookings", icon: "📅" },
            { label: "Customers", href: "/dashboard/customers", icon: "👥" },
            { label: "Affiliates", href: "/dashboard/referrals", icon: "🎁" },
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

function getCurrentPageLabel(pathname: string): string {
    for (const group of navGroups) {
        for (const item of group.items) {
            const match = item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);
            if (match) return item.label;
        }
    }
    if (pathname.startsWith("/dashboard/settings")) return "Settings";
    return "Dashboard";
}

export function DashboardSidebar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    const close = () => setIsOpen(false);

    const isActive = (href: string) =>
        href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);

    const currentLabel = getCurrentPageLabel(pathname);

    const navItem = (href: string, label: string, icon: string) => {
        const active = isActive(href);
        return (
            <Link
                key={href}
                href={href}
                onClick={close}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all ${
                    active ? "bg-[#C8FF00]/20 text-black" : "text-gray-500 hover:text-black hover:bg-gray-50"
                }`}
            >
                <span className="text-base w-5 text-center shrink-0">{icon}</span>
                <span className="truncate">{label}</span>
                {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-black shrink-0" />}
            </Link>
        );
    };

    return (
        <>
            {/* ── Mobile Top Bar ── */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 z-[60]">
                <div className="flex items-center gap-3 min-w-0">
                    <Link href="/dashboard" className="shrink-0">
                        <img src="/logo.png" alt="DealBird" className="w-8 h-8 rounded-lg -rotate-[5deg]" />
                    </Link>
                    <span className="font-bold text-[15px] text-gray-900 truncate">{currentLabel}</span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <Link
                        href="/dashboard/proposals/new"
                        className="px-3 py-1.5 bg-[#C8FF00] text-black text-xs font-bold rounded-lg hover:bg-[#b3e600] transition-colors"
                    >
                        + New
                    </Link>
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                        aria-label={isOpen ? "Close menu" : "Open menu"}
                    >
                        {isOpen ? <X size={18} strokeWidth={2.5} /> : <Menu size={18} strokeWidth={2.5} />}
                    </button>
                </div>
            </div>

            {/* ── Backdrop ── */}
            {isOpen && (
                <div
                    className="lg:hidden fixed inset-0 z-[55] bg-black/50"
                    onClick={close}
                />
            )}

            {/* ── Drawer ── */}
            <aside
                className={`
                    fixed top-16 left-0 h-[calc(100vh-64px)] z-[58] bg-white flex flex-col
                    shadow-2xl transition-transform duration-300 ease-out
                    w-[270px]
                    ${isOpen ? "translate-x-0 pointer-events-auto" : "-translate-x-full pointer-events-none"}
                    lg:translate-x-0 lg:pointer-events-auto lg:static lg:top-0 lg:h-full lg:z-auto lg:w-[220px] lg:shadow-none shrink-0
                `}
            >
                {/* Logo (Desktop only) */}
                <Link
                    href="/dashboard"
                    className="hidden lg:flex h-16 px-5 items-center gap-2.5 border-b border-gray-100 shrink-0"
                >
                    <img src="/logo.png" alt="DealBird" className="w-7 h-7 rounded-lg -rotate-[5deg]" />
                    <span className="font-extrabold text-base tracking-tight">DealBird</span>
                </Link>

                {/* Mobile — close button row */}
                <div className="lg:hidden flex items-center justify-between px-4 pt-3 pb-1">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Menu</span>
                    <button
                        onClick={close}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-black"
                    >
                        <X size={14} strokeWidth={2.5} />
                    </button>
                </div>

                {/* Nav Groups */}
                <nav className="flex-1 overflow-y-auto py-2 px-3 space-y-4">
                    {navGroups.map((group) => (
                        <div key={group.label || "_home"}>
                            {group.label && (
                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 mb-2 mt-1">
                                    {group.label}
                                </div>
                            )}
                            <div className="space-y-0.5">
                                {group.items.map((item) => navItem(item.href, item.label, item.icon))}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* Settings — pinned */}
                <div className="px-3 pb-2 border-t border-gray-50 pt-2">
                    {navItem("/dashboard/settings", "Settings", "⚙️")}
                </div>

                {/* Footer */}
                <div className="px-5 py-3 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-[10px] text-gray-300 font-bold tracking-wider">
                        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                        dealbird.ai
                    </div>
                </div>
            </aside>
        </>
    );
}
