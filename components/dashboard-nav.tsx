"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { label: "Dashboard", href: "/dashboard", icon: "🏠" },
  { label: "Proposals", href: "/dashboard/proposals", icon: "📝" },
  { label: "Invoices", href: "/dashboard/invoices", icon: "🧾" },
  { label: "Link-in-Bio", href: "/dashboard/links", icon: "🔗" },
  { label: "Design", href: "/dashboard/design", icon: "🎨" },
  { label: "Income", href: "/dashboard/income", icon: "💰" },
  { label: "Analytics", href: "/dashboard/analytics", icon: "📊" },
  { label: "Audience", href: "/dashboard/audience", icon: "👥" },
  { label: "Referrals", href: "/dashboard/referrals", icon: "🤝" },
  { label: "Appointments", href: "/dashboard/appointments", icon: "📅" },
  { label: "Settings", href: "/dashboard/settings", icon: "⚙️" },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <div className="flex gap-0.5 overflow-x-auto no-scrollbar max-w-[700px]">
      {tabs.map((t) => {
        const active =
          t.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`px-3 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 ${active
              ? "bg-[#0A0A0A] text-white"
              : "text-gray-500 hover:text-black hover:bg-black/[0.04]"
              }`}
          >
            <span className="text-[13px]">{t.icon}</span>
            <span className="hidden lg:inline">{t.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
