"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Proposals", href: "/dashboard/proposals" },
  { label: "Invoices", href: "/dashboard/invoices" },
  { label: "Settings", href: "/dashboard/settings" },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <div className="flex gap-1">
      {tabs.map((t) => {
        const active =
          t.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
              active
                ? "bg-[#0A0A0A] text-white"
                : "text-gray-500 hover:text-black hover:bg-black/[0.04]"
            }`}
          >
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}
