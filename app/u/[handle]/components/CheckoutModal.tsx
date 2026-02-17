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
}

export default function CheckoutModal({ product, bumpProduct, isOpen, onClose }: Props) {
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
                    customerName: name, // For our DB if needed
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="bg-gray-50 border-b border-gray-100 p-4 flex justify-between items-center">
                    <h3 className="font-bold text-lg">Checkout</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-black">✕</button>
                </div>

                <div className="p-6">
                    {/* Product Summary */}
                    <div className="flex gap-4 mb-6">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-2xl shrink-0">
                            {product.type === "DIGITAL" ? "📂" : "📅"}
                        </div>
                        <div>
                            <h4 className="font-bold leading-tight">{product.title}</h4>
                            <p className="text-sm text-gray-500 mt-1">{product.subtitle}</p>
                            <div className="mt-1 font-mono text-sm">
                                ${(mainPrice / 100).toFixed(2)}
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Name</label>
                                <input
                                    required
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-black outline-none"
                                    placeholder="John Doe"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Email</label>
                                <input
                                    required
                                    type="email"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-black outline-none"
                                    placeholder="john@example.com"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Order Bump */}
                        {bumpProduct && (
                            <div className={`border-2 rounded-xl p-3 transition-colors cursor-pointer ${addBump ? 'border-[#C8FF00] bg-[#f9ffde]' : 'border-dashed border-gray-300 hover:border-gray-400'}`}
                                onClick={() => setAddBump(!addBump)}
                            >
                                <div className="flex items-start gap-3">
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center mt-0.5 ${addBump ? 'bg-black border-black text-white' : 'bg-white border-gray-300'}`}>
                                        {addBump && "✓"}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between font-bold text-sm">
                                            <span className="text-red-600 animate-pulse">Wait! Add this?</span>
                                            <span>+${(bumpPrice / 100).toFixed(2)}</span>
                                        </div>
                                        <p className="font-bold text-sm mt-0.5">{bumpProduct.title}</p>
                                        <p className="text-xs text-gray-600 leading-tight mt-1">
                                            {bumpProduct.subtitle || "One-time offer to upgrade your order."}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Total & Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-black text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 mt-2"
                        >
                            {loading ? "Processing..." : `Pay $${(total / 100).toFixed(2)}`}
                        </button>

                        <div className="text-center">
                            <p className="text-[10px] text-gray-400">
                                Secure checkout powered by Stripe.
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
