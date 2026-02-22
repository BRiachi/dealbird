"use client";

import { useState } from "react";
import CheckoutModal from "./CheckoutModal";
import { ProductCard } from "./ProductCard";

import BookingModal from "./BookingModal";

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
    layout?: string;
    buttonStyle?: string;
}

export default function ProductList({
    products,
    username,
    theme = { bg: "#FFFFFF", text: "#000000", card: "#F9FAFB", cardBorder: "#E5E7EB" },
    accentColor = "#000000",
    isLightAccent = false,
    layout = "grid-2",
    buttonStyle = "rounded",
}: Props) {
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [bookingProduct, setBookingProduct] = useState<Product | null>(null);
    const [bookingDate, setBookingDate] = useState<{ start: string; end: string } | null>(null);

    const handleAction = (product: Product) => {
        if (product.type === "URL") {
            const url = product.settings?.url || "#";
            window.open(url, "_blank");
            return;
        }
        if (product.type === "COACHING") {
            setBookingProduct(product);
        } else {
            setSelectedProduct(product);
            setBookingDate(null);
        }
    };

    const handleSlotSelect = (start: Date, end: Date) => {
        setBookingDate({ start: start.toISOString(), end: end.toISOString() });
        setSelectedProduct(bookingProduct);
        setBookingProduct(null); // Close booking modal
    };

    // Helper to find bump product
    const getBumpProduct = (product: Product) => {
        const bumpId = product.settings?.orderBump?.active ? product.settings?.orderBump?.productId : null;
        if (!bumpId) return null;
        return products.find(p => p.id === bumpId);
    };

    return (
        <div className="space-y-12">
            <div className={
                layout === "list"
                    ? "grid grid-cols-1 gap-6 sm:gap-8"
                    : layout === "grid-3"
                        ? "grid grid-cols-1 gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-3"
                        : "grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2"
            }>
                {products.map((product) => (
                    <ProductCard
                        key={product.id}
                        product={product}
                        theme={theme}
                        accentColor={accentColor}
                        isLightAccent={isLightAccent}
                        onAction={handleAction}
                        buttonStyle={buttonStyle}
                    />
                ))}
            </div>

            {/* Booking Modal */}
            {bookingProduct && (
                <BookingModal
                    productId={bookingProduct.id}
                    duration={bookingProduct.settings?.duration || 30} // Use updated settings later
                    isOpen={!!bookingProduct}
                    onClose={() => setBookingProduct(null)}
                    onSelect={handleSlotSelect}
                />
            )}

            {/* Checkout Modal */}
            {selectedProduct && (
                <CheckoutModal
                    product={selectedProduct}
                    bumpProduct={getBumpProduct(selectedProduct)}
                    isOpen={!!selectedProduct}
                    onClose={() => setSelectedProduct(null)}
                    bookingStart={bookingDate?.start}
                    bookingEnd={bookingDate?.end}
                />
            )}
        </div>
    );
}
