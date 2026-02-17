"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ProposalActions({
  proposalId,
  proposalUrl,
  status,
  invoiceId,
}: {
  proposalId: string;
  proposalUrl: string;
  status: string;
  invoiceId: string | null;
}) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [creating, setCreating] = useState(false);

  const copyLink = async () => {
    await navigator.clipboard.writeText(proposalUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const createInvoice = async () => {
    setCreating(true);
    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proposalId }),
      });
      const data = await res.json();
      if (res.ok) router.push(`/dashboard/invoices/${data.id}`);
      else alert(data.error || "Failed to create invoice");
    } catch (e) {
      alert("Network error");
    }
    setCreating(false);
  };

  return (
    <div className="flex flex-col gap-2.5">
      <button
        onClick={copyLink}
        className="w-full py-2.5 bg-[#C8FF00] text-black font-bold text-sm rounded-xl hover:bg-[#9FCC00] transition-all"
      >
        {copied ? "✓ Copied!" : "📋 Copy Proposal Link"}
      </button>

      {status === "SIGNED" && !invoiceId && (
        <button
          onClick={createInvoice}
          disabled={creating}
          className="w-full py-2.5 bg-[#0A0A0A] text-white font-bold text-sm rounded-xl hover:bg-gray-800 transition-all disabled:opacity-50"
        >
          {creating ? "Creating..." : "💰 Create Invoice"}
        </button>
      )}

      {invoiceId && (
        <button
          onClick={() => router.push(`/dashboard/invoices/${invoiceId}`)}
          className="w-full py-2.5 border-2 border-gray-200 font-bold text-sm rounded-xl hover:border-black transition-all"
        >
          📄 View Invoice
        </button>
      )}

      <a
        href={proposalUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full py-2.5 border-2 border-gray-200 font-bold text-sm rounded-xl hover:border-black transition-all text-center block"
      >
        👁 Preview Brand View
      </a>
    </div>
  );
}
