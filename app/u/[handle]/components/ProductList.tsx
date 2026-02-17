"use client";

import { useState } from "react";
import CheckoutModal from "./CheckoutModal";

interface Product {
    id: string;
    type: string;
    title: string;
    subtitle?: string | null;
    price: number;
    image?: string | null;
    settings?: any;
    order: number;
    archived: boolean;
}

interface ThemeColors {
    bg: string;
    text: string;
    card: string;
    cardBorder: string;
}

interface Props {
    products: Product[];
    username: string;
    theme?: ThemeColors;
    accentColor?: string;
    isLightAccent?: boolean;
}

export default function ProductList({
    products,
    username,
    theme = { bg: "#FFFFFF", text: "#000000", card: "#F9FAFB", cardBorder: "#E5E7EB" },
    accentColor = "#000000",
    isLightAccent = false,
}: Props) {
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    const handleBuy = (product: Product) => {
        setSelectedProduct(product);
    };

    // Helper to find bump product
    const getBumpProduct = (product: Product) => {
        const bumpId = product.settings?.orderBump?.active ? product.settings?.orderBump?.productId : null;
        if (!bumpId) return null;
        return products.find(p => p.id === bumpId);
    };

    const buttonTextColor = isLightAccent ? "#000" : "#fff";

    return (
        <div className="space-y-4">
            {products.map((product) => {
                if (product.type === "URL") {
                    const url = product.settings?.url || "#";
                    return (
                        <a
                            key={product.id}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full p-4 rounded-xl border text-center font-bold transition-transform hover:scale-[1.02] shadow-sm"
                            style={{
                                backgroundColor: theme.card,
                                borderColor: theme.cardBorder,
                                color: theme.text,
                            }}
                        >
                            {product.title}
                        </a>
                    );
                }

                const price = product.price;
                const discountPrice = product.settings?.discountPrice;
                const hasDiscount = discountPrice && discountPrice < price;

                return (
                    <div
                        key={product.id}
                        className="rounded-2xl border overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                        style={{
                            backgroundColor: theme.card,
                            borderColor: theme.cardBorder,
                        }}
                    >
                        {product.image && (
                            <div className="h-40 w-full overflow-hidden" style={{ backgroundColor: `${theme.text}08` }}>
                                <img src={product.image} className="w-full h-full object-cover" alt={product.title} />
                            </div>
                        )}

                        <div className="p-5">
                            <div className="flex items-start justify-between mb-2">
                                <div>
                                    <span
                                        className="text-[10px] font-bold uppercase tracking-wider mb-1 block"
                                        style={{ color: theme.text, opacity: 0.4 }}
                                    >
                                        {product.type === "DIGITAL" ? "Digital Download" :
                                            product.type === "COACHING" ? "Coaching Call" :
                                                product.type === "COURSE" ? "Course" : "Product"}
                                    </span>
                                    <h3 className="font-bold text-lg leading-tight" style={{ color: theme.text }}>
                                        {product.title}
                                    </h3>
                                </div>
                                {price > 0 && (
                                    <div
                                        className="px-2 py-1 rounded-lg font-bold text-sm"
                                        style={{ backgroundColor: `${theme.text}08`, color: theme.text }}
                                    >
                                        {hasDiscount ? (
                                            <>
                                                <span style={{ color: "#E53E3E" }}>${discountPrice / 100}</span>
                                                <span className="line-through opacity-50 ml-1 text-xs">${price / 100}</span>
                                            </>
                                        ) : (
                                            <span>${price / 100}</span>
                                        )}
                                    </div>
                                )}
                            </div>

                            {product.subtitle && (
                                <p className="text-sm mb-4 line-clamp-2" style={{ color: theme.text, opacity: 0.6 }}>
                                    {product.subtitle}
                                </p>
                            )}

                            <button
                                onClick={() => handleBuy(product)}
                                className="w-full py-3 font-bold rounded-xl transition-opacity hover:opacity-90 flex items-center justify-center gap-2"
                                style={{
                                    backgroundColor: accentColor,
                                    color: buttonTextColor,
                                }}
                            >
                                {product.settings?.buttonText || (product.type === "DIGITAL" ? "Download Now" : "Book Call")}
                                {product.settings?.duration && (
                                    <span className="text-xs font-normal opacity-70">
                                        • {product.settings.duration} min
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                );
            })}

            {/* Modal */}
            {selectedProduct && (
                <CheckoutModal
                    product={selectedProduct}
                    bumpProduct={getBumpProduct(selectedProduct)}
                    isOpen={!!selectedProduct}
                    onClose={() => setSelectedProduct(null)}
                />
            )}
        </div>
    );
}
