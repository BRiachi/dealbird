"use client";

import { useState } from "react";

export function PayButton({ slug, amount }: { slug: string; amount: string }) {
    const [loading, setLoading] = useState(false);

    const handlePay = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/invoices/pay", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ slug }),
            });
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                alert(data.error || "Something went wrong");
                setLoading(false);
            }
        } catch {
            alert("Something went wrong");
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handlePay}
            disabled={loading}
            className="w-full mt-8 py-4 bg-black text-white rounded-2xl font-extrabold text-base hover:bg-gray-900 transition-colors disabled:opacity-60"
        >
            {loading ? "Redirecting to payment..." : `Pay ${amount} Now`}
        </button>
    );
}
