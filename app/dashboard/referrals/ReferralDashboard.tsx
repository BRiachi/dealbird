"use client";

import { useState, useEffect } from "react";

interface Product {
    id: string;
    title: string;
    type: string;
    price: number;
    settings: any;
    sales: number;
}

interface Stats {
    totalProducts: number;
    affiliateEnabled: number;
    totalCommissionEarned: number;
    activeAffiliates: number;
}

export function ReferralDashboard({
    products,
    handle,
    stats,
}: {
    products: Product[];
    handle: string;
    stats: Stats;
}) {
    const [copiedLink, setCopiedLink] = useState<string | null>(null);
    const [baseUrl, setBaseUrl] = useState("https://dealbird.ai");

    useEffect(() => {
        setBaseUrl(window.location.origin);
    }, []);

    const copyLink = (productId: string) => {
        const link = `${baseUrl}/u/${handle}?ref=affiliate&product=${productId}`;
        navigator.clipboard.writeText(link);
        setCopiedLink(productId);
        setTimeout(() => setCopiedLink(null), 2000);
    };

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">📦 Total Products</div>
                    <div className="text-2xl font-black">{stats.totalProducts}</div>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">🔗 Affiliate Enabled</div>
                    <div className="text-2xl font-black text-blue-600">{stats.affiliateEnabled}</div>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">👥 Active Affiliates</div>
                    <div className="text-2xl font-black">{stats.activeAffiliates}</div>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">💰 Commission Earned</div>
                    <div className="text-2xl font-black text-green-600">${stats.totalCommissionEarned.toFixed(2)}</div>
                </div>
            </div>

            {/* How it Works */}
            <div className="bg-gradient-to-r from-[#C8FF00]/10 to-[#C8FF00]/5 rounded-2xl border border-[#C8FF00]/30 p-6">
                <h3 className="font-bold text-lg mb-3">🚀 How DealBird Referrals Work</h3>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div className="flex gap-3">
                        <span className="w-8 h-8 bg-[#C8FF00] rounded-full flex items-center justify-center text-sm font-black shrink-0">1</span>
                        <div>
                            <div className="font-bold mb-0.5">Enable Affiliates</div>
                            <div className="text-gray-500">Toggle affiliate mode on any product in Link-in-Bio settings</div>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <span className="w-8 h-8 bg-[#C8FF00] rounded-full flex items-center justify-center text-sm font-black shrink-0">2</span>
                        <div>
                            <div className="font-bold mb-0.5">Share Links</div>
                            <div className="text-gray-500">Affiliates use unique referral links to promote your products</div>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <span className="w-8 h-8 bg-[#C8FF00] rounded-full flex items-center justify-center text-sm font-black shrink-0">3</span>
                        <div>
                            <div className="font-bold mb-0.5">Earn Together</div>
                            <div className="text-gray-500">You get sales, affiliates earn commission — everyone wins</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Products with Affiliate Settings */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h2 className="font-bold text-lg">Your Products</h2>
                        <p className="text-xs text-gray-400 mt-0.5">Manage affiliate settings per product</p>
                    </div>
                    <a
                        href="/dashboard/links"
                        className="text-sm font-bold text-gray-500 hover:text-black border border-gray-200 px-4 py-2 rounded-xl transition-colors"
                    >
                        Edit Products →
                    </a>
                </div>

                <div className="divide-y divide-gray-50">
                    {products.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="text-4xl mb-3">📦</div>
                            <div className="text-gray-500 font-semibold">No products yet</div>
                            <div className="text-gray-400 text-xs mt-1">Create products in Link-in-Bio to enable affiliate marketing</div>
                            <a
                                href="/dashboard/links"
                                className="inline-block mt-4 px-6 py-2.5 bg-[#C8FF00] text-black font-bold text-sm rounded-xl hover:bg-[#B8EB00] transition-all"
                            >
                                Create Product
                            </a>
                        </div>
                    ) : (
                        products.map(product => {
                            const isAffiliate = product.settings?.affiliate?.active;
                            const commission = product.settings?.affiliate?.commission || 20;
                            const affiliateLink = `${baseUrl}/u/${handle}?ref=affiliate&product=${product.id}`;

                            return (
                                <div key={product.id} className="p-5 hover:bg-gray-50/50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        {/* Product Icon */}
                                        <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-2xl shadow-inner shrink-0">
                                            {product.type === "URL" ? "🔗" :
                                                product.type === "DIGITAL" ? "📂" :
                                                    product.type === "COACHING" ? "📅" :
                                                        product.type === "COURSE" ? "🎓" :
                                                            product.type === "MEMBERSHIP" ? "🔒" : "📧"}
                                        </div>

                                        {/* Product Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold text-sm">{product.title}</h3>
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 border border-gray-100 px-1.5 py-0.5 rounded">
                                                    {product.type.replace("_", " ")}
                                                </span>
                                                {isAffiliate && (
                                                    <span className="text-[10px] font-bold bg-green-100 text-green-600 px-2 py-0.5 rounded-full">
                                                        AFFILIATE ON
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                                                <span>${product.price / 100}</span>
                                                <span>•</span>
                                                <span>{product.sales} sales</span>
                                                {isAffiliate && (
                                                    <>
                                                        <span>•</span>
                                                        <span className="text-blue-500 font-bold">{commission}% commission</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2 shrink-0">
                                            {isAffiliate && (
                                                <button
                                                    onClick={() => copyLink(product.id)}
                                                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${copiedLink === product.id
                                                        ? "bg-green-100 text-green-600 border border-green-200"
                                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200"
                                                        }`}
                                                >
                                                    {copiedLink === product.id ? "✓ Copied!" : "📋 Copy Link"}
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Affiliate Link Preview */}
                                    {isAffiliate && (
                                        <div className="mt-3 ml-16 p-3 bg-blue-50/50 border border-blue-100 rounded-xl text-xs font-mono text-blue-600 break-all">
                                            {affiliateLink}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
