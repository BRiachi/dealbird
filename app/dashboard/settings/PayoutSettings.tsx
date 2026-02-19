"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface PayoutStatus {
  stripeEnabled: boolean;
  detailsSubmitted?: boolean;
  paypalEmail: string | null;
}

export function PayoutSettings({ user }: { user: any }) {
  const [status, setStatus] = useState<PayoutStatus | null>(null);
  const [loading, setLoading] = useState("");
  const [paypalInput, setPaypalInput] = useState("");
  const [paypalSaved, setPaypalSaved] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    fetchStatus();
  }, []);

  useEffect(() => {
    const connectParam = searchParams.get("stripe_connect");
    if (connectParam === "success") {
      fetchStatus();
      router.replace("/dashboard/settings");
    } else if (connectParam === "error") {
      alert("Stripe connection failed. Please try again.");
      router.replace("/dashboard/settings");
    }
  }, [searchParams]);

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/stripe/connect");
      const data = await res.json();
      setStatus(data);
      setPaypalInput(data.paypalEmail || "");
    } catch {
      setStatus({ stripeEnabled: false, paypalEmail: null });
    }
  };

  const connectStripe = async () => {
    setLoading("stripe");
    try {
      const res = await fetch("/api/stripe/connect", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else if (data.error === "Stripe Connect not configured") {
        alert("Stripe Connect is not yet configured. Add your STRIPE_CLIENT_ID to enable this.");
      } else {
        alert("Failed to connect Stripe. Please try again.");
      }
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setLoading("");
    }
  };

  const disconnectStripe = async () => {
    if (!confirm("Disconnect your Stripe account?")) return;
    setLoading("disconnect");
    try {
      await fetch("/api/stripe/connect", { method: "DELETE" });
      fetchStatus();
    } finally {
      setLoading("");
    }
  };

  const savePaypal = async () => {
    if (!paypalInput.includes("@")) {
      alert("Please enter a valid email address.");
      return;
    }
    setLoading("paypal");
    try {
      await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paypalEmail: paypalInput }),
      });
      setPaypalSaved(true);
      setStatus(prev => prev ? { ...prev, paypalEmail: paypalInput } : prev);
      setTimeout(() => setPaypalSaved(false), 3000);
    } finally {
      setLoading("");
    }
  };

  const removePaypal = async () => {
    setLoading("paypal");
    try {
      await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paypalEmail: null }),
      });
      setPaypalInput("");
      setStatus(prev => prev ? { ...prev, paypalEmail: null } : prev);
    } finally {
      setLoading("");
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-black/[0.07] p-6">
      <h3 className="font-bold mb-1">Payouts & Banking</h3>
      <p className="text-sm text-gray-400 mb-6">
        Connect a payout method to receive payments from your sales and invoices.
      </p>

      <div className="flex flex-col gap-4">
        {/* ── Stripe Connect ── */}
        <div className="p-4 border border-black/[0.07] rounded-xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-[#635BFF]/10 rounded-lg flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#635BFF">
                <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z"/>
              </svg>
            </div>
            <div className="flex-1">
              <div className="font-bold text-sm">Stripe</div>
              <div className="text-xs text-gray-400">Accept card payments directly</div>
            </div>
            {status === null ? (
              <div className="w-20 h-6 bg-gray-100 rounded animate-pulse" />
            ) : status.stripeEnabled ? (
              <span className="text-xs font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full">Connected</span>
            ) : (
              <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">Not connected</span>
            )}
          </div>

          {status?.stripeEnabled ? (
            <div className="flex gap-2">
              <div className="flex-1 p-3 bg-green-50 rounded-lg border border-green-100 text-sm text-green-700 font-medium">
                ✓ Stripe account connected. You&apos;re ready to receive payments.
              </div>
              <button
                onClick={disconnectStripe}
                disabled={!!loading}
                className="px-3 py-2 text-xs font-bold text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
              >
                {loading === "disconnect" ? "..." : "Disconnect"}
              </button>
            </div>
          ) : (
            <button
              onClick={connectStripe}
              disabled={!!loading}
              className="w-full py-2.5 bg-[#635BFF] text-white font-bold text-sm rounded-xl hover:bg-[#4F46E5] transition-colors disabled:opacity-60"
            >
              {loading === "stripe" ? "Redirecting to Stripe..." : "Connect Stripe Account →"}
            </button>
          )}
        </div>

        {/* ── PayPal ── */}
        <div className="p-4 border border-black/[0.07] rounded-xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-[#003087]/10 rounded-lg flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#003087">
                <path d="M20.067 8.478c.492.315.844.825.983 1.39.272 1.126-.066 2.353-.87 3.16-.811.813-2.01 1.25-3.37 1.25h-.61c-.317 0-.59.23-.64.545l-.47 2.98-.133.842c-.05.317-.317.55-.633.55H12.61a.46.46 0 01-.453-.527l.92-5.83a.643.643 0 01.635-.543h1.277c2.77 0 4.94-1.13 5.077-3.817zm-8.554-5.08h4.61c1.295 0 2.527.377 3.35 1.054.822.677 1.22 1.65 1.114 2.737-.21 2.19-1.9 3.63-4.464 3.63H14.79a.65.65 0 00-.64.547l-.587 3.713a.46.46 0 01-.454.388H9.923a.46.46 0 01-.453-.527l2.043-11.542zm0 0"/>
              </svg>
            </div>
            <div className="flex-1">
              <div className="font-bold text-sm">PayPal</div>
              <div className="text-xs text-gray-400">Receive payments to your PayPal account</div>
            </div>
            {status?.paypalEmail && (
              <span className="text-xs font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full">Connected</span>
            )}
          </div>

          {status?.paypalEmail ? (
            <div className="flex gap-2">
              <div className="flex-1 p-3 bg-green-50 rounded-lg border border-green-100 text-sm text-green-700 font-medium truncate">
                ✓ {status.paypalEmail}
              </div>
              <button
                onClick={removePaypal}
                disabled={!!loading}
                className="px-3 py-2 text-xs font-bold text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
              >
                {loading === "paypal" ? "..." : "Remove"}
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="your@paypal.com"
                value={paypalInput}
                onChange={e => setPaypalInput(e.target.value)}
                className="flex-1 px-3 py-2.5 border border-black/[0.08] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
              />
              <button
                onClick={savePaypal}
                disabled={!!loading || !paypalInput}
                className="px-4 py-2.5 bg-[#003087] text-white font-bold text-sm rounded-xl hover:bg-[#002070] transition-colors disabled:opacity-50"
              >
                {paypalSaved ? "Saved ✓" : loading === "paypal" ? "..." : "Save"}
              </button>
            </div>
          )}
        </div>

        <p className="text-xs text-gray-400 text-center">
          Stripe is recommended for instant checkout. PayPal is used for manual transfers.
        </p>
      </div>
    </div>
  );
}
