"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UploadButton } from "@/app/utils/uploadthing";
import { AnalyticsChart } from "./AnalyticsChart";

// Types matching Prisma Enum
type ProductType = "URL" | "DIGITAL" | "COACHING" | "COLLECT_EMAIL" | "COURSE" | "MEMBERSHIP";

interface ProductSettings {
    url?: string;
    fileUrl?: string;
    fileName?: string;
    duration?: number;
    description?: string;
    discountPrice?: number; // cents
    checkoutFields?: {
        name: boolean;
        email: boolean;
        phone: boolean;
    };
    orderBump?: {
        active: boolean;
        productId: string;
        price?: number;
    };
    affiliate?: {
        active: boolean;
        commission: number;
    };
    limitQuantity?: number;
}

interface Product {
    id: string;
    type: ProductType;
    title: string;
    subtitle?: string;
    price: number;
    image?: string;
    buttonText?: string;
    order: number;
    clicks: number;
    sales: number;
    revenue: number;
    settings?: ProductSettings;
    archived: boolean;
}

interface UserProfile {
    handle: string;
    bio: string;
    avatar: string;
    theme: string;
}

export default function StorePage() {
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    // Editor State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [activeTab, setActiveTab] = useState<"detail" | "advanced">("detail");

    const [analytics, setAnalytics] = useState<{
        totalRevenue: number;
        totalSales: number;
        totalViews: number;
        chartData: any[];
    } | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = () => {
        Promise.all([
            fetch("/api/products").then((res) => res.json()),
            fetch("/api/user/profile").then((res) => res.json()),
            fetch("/api/analytics").then((res) => res.json()),
        ]).then(([productsData, profileData, analyticsData]) => {
            setProducts(productsData);
            setProfile(profileData);
            setAnalytics(analyticsData);
            setLoading(false);
        });
    };

    const createProduct = async (type: ProductType) => {
        const titles: Record<string, string> = {
            URL: "New Link",
            DIGITAL: "Digital Download",
            COACHING: "1:1 Coaching Call",
            COLLECT_EMAIL: "Join My Newsletter",
            COURSE: "Online Course",
            MEMBERSHIP: "Membership"
        };

        const res = await fetch("/api/products", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                type,
                title: titles[type] || "New Product",
                price: type === "URL" || type === "COLLECT_EMAIL" ? 0 : 1000 // Default $10
            }),
        });

        if (res.ok) {
            const product = await res.json();
            setProducts([...products, product]);
            setIsAddModalOpen(false);
            setEditingProduct(product);
            setActiveTab("detail");
        }
    };

    const updateProduct = async (id: string, updates: Partial<Product>) => {
        // Optimistic
        setProducts(products.map(p => p.id === id ? { ...p, ...updates } : p));
        if (editingProduct?.id === id) {
            setEditingProduct(prev => prev ? { ...prev, ...updates } : null);
        }

        await fetch("/api/products", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, ...updates }),
        });
    };

    const updateSettings = (key: keyof ProductSettings, value: any) => {
        if (!editingProduct) return;
        const newSettings = { ...editingProduct.settings, [key]: value };
        updateProduct(editingProduct.id, { settings: newSettings });
    };

    const deleteProduct = async (id: string) => {
        if (!confirm("Delete this product?")) return;
        const res = await fetch(`/api/products?id=${id}`, { method: "DELETE" });
        if (res.ok) {
            setProducts(products.filter((p) => p.id !== id));
            if (editingProduct?.id === id) setEditingProduct(null);
        }
    };

    const updateProfile = async (field: string, value: string) => {
        setProfile(prev => prev ? { ...prev, [field]: value } : null);
        await fetch("/api/user/profile", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ [field]: value }),
        });
    };

    if (loading) return <div className="p-10 text-center text-gray-400">Loading your store...</div>;

    const renderEditor = () => {
        if (!editingProduct) return null;

        const isPaid = editingProduct.price > 0 || editingProduct.type === "DIGITAL" || editingProduct.type === "COACHING" || editingProduct.type === "COURSE";

        return (
            <div className="fixed inset-y-0 right-0 lg:right-[400px] w-full max-w-lg bg-white border-l border-r-0 lg:border-r shadow-2xl z-50 transform transition-transform overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-4 border-b flex justify-between items-center bg-white z-10">
                    <h2 className="font-bold text-lg truncate">Edit {editingProduct.title}</h2>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 font-medium hidden sm:block">Auto-saved</span>
                        <button
                            onClick={() => setEditingProduct(null)}
                            className="px-4 py-2 bg-black text-white font-bold text-sm rounded-lg hover:bg-gray-800 transition-colors"
                        >
                            Done
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                {isPaid && (
                    <div className="flex border-b bg-gray-50">
                        <button
                            onClick={() => setActiveTab("detail")}
                            className={`flex-1 py-3 text-sm font-bold ${activeTab === "detail" ? "text-blue-600 border-b-2 border-blue-600 bg-white" : "text-gray-500 hover:text-black"}`}
                        >
                            Checkout Page
                        </button>
                        <button
                            onClick={() => setActiveTab("advanced")}
                            className={`flex-1 py-3 text-sm font-bold ${activeTab === "advanced" ? "text-blue-600 border-b-2 border-blue-600 bg-white" : "text-gray-500 hover:text-black"}`}
                        >
                            Advanced
                        </button>
                    </div>
                )}

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">

                    {activeTab === "detail" && (
                        <>
                            {/* Basics */}
                            <div className="space-y-4">
                                <h3 className="font-bold text-xs uppercase text-gray-400 tracking-wider">Product Basics</h3>
                                <div>
                                    <label className="block text-sm font-semibold mb-1">Heading</label>
                                    <input
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#C8FF00] outline-none font-bold text-lg"
                                        value={editingProduct.title}
                                        onChange={(e) => updateProduct(editingProduct.id, { title: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-1">Subheading</label>
                                    <input
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#C8FF00] outline-none"
                                        value={editingProduct.subtitle || ""}
                                        onChange={(e) => updateProduct(editingProduct.id, { subtitle: e.target.value })}
                                        placeholder="Brief description"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-1">Description / Body</label>
                                    <textarea
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#C8FF00] outline-none min-h-[100px]"
                                        value={editingProduct.settings?.description || ""}
                                        onChange={(e) => updateSettings("description", e.target.value)}
                                        placeholder="Detailed info about your product..."
                                    />
                                </div>
                            </div>

                            {/* URL specific */}
                            {editingProduct.type === "URL" && (
                                <div>
                                    <label className="block text-sm font-semibold mb-1">Destination URL</label>
                                    <input
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#C8FF00] outline-none font-mono text-sm"
                                        value={editingProduct.settings?.url || ""}
                                        onChange={(e) => updateSettings("url", e.target.value)}
                                        placeholder="https://"
                                    />
                                </div>
                            )}

                            {/* Digital Product: File Upload */}
                            {editingProduct.type === "DIGITAL" && (
                                <div className="space-y-2 p-4 bg-gray-50 rounded-xl border border-dashed border-gray-300 text-center">
                                    <h3 className="font-bold text-sm text-gray-500 uppercase tracking-wider mb-2">Digital File</h3>

                                    {editingProduct.settings?.fileUrl ? (
                                        <div className="flex items-center justify-between bg-white p-3 rounded-lg border">
                                            <div className="flex items-center gap-2 overflow-hidden">
                                                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded flex items-center justify-center">📄</div>
                                                <span className="text-sm truncate max-w-[150px]">{editingProduct.settings.fileName || "Uploaded File"}</span>
                                            </div>
                                            <button
                                                onClick={() => updateSettings("fileUrl", "")}
                                                className="text-red-500 text-xs font-bold hover:underline"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ) : (
                                        <UploadButton
                                            endpoint="productFile"
                                            onClientUploadComplete={(res) => {
                                                if (res?.[0]) {
                                                    updateSettings("fileUrl", res[0].url);
                                                    updateSettings("fileName", res[0].name);
                                                    alert("File uploaded!");
                                                }
                                            }}
                                            onUploadError={(error: Error) => {
                                                alert(`ERROR! ${error.message}`);
                                            }}
                                            appearance={{
                                                button: "bg-black text-white px-4 py-2 rounded-lg text-sm font-bold w-full"
                                            }}
                                        />
                                    )}
                                    <p className="text-[10px] text-gray-400">PDF, Zip, Images up to 32MB</p>
                                </div>
                            )}

                            {/* Coaching: Calendar URL */}
                            {editingProduct.type === "COACHING" && (
                                <div className="p-4 bg-gray-50 rounded-xl border">
                                    <h3 className="font-bold text-sm text-gray-500 uppercase tracking-wider mb-2">Booking Link</h3>
                                    <label className="block text-sm font-semibold mb-1">Calendar URL</label>
                                    <input
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#C8FF00] outline-none font-mono text-sm"
                                        value={editingProduct.settings?.url || ""}
                                        onChange={(e) => updateSettings("url", e.target.value)}
                                        placeholder="https://calendly.com/your-link"
                                    />
                                    <p className="text-[10px] text-gray-400 mt-1">Link to Calendly, Cal.com, etc.</p>
                                </div>
                            )}

                            {/* Pricing */}
                            {isPaid && (
                                <div className="space-y-4 pt-4 border-t">
                                    <h3 className="font-bold text-xs uppercase text-gray-400 tracking-wider">Pricing</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold mb-1">Price ($)</label>
                                            <input
                                                type="number"
                                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#C8FF00] outline-none"
                                                value={editingProduct.price / 100}
                                                onChange={(e) => updateProduct(editingProduct.id, { price: parseFloat(e.target.value || "0") * 100 })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold mb-1">Discount Price ($)</label>
                                            <input
                                                type="number"
                                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#C8FF00] outline-none"
                                                placeholder="Optional"
                                                value={(editingProduct.settings?.discountPrice || 0) / 100 || ""}
                                                onChange={(e) => updateSettings("discountPrice", parseFloat(e.target.value || "0") * 100)}
                                            />
                                            <p className="text-[10px] text-gray-400 mt-1">Shows as strikethrough</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Checkout Fields */}
                            {isPaid && (
                                <div className="space-y-4 pt-4 border-t">
                                    <h3 className="font-bold text-xs uppercase text-gray-400 tracking-wider">Checkout Form</h3>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <span className="font-semibold text-sm">Name</span>
                                            <span className="text-xs text-gray-400 font-mono">REQUIRED</span>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <span className="font-semibold text-sm">Email</span>
                                            <span className="text-xs text-gray-400 font-mono">REQUIRED</span>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                                            <span className="font-semibold text-sm">Phone Number</span>
                                            <input
                                                type="checkbox"
                                                className="w-5 h-5 accent-black"
                                                checked={editingProduct.settings?.checkoutFields?.phone || false}
                                                onChange={(e) => updateSettings("checkoutFields", { ...editingProduct.settings?.checkoutFields, phone: e.target.checked })}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-1">Button Text</label>
                                        <input
                                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#C8FF00] outline-none"
                                            value={editingProduct.buttonText || ""}
                                            onChange={(e) => updateProduct(editingProduct.id, { buttonText: e.target.value })}
                                            placeholder="Download Now / Book Call"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Coaching specific */}
                            {editingProduct.type === "COACHING" && (
                                <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                                    <h3 className="font-bold text-sm text-purple-800 uppercase tracking-wider mb-2">Availability & Schedule</h3>
                                    <p className="text-sm text-purple-600 mb-3">Set your meeting duration, location, and weekly hours.</p>
                                    <button
                                        onClick={() => router.push(`/dashboard/appointments/${editingProduct.id}`)}
                                        className="w-full py-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-colors"
                                    >
                                        Edit Availability →
                                    </button>
                                </div>
                            )}
                            {/* Course: Curriculum Builder Link */}
                            {editingProduct.type === "COURSE" && (
                                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                                    <h3 className="font-bold text-sm text-blue-800 uppercase tracking-wider mb-2">Course Content</h3>
                                    <p className="text-sm text-blue-600 mb-3">Manage modules, lessons, and video content.</p>
                                    <button
                                        onClick={() => router.push(`/dashboard/courses/${editingProduct.id}`)}
                                        className="w-full py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        Edit Curriculum →
                                    </button>
                                </div>
                            )}
                        </>
                    )}

                    {activeTab === "advanced" && (
                        <div className="space-y-6">
                            {/* Order Bump */}
                            <div className="p-4 border rounded-xl bg-gray-50">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h3 className="font-bold text-sm">Order Bump</h3>
                                        <p className="text-xs text-gray-500">Offer an add-on at checkout</p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="w-6 h-6 accent-blue-600"
                                        checked={editingProduct.settings?.orderBump?.active || false}
                                        onChange={(e) => updateSettings("orderBump", { ...editingProduct.settings?.orderBump, active: e.target.checked })}
                                    />
                                </div>
                                {editingProduct.settings?.orderBump?.active && (
                                    <div className="space-y-3 bg-white p-3 rounded-lg border">
                                        <p className="text-xs text-gray-400 uppercase font-bold">Select Product</p>
                                        <select
                                            className="w-full p-2 border rounded text-sm"
                                            value={editingProduct.settings?.orderBump?.productId || ""}
                                            onChange={(e) => updateSettings("orderBump", { ...editingProduct.settings?.orderBump, productId: e.target.value })}
                                        >
                                            <option value="">-- Choose Product --</option>
                                            {products.filter(p => p.id !== editingProduct.id && p.price > 0).map(p => (
                                                <option key={p.id} value={p.id}>{p.title} (${p.price / 100})</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>

                            {/* Quantity Limit */}
                            <div className="p-4 border rounded-xl bg-gray-50">
                                <h3 className="font-bold text-sm mb-2">Limit Quantity</h3>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm">Max Sales:</span>
                                    <input
                                        type="number"
                                        className="w-24 p-2 border rounded text-sm"
                                        placeholder="Unl."
                                        value={editingProduct.settings?.limitQuantity || ""}
                                        onChange={(e) => updateSettings("limitQuantity", e.target.value ? parseInt(e.target.value) : undefined)}
                                    />
                                </div>
                            </div>

                            {/* Affiliate */}
                            <div className="p-4 border rounded-xl bg-gray-50">
                                <div className="flex items-center justify-between mb-2">
                                    <div>
                                        <h3 className="font-bold text-sm">Affiliate Program</h3>
                                        <p className="text-xs text-gray-500">Allow others to sell this</p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="w-6 h-6 accent-blue-600"
                                        checked={editingProduct.settings?.affiliate?.active || false}
                                        onChange={(e) => updateSettings("affiliate", { ...editingProduct.settings?.affiliate, active: e.target.checked })}
                                    />
                                </div>
                                {editingProduct.settings?.affiliate?.active && (
                                    <div className="space-y-3 bg-white p-3 rounded-lg border mt-2">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Commission (%)</label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    className="w-20 p-2 border rounded text-sm font-bold"
                                                    value={editingProduct.settings?.affiliate?.commission || 20}
                                                    onChange={(e) => updateSettings("affiliate", { ...editingProduct.settings?.affiliate, commission: parseInt(e.target.value) })}
                                                />
                                                <span className="text-sm font-bold">%</span>
                                            </div>
                                        </div>
                                        <div className="p-2 bg-blue-50 text-blue-700 text-xs rounded border border-blue-100 break-all">
                                            <strong>Affiliate Link:</strong><br />
                                            dealbird.ai/u/{profile?.handle}/{editingProduct.id}?ref=[affiliate_handle]
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="pt-6 border-t flex flex-col gap-3">
                        <button
                            onClick={() => setEditingProduct(null)}
                            className="w-full py-3 rounded-xl bg-black text-white font-bold transition-colors hover:bg-gray-800"
                        >
                            Done
                        </button>
                        <button
                            onClick={() => deleteProduct(editingProduct.id)}
                            className="w-full py-2.5 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 text-sm font-semibold transition-colors"
                        >
                            Delete Product
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const renderAnalytics = () => {
        if (!analytics) return null;
        return (
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-bold">Performance</h2>
                        <p className="text-sm text-gray-500">Last 30 Days</p>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-black">${analytics.totalRevenue.toFixed(2)}</div>
                        <div className="text-xs text-gray-400 uppercase font-bold tracking-wider">Total Revenue</div>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="p-4 bg-gray-50 rounded-xl">
                        <div className="text-xs text-gray-400 font-bold uppercase mb-1">Sales</div>
                        <div className="text-lg font-bold">{analytics.totalSales}</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl">
                        <div className="text-xs text-gray-400 font-bold uppercase mb-1">Views</div>
                        <div className="text-lg font-bold">{analytics.totalViews}</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl">
                        <div className="text-xs text-gray-400 font-bold uppercase mb-1">Conv. Rate</div>
                        <div className="text-lg font-bold">
                            {analytics.totalViews > 0 ? ((analytics.totalSales / analytics.totalViews) * 100).toFixed(1) : 0}%
                        </div>
                    </div>
                </div>

                <div className="h-[200px]">
                    <AnalyticsChart data={analytics.chartData} />
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] overflow-hidden bg-gray-50/50">
            {/* Left: Main Content */}
            <div className="flex-1 overflow-y-auto p-6 lg:p-10 pb-32">
                <div className="max-w-3xl mx-auto space-y-8">

                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-extrabold mb-1">My Store</h1>
                            <a href={`/u/${profile?.handle}`} target="_blank" className="text-sm text-gray-500 hover:text-black flex items-center gap-1">
                                <span>dealbird.ai/u/{profile?.handle}</span>
                                <span className="text-xs px-1.5 py-0.5 bg-green-100 text-green-700 rounded-full font-bold">LIVE</span>
                            </a>
                        </div>
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="bg-[#C8FF00] hover:bg-[#B8EB00] text-black font-bold px-6 py-3 rounded-xl shadow-sm transition-all transform hover:scale-105"
                        >
                            + Add Product
                        </button>
                    </div>

                    {/* Analytics */}
                    {renderAnalytics()}

                    {/* Products Grid / List */}
                    <div className="space-y-4">
                        {products.map(product => (
                            <div
                                key={product.id}
                                onClick={() => setEditingProduct(product)}
                                className={`bg-white p-5 rounded-2xl border transition-all cursor-pointer group relative hover:shadow-md ${editingProduct?.id === product.id ? 'border-black ring-1 ring-black' : 'border-gray-100 hover:border-gray-300'}`}
                            >
                                <div className="flex items-center gap-5">
                                    {/* Icon / Thumbnail */}
                                    <div className="w-16 h-16 rounded-xl bg-gray-50 flex items-center justify-center text-3xl shadow-inner scale-100 group-hover:scale-105 transition-transform">
                                        {product.type === "URL" ? "🔗" :
                                            product.type === "DIGITAL" ? "📂" :
                                                product.type === "COACHING" ? "📅" :
                                                    product.type === "COURSE" ? "🎓" :
                                                        product.type === "MEMBERSHIP" ? "🔒" : "📧"}
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 border border-gray-100 px-1.5 py-0.5 rounded">
                                                {product.type === "URL" ? "Link" : product.type.replace("_", " ")}
                                            </span>
                                            {product.archived && <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">Hidden</span>}
                                        </div>
                                        <h3 className="font-bold text-lg leading-tight">{product.title}</h3>
                                        {product.subtitle && <p className="text-sm text-gray-500">{product.subtitle}</p>}
                                        {/* Discount Price Indicator */}
                                        {product.settings?.discountPrice && product.settings.discountPrice < product.price && (
                                            <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold ml-2">SALE</span>
                                        )}
                                    </div>

                                    {/* Stats / Price */}
                                    <div className="text-right">
                                        {product.price > 0 && (
                                            <div className="font-bold text-lg mb-1 flex flex-col items-end">
                                                {product.settings?.discountPrice && product.settings.discountPrice < product.price ? (
                                                    <>
                                                        <span className="text-red-500">${product.settings.discountPrice / 100}</span>
                                                        <span className="text-xs text-gray-400 line-through">${product.price / 100}</span>
                                                    </>
                                                ) : (
                                                    <span>${product.price / 100}</span>
                                                )}
                                            </div>
                                        )}
                                        <div className="text-xs text-gray-400 font-mono">
                                            {product.sales} sales
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Profile Settings (Simplified) */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4 mt-8">
                        <h2 className="font-bold text-lg">Store Appearance</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Handle</label>
                                <div className="flex bg-gray-50 rounded-lg border border-gray-200 px-3 py-2">
                                    <span className="text-gray-400 select-none">dealbird.ai/u/</span>
                                    <input
                                        type="text"
                                        className="bg-transparent focus:outline-none flex-1 font-mono text-sm"
                                        value={profile?.handle || ""}
                                        onChange={(e) => updateProfile("handle", e.target.value)}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Bio</label>
                                <input
                                    type="text"
                                    className="w-full bg-gray-50 rounded-lg border border-gray-200 px-3 py-2 focus:outline-none text-sm"
                                    placeholder="Your bio..."
                                    value={profile?.bio || ""}
                                    onChange={(e) => updateProfile("bio", e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Right: Preview (Mobile) */}
            <div className="hidden lg:flex w-[400px] border-l border-gray-200 bg-white items-center justify-center p-8 sticky top-0 h-[calc(100vh-64px)]">
                <div className="w-[300px] h-[600px] bg-gray-50 rounded-[40px] border-[10px] border-gray-900 shadow-2xl overflow-hidden relative">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-2xl z-20"></div>
                    <div className="h-full overflow-y-auto hide-scrollbar pt-12 px-4 pb-8 text-center">
                        {/* Preview Header */}
                        <div className="mb-6">
                            <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-3 overflow-hidden border-2 border-white shadow">
                                {profile?.avatar && <img src={profile.avatar} className="w-full h-full object-cover" />}
                            </div>
                            <h3 className="font-bold">@{profile?.handle}</h3>
                            <p className="text-xs text-gray-500 mt-1">{profile?.bio}</p>
                        </div>
                        {/* Preview Items */}
                        <div className="space-y-3">
                            {products.filter(p => !p.archived).map(p => (
                                <div key={p.id} className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm text-left flex items-start gap-3">
                                    <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center text-lg shrink-0">
                                        {p.type === "URL" ? "🔗" : p.type === "DIGITAL" ? "📂" : p.type === "COACHING" ? "📅" : "📦"}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold text-sm truncate">{p.title}</div>
                                        {p.price > 0 && (
                                            <div className="text-xs text-gray-500">
                                                {p.settings?.discountPrice && p.settings.discountPrice < p.price ? (
                                                    <>
                                                        <span className="text-red-500 font-bold">${p.settings.discountPrice / 100}</span>
                                                        <span className="line-through ml-1 opacity-50">${p.price / 100}</span>
                                                    </>
                                                ) : (
                                                    <span>${p.price / 100}</span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Product Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold">Add to your Store</h2>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-black">✕</button>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                { type: "URL", icon: "🔗", title: "External Link", desc: "Link to website, article, or video" },
                                { type: "DIGITAL", icon: "📂", title: "Digital Product", desc: "Sell e-books, guides, templates" },
                                { type: "COACHING", icon: "📅", title: "Coaching Call", desc: "Book 1:1 sessions & paid calls" },
                                { type: "COURSE", icon: "🎓", title: "Online Course", desc: "Video series and lessons" },
                                { type: "MEMBERSHIP", icon: "🔒", title: "Membership", desc: "Recurring subscription access" },
                                { type: "COLLECT_EMAIL", icon: "📧", title: "Collect Emails", desc: "Build your newsletter list" },
                            ].map((item) => (
                                <button
                                    key={item.type}
                                    onClick={() => createProduct(item.type as ProductType)}
                                    className="flex items-start gap-4 p-4 rounded-xl border border-gray-200 hover:border-black hover:bg-gray-50 transition-all text-left"
                                >
                                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-2xl">
                                        {item.icon}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">{item.title}</h3>
                                        <p className="text-sm text-gray-500">{item.desc}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Render Editor Drawer */}
            {renderEditor()}
        </div>
    );
}
