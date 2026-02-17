const config: Record<string, { bg: string; text: string; label: string }> = {
  DRAFT: { bg: "bg-gray-100", text: "text-gray-600", label: "Draft" },
  SENT: { bg: "bg-blue-50", text: "text-blue-700", label: "Sent" },
  VIEWED: { bg: "bg-purple-50", text: "text-purple-700", label: "Viewed" },
  SIGNED: { bg: "bg-green-50", text: "text-green-700", label: "Signed" },
  EXPIRED: { bg: "bg-red-50", text: "text-red-700", label: "Expired" },
  PENDING: { bg: "bg-yellow-50", text: "text-yellow-700", label: "Pending" },
  PAID: { bg: "bg-green-50", text: "text-green-700", label: "Paid" },
  OVERDUE: { bg: "bg-red-50", text: "text-red-700", label: "Overdue" },
  CANCELLED: { bg: "bg-gray-100", text: "text-gray-500", label: "Cancelled" },
};

export function StatusBadge({ status }: { status: string }) {
  const s = config[status] || config.DRAFT;
  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}
    >
      {s.label}
    </span>
  );
}
