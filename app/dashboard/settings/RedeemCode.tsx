"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  lifetimePlan: string | null;
  currentPlan: string;
}

export default function RedeemCode({ lifetimePlan, currentPlan }: Props) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (lifetimePlan) {
    return (
      <div className="flex items-center gap-2">
        <span
          className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
            lifetimePlan === "pro"
              ? "bg-[#C8FF00] text-black"
              : "bg-purple-100 text-purple-700"
          }`}
        >
          Lifetime {lifetimePlan === "pro" ? "Pro" : "Agency"}
        </span>
        <span className="text-xs text-gray-400">Active</span>
      </div>
    );
  }

  async function handleApply(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    setError("");
    setSuccess("");
    setLoading(true);

    const res = await fetch("/api/promo/claim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Failed to apply code");
      return;
    }

    setSuccess(
      `Your plan has been upgraded to ${data.plan === "pro" ? "Pro" : "Agency"}!`
    );
    setCode("");
    router.refresh();
  }

  return (
    <form onSubmit={handleApply} className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Enter promo code"
          disabled={loading || !!success}
          className="flex-1 h-9 px-3 rounded-lg border border-gray-200 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-[#C8FF00] focus:border-transparent disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading || !code.trim() || !!success}
          className="h-9 px-4 bg-[#C8FF00] text-black font-bold text-xs rounded-lg hover:bg-[#9FCC00] disabled:opacity-50 transition-colors whitespace-nowrap"
        >
          {loading ? "Applying..." : "Apply"}
        </button>
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}
      {success && <p className="text-xs text-green-600">{success}</p>}
    </form>
  );
}
