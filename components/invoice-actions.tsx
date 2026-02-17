"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function InvoiceActions({
  invoiceId,
  status,
  invoiceUrl,
}: {
  invoiceId: string;
  status: string;
  invoiceUrl: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState("");

  const action = async (type: "markPaid" | "sendReminder") => {
    setLoading(type);
    try {
      const res = await fetch("/api/invoices", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId, action: type }),
      });
      if (res.ok) router.refresh();
      else alert("Action failed");
    } catch {
      alert("Network error");
    }
    setLoading("");
  };

  if (status !== "PENDING") return null;

  return (
    <div className="flex gap-3 mt-6">
      <button
        onClick={() => action("markPaid")}
        disabled={!!loading}
        className="flex-1 py-3 bg-[#C8FF00] text-black font-bold text-sm rounded-xl hover:bg-[#9FCC00] transition-all disabled:opacity-50"
      >
        {loading === "markPaid" ? "Updating..." : "✓ Mark as Paid"}
      </button>
      <button
        onClick={() => action("sendReminder")}
        disabled={!!loading}
        className="flex-1 py-3 bg-[#0A0A0A] text-white font-bold text-sm rounded-xl hover:bg-gray-800 transition-all disabled:opacity-50"
      >
        {loading === "sendReminder" ? "Sending..." : "📤 Send to Client"}
      </button>
    </div>
  );
}
