"use client";

import { useState } from "react";

interface Product {
    id: string;
    type: string;
    title: string;
    price: number;
    image?: string | null;
    settings?: any;
    subtitle?: string | null;
}

interface Props {
    product: Product;
    bumpProduct?: Product | null;
    isOpen: boolean;
    onClose: () => void;
    bookingStart?: string; // ISO string
    bookingEnd?: string;   // ISO string
}

export default function CheckoutModal({ product, bumpProduct, isOpen, onClose, bookingStart, bookingEnd }: Props) {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [addBump, setAddBump] = useState(false);

    if (!isOpen) return null;

    // Prices
    const mainPrice = (product.settings?.discountPrice && product.settings.discountPrice < product.price)
        ? product.settings.discountPrice
        : product.price;

    const bumpPrice = bumpProduct ? bumpProduct.price : 0;

    // Total
    const total = mainPrice + (addBump ? bumpPrice : 0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/checkout/product-session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    productId: product.id,
                    bumpProductId: addBump ? bumpProduct?.id : undefined,
                    customerEmail: email,
                    customerName: name,
                    bookingStart,
                    bookingEnd,
                }),
            });

            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                alert("Something went wrong");
                setLoading(false);
            }
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl scale-100 animate-in zoom-in-95 duration-300 border border-white/20">
                {/* Header */}
                <div className="bg-gray-50/50 border-b border-gray-100 p-5 flex justify-between items-center backdrop-blur-sm">
                    <h3 className="font-black text-lg tracking-tight">Checkout</h3>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors text-gray-500 hover:text-black"
                    >
                        ✕
                    </button>
                </div>

                <div className="p-6 sm:p-8">
                    {/* Product Summary */}
                    <div className="flex gap-5 mb-8">
                        <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center text-3xl shrink-0 shadow-inner border border-gray-100">
                            {product.image ? (
                                <img src={product.image} alt={product.title} className="w-full h-full object-cover rounded-2xl" />
                            ) : (
                                product.type === "DIGITAL" ? "📂" : "📅"
                            )}
                        </div>
                        <div className="flex-1 min-w-0 py-1">
                            <h4 className="font-bold text-lg leading-tight truncate">{product.title}</h4>
                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{product.subtitle}</p>

                            {/* Show Booking Info */}
                            {bookingStart && (
                                <div className="mt-2 text-[10px] uppercase font-bold tracking-wider bg-black text-white px-2 py-1 rounded-md inline-block">
                                    {new Date(bookingStart).toLocaleString(undefined, {
                                        weekday: 'short', month: 'short', day: 'numeric',
                                        hour: 'numeric', minute: 'numeric'
                                    })}
                                </div>
                            )}

                            <div className="mt-2 font-black text-xl tracking-tight">
                                ${(mainPrice / 100).toFixed(2)}
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5 ml-1">Full Name</label>
                                <input
                                    required
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-black/5 focus:border-black transition-all outline-none placeholder:text-gray-400"
                                    placeholder="John Doe"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5 ml-1">Email Address</label>
                                <input
                                    required
                                    type="email"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-black/5 focus:border-black transition-all outline-none placeholder:text-gray-400"
                                    placeholder="john@example.com"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Order Bump - Premium Style */}
                        {bumpProduct && (
                            <div
                                className={`relative overflow-hidden border-2 rounded-2xl p-4 transition-all duration-300 cursor-pointer group ${addBump ? 'border-[#C8FF00] bg-[#f9ffde]' : 'border-dashed border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}
                                onClick={() => setAddBump(!addBump)}
                            >
                                <div className="flex items-start gap-4 relative z-10">
                                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-colors ${addBump ? 'bg-black border-black text-white' : 'bg-white border-gray-200 group-hover:border-gray-300'}`}>
                                        {addBump && <span className="text-sm font-bold">✓</span>}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="font-bold text-sm text-red-500 flex items-center gap-1.5">
                                                <span className="relative flex h-2 w-2">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                                </span>
                                                One-time Offer
                                            </span>
                                            <span className="font-black text-sm">+${(bumpPrice / 100).toFixed(2)}</span>
                                        </div>
                                        <p className="font-bold text-gray-900">{bumpProduct.title}</p>
                                        <p className="text-xs text-gray-500 leading-relaxed mt-1">
                                            {bumpProduct.subtitle || "Upgrade your order with this exclusive add-on."}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Total & Submit */}
                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-black/10 disabled:opacity-70 disabled:scale-100"
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Processing...
                                    </span>
                                ) : (
                                    <>Pay ${(total / 100).toFixed(2)}</>
                                )}
                            </button>

                            <div className="text-center mt-4 flex items-center justify-center gap-1.5 opacity-40">
                                <span className="text-[10px] font-bold uppercase tracking-wider">Powered by Stripe</span>
                                <span className="text-xs">🔒</span>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
