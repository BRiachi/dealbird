"use client";

import { Download, Video, Calendar, ArrowRight, ExternalLink, Star } from "lucide-react";
import { cn } from "@/lib/utils";

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
    product: Product;
    theme: ThemeColors;
    accentColor: string;
    isLightAccent: boolean;
    onAction: (product: Product) => void;
}

export function ProductCard({ product, theme, accentColor, isLightAccent, onAction }: Props) {
    const price = product.price;
    const discountPrice = product.settings?.discountPrice;
    const hasDiscount = discountPrice && discountPrice < price;

    const Icon = product.type === "DIGITAL" ? Download :
        product.type === "COACHING" ? Calendar :
            product.type === "COURSE" ? Video :
                product.type === "MEMBERSHIP" ? Star :
                    product.type === "URL" ? ExternalLink : ArrowRight;

    // Button colors (adaptive)
    const btnText = isLightAccent ? "#000" : "#fff";

    return (
        <div
            onClick={() => onAction(product)}
            className="group relative flex flex-col overflow-hidden rounded-[2rem] border transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 cursor-pointer"
            style={{
                backgroundColor: theme.card,
                borderColor: theme.cardBorder,
                color: theme.text,
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)"
            }}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            {/* Image Area */}
            {product.image && (
                <div className="relative h-56 w-full overflow-hidden bg-gray-100">
                    <img
                        src={product.image!}
                        alt={product.title}
                        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    {/* Overlay Gradient on hover */}
                    <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/10" />

                    {/* Floating Badge */}
                    <div className="absolute top-4 left-4 backdrop-blur-md bg-white/90 dark:bg-black/80 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg flex items-center gap-1.5 border border-black/5">
                        <Icon className="h-3 w-3" />
                        <span>
                            {product.type === "DIGITAL" ? "Download" :
                                product.type === "COACHING" ? "Book Now" :
                                    product.type === "COURSE" ? "Course" :
                                        product.type === "MEMBERSHIP" ? "Membership" :
                                            product.type === "URL" ? "Link" : "Product"}
                        </span>
                    </div>
                </div>
            )}

            {/* Content Area */}
            <div className={`flex flex-1 flex-col p-6 ${!product.image ? 'pt-8' : ''}`}>
                {!product.image && (
                    <div className="mb-4">
                        <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider bg-black/5 text-black/70">
                            <Icon className="h-3 w-3" />
                            <span>
                                {product.type}
                            </span>
                        </div>
                    </div>
                )}

                <h3 className="mb-2 text-xl font-bold leading-tight tracking-tight group-hover:text-opacity-80 transition-colors">
                    {product.title}
                </h3>

                {product.subtitle && (
                    <p className="mb-6 line-clamp-2 text-sm opacity-60 leading-relaxed font-medium">
                        {product.subtitle}
                    </p>
                )}

                {/* Price Display */}
                {product.type !== "URL" && price > 0 && (
                    <div className="mb-6 font-bold text-lg">
                        {hasDiscount ? (
                            <div className="flex items-center gap-2">
                                <span className="text-[#00B67A]">${discountPrice / 100}{product.type === "MEMBERSHIP" ? "/mo" : ""}</span>
                                <span className="text-sm line-through opacity-40">${price / 100}</span>
                            </div>
                        ) : (
                            <span>${price / 100}{product.type === "MEMBERSHIP" ? "/mo" : ""}</span>
                        )}
                    </div>
                )}

                {/* Call to Action (pushed to bottom) */}
                <div className="mt-auto">
                    <button
                        className="relative overflow-hidden flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-sm font-bold transition-all duration-300 group-hover:shadow-lg active:scale-95"
                        style={{
                            backgroundColor: accentColor,
                            color: btnText,
                        }}
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            {product.settings?.buttonText || (product.type === "URL" ? "Visit Link" : "Get Access")}
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </span>
                        <div className="absolute inset-0 bg-white/20 translate-y-full transition-transform duration-300 group-hover:translate-y-0" />
                    </button>

                    {product.settings?.duration && (
                        <div className="mt-3 text-center text-xs opacity-50 font-medium flex items-center justify-center gap-1">
                            <Calendar className="w-3 h-3" /> {product.settings.duration} min session
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
