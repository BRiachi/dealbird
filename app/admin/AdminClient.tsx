"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Claim {
  id: string;
  claimedAt: string;
  user: { email: string | null; name: string | null };
}

interface PromoCode {
  id: string;
  code: string;
  plan: string;
  maxUses: number | null;
  usesCount: number;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
  claims: Claim[];
}

export default function AdminClient({ codes: initialCodes }: { codes: PromoCode[] }) {
  const router = useRouter();
  const [codes, setCodes] = useState<PromoCode[]>(initialCodes);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Form state
  const [formCode, setFormCode] = useState("");
  const [formPlan, setFormPlan] = useState<"pro" | "agency">("pro");
  const [formMaxUses, setFormMaxUses] = useState("");
  const [formExpiresAt, setFormExpiresAt] = useState("");
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState("");

  async function createCode(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");
    setFormLoading(true);

    const res = await fetch("/api/admin/promo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: formCode,
        plan: formPlan,
        maxUses: formMaxUses || undefined,
        expiresAt: formExpiresAt || undefined,
      }),
    });

    const data = await res.json();
    setFormLoading(false);

    if (!res.ok) {
      setFormError(data.error || "Failed to create code");
      return;
    }

    setFormSuccess(`Code "${data.code}" created`);
    setFormCode("");
    setFormMaxUses("");
    setFormExpiresAt("");
    router.refresh();
    // Optimistically add to list
    setCodes((prev) => [{ ...data, claims: [] }, ...prev]);
  }

  async function toggleActive(id: string, current: boolean) {
    const res = await fetch(`/api/admin/promo/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !current }),
    });
    if (res.ok) {
      setCodes((prev) =>
        prev.map((c) => (c.id === id ? { ...c, isActive: !current } : c))
      );
    }
  }

  async function deleteCode(id: string) {
    const res = await fetch(`/api/admin/promo/${id}`, { method: "DELETE" });
    if (res.ok) {
      setCodes((prev) => prev.filter((c) => c.id !== id));
      setConfirmDeleteId(null);
    }
  }

  function formatDate(d: string | null) {
    if (!d) return "Never";
    return new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#2D2D2D]">Promo Codes</h1>
          <p className="text-sm text-gray-500 mt-1">
            Create and manage lifetime access codes for users.
          </p>
        </div>

        {/* Create Form */}
        <div className="bg-white rounded-2xl border border-black/[0.07] p-6 mb-8">
          <h2 className="font-bold text-sm mb-4">Create Code</h2>
          <form onSubmit={createCode} className="flex flex-wrap gap-3 items-end">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500">Code</label>
              <input
                type="text"
                value={formCode}
                onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                placeholder="LAUNCH2026"
                required
                className="h-9 px-3 rounded-lg border border-gray-200 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-[#C8FF00] focus:border-transparent w-40"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500">Plan</label>
              <select
                value={formPlan}
                onChange={(e) => setFormPlan(e.target.value as "pro" | "agency")}
                className="h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8FF00] focus:border-transparent"
              >
                <option value="pro">Pro</option>
                <option value="agency">Agency</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500">Max Uses</label>
              <input
                type="number"
                value={formMaxUses}
                onChange={(e) => setFormMaxUses(e.target.value)}
                placeholder="Unlimited"
                min="1"
                className="h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8FF00] focus:border-transparent w-28"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500">Expires At</label>
              <input
                type="date"
                value={formExpiresAt}
                onChange={(e) => setFormExpiresAt(e.target.value)}
                className="h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8FF00] focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              disabled={formLoading}
              className="h-9 px-5 bg-[#C8FF00] text-black font-bold text-sm rounded-lg hover:bg-[#9FCC00] disabled:opacity-50 transition-colors"
            >
              {formLoading ? "Creating..." : "Create"}
            </button>
          </form>

          {formError && (
            <p className="mt-3 text-sm text-red-600">{formError}</p>
          )}
          {formSuccess && (
            <p className="mt-3 text-sm text-green-600">{formSuccess}</p>
          )}
        </div>

        {/* Codes Table */}
        <div className="bg-white rounded-2xl border border-black/[0.07] overflow-hidden">
          {codes.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-gray-400">
              No codes yet. Create one above.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/[0.07]">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Code</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Plan</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Uses</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Expires</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Claims</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {codes.map((code) => (
                  <>
                    <tr
                      key={code.id}
                      className="border-b border-black/[0.04] hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-5 py-3 font-mono font-semibold text-[#2D2D2D]">
                        {code.code}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                            code.plan === "pro"
                              ? "bg-[#C8FF00] text-black"
                              : "bg-purple-100 text-purple-700"
                          }`}
                        >
                          {code.plan === "pro" ? "Pro" : "Agency"}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-600">
                        {code.usesCount} / {code.maxUses === null ? "∞" : code.maxUses}
                      </td>
                      <td className="px-5 py-3 text-gray-600">{formatDate(code.expiresAt)}</td>
                      <td className="px-5 py-3">
                        <button
                          onClick={() => toggleActive(code.id, code.isActive)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                            code.isActive
                              ? "bg-green-100 text-green-700 hover:bg-green-200"
                              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                          }`}
                        >
                          {code.isActive ? "Active" : "Disabled"}
                        </button>
                      </td>
                      <td className="px-5 py-3">
                        {code.claims.length > 0 ? (
                          <button
                            onClick={() =>
                              setExpandedId(expandedId === code.id ? null : code.id)
                            }
                            className="text-gray-500 hover:text-gray-800 text-xs underline underline-offset-2"
                          >
                            {code.claims.length} user{code.claims.length !== 1 ? "s" : ""}
                          </button>
                        ) : (
                          <span className="text-gray-400 text-xs">None</span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        {confirmDeleteId === code.id ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => deleteCode(code.id)}
                              className="text-xs text-red-600 font-semibold hover:text-red-800"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="text-xs text-gray-400 hover:text-gray-600"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteId(code.id)}
                            className="text-xs text-gray-400 hover:text-red-600 transition-colors"
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>

                    {/* Expanded claims row */}
                    {expandedId === code.id && code.claims.length > 0 && (
                      <tr key={`${code.id}-claims`} className="bg-gray-50/70">
                        <td colSpan={7} className="px-5 py-3">
                          <div className="flex flex-col gap-1">
                            {code.claims.map((claim) => (
                              <div
                                key={claim.id}
                                className="flex items-center gap-3 text-xs text-gray-600"
                              >
                                <span className="font-medium">
                                  {claim.user.name || claim.user.email}
                                </span>
                                {claim.user.name && (
                                  <span className="text-gray-400">{claim.user.email}</span>
                                )}
                                <span className="text-gray-400">
                                  {formatDate(claim.claimedAt)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
