"use client";

import { statusConfig, formatCurrency, formatDate } from "@/lib/utils";

// ─── STATUS BADGE ───
export function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status] || statusConfig.DRAFT;
  return (
    <span
      className={`inline-block px-2.5 py-0.5 rounded-full text-[0.7rem] font-bold ${cfg.bg} ${cfg.text}`}
    >
      {cfg.label}
    </span>
  );
}

// ─── STAT CARD ───
export function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon?: string;
}) {
  return (
    <div className="bg-white border border-black/[0.05] rounded-2xl p-5 flex flex-col gap-2">
      <span className="text-[0.7rem] font-semibold uppercase tracking-[1.5px] text-gray-400">
        {icon && <span className="mr-1">{icon}</span>}
        {label}
      </span>
      <span className="text-2xl font-black tracking-tight">{value}</span>
    </div>
  );
}

// ─── EMPTY STATE ───
export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-black/[0.05] rounded-2xl text-center py-16 px-8">
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="font-bold text-lg mb-2">{title}</h3>
      <p className="text-gray-400 text-sm mb-6 max-w-sm mx-auto">{description}</p>
      {action}
    </div>
  );
}

// ─── PAGE HEADER ───
export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-black tracking-tight">{title}</h1>
        {subtitle && (
          <p className="text-gray-400 text-sm mt-1">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}

// ─── TOAST ───
export function Toast({ message }: { message: string }) {
  return (
    <div className="fixed top-5 right-5 z-50 bg-[#0D0D0D] text-[#C8FF00] px-5 py-3 rounded-xl font-semibold text-sm shadow-lg animate-fade-in">
      ✓ {message}
    </div>
  );
}

// ─── BACK BUTTON ───
export function BackButton({
  onClick,
  label = "Back",
}: {
  onClick: () => void;
  label?: string;
}) {
  return (
    <button
      onClick={onClick}
      className="text-gray-400 text-sm font-medium hover:text-black transition-colors mb-6"
    >
      ← {label}
    </button>
  );
}
