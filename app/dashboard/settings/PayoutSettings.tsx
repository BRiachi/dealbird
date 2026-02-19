"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function PayoutSettings({ user }: { user: any }) {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<{ enabled: boolean; details_submitted: boolean } | null>(null);
    const router = useRouter();
    const searchParams = useSearchParams();

    // Check status on mount
    useEffect(() => {
        checkStatus();
    }, []);

    // Handle return from Stripe
    useEffect(() => {
        if (searchParams.get("stripe_connect") === "return") {
            checkStatus();
            // Clear param
            router.replace("/dashboard/settings");
        }
    }, [searchParams]);

    const checkStatus = async () => {
        try {
            const res = await fetch("/api/stripe/connect");
            const data = await res.json();
            setStatus(data);
        } catch (e) {
            console.error(e);
        }
    };

    const handleSetup = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/stripe/connect", { method: "POST" });
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                alert("Failed to create account link");
            }
        } catch (e) {
            alert("Error setting up payouts");
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async () => {
        // For Express accounts, we can create a login link using the same API
        // or just redirect them to the same onboarding flow which Stripe handles as "update"
        handleSetup();
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-xl font-bold mb-4">💰 Payouts & Banking</h2>

            {!status ? (
                <div className="animate-pulse h-10 w-32 bg-gray-100 rounded" />
            ) : status.enabled ? (
                <div className="space-y-4">
                    <div className="flex items-center gap-3 text-green-600 bg-green-50 p-4 rounded-xl border border-green-100">
                        <span className="text-2xl">✅</span>
                        <div>
                            <div className="font-bold">Payouts Active</div>
                            <div className="text-xs opacity-80">Your Stripe Express account is connected.</div>
                        </div>
                    </div>
                    <button
                        onClick={handleLogin}
                        disabled={loading}
                        className="px-6 py-2 bg-black text-white rounded-xl font-bold hover:scal-105 transition-all"
                    >
                        {loading ? "Redirecting..." : "Manage Payouts on Stripe ↗"}
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="flex items-center gap-3 text-amber-600 bg-amber-50 p-4 rounded-xl border border-amber-100">
                        <span className="text-2xl">⚠️</span>
                        <div>
                            <div className="font-bold">Payouts Not Setup</div>
                            <div className="text-xs opacity-80">You need to connect a bank account to receive funds.</div>
                        </div>
                    </div>
                    <button
                        onClick={handleSetup}
                        disabled={loading}
                        className="px-6 py-2.5 bg-[#C8FF00] text-black rounded-xl font-bold hover:bg-[#B8EB00] transition-all shadow-sm"
                    >
                        {loading ? "Redirecting..." : "Setup Payouts 🏦"}
                    </button>
                    {status.details_submitted && (
                        <div className="text-xs text-gray-400 mt-2">
                            * You started setup but didn't finish. Click above to resume.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
