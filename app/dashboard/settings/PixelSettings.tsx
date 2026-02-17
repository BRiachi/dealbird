"use client";

import { useState } from "react";

interface Pixels {
    meta?: string;
    tiktok?: string;
    google?: string;
    snapchat?: string;
    pinterest?: string;
}

const PIXEL_FIELDS = [
    { key: "meta" as keyof Pixels, label: "Meta (Facebook) Pixel", placeholder: "e.g. 123456789012345", icon: "📘", color: "bg-blue-50 border-blue-200" },
    { key: "tiktok" as keyof Pixels, label: "TikTok Pixel", placeholder: "e.g. C1234567890", icon: "🎵", color: "bg-gray-50 border-gray-200" },
    { key: "google" as keyof Pixels, label: "Google Analytics / Tag", placeholder: "e.g. G-XXXXXXXXXX", icon: "📊", color: "bg-yellow-50 border-yellow-200" },
    { key: "snapchat" as keyof Pixels, label: "Snapchat Pixel", placeholder: "e.g. abc123-def456", icon: "👻", color: "bg-amber-50 border-amber-200" },
    { key: "pinterest" as keyof Pixels, label: "Pinterest Tag", placeholder: "e.g. 1234567890", icon: "📌", color: "bg-red-50 border-red-200" },
];

export function PixelSettings({ initialPixels }: { initialPixels: Pixels }) {
    const [pixels, setPixels] = useState<Pixels>(initialPixels);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch("/api/user/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ pixels }),
            });
            if (res.ok) {
                setSaved(true);
                setTimeout(() => setSaved(false), 2500);
            }
        } catch { }
        setSaving(false);
    };

    const activeCount = Object.values(pixels).filter(v => v && v.trim()).length;

    return (
        <div className="space-y-4">
            {PIXEL_FIELDS.map(field => (
                <div key={field.key} className={`p-4 rounded-xl border ${field.color} transition-all`}>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{field.icon}</span>
                        <label className="text-sm font-bold text-gray-700">{field.label}</label>
                        {pixels[field.key] && (
                            <span className="text-[10px] font-bold bg-green-100 text-green-600 px-1.5 py-0.5 rounded-full ml-auto">ACTIVE</span>
                        )}
                    </div>
                    <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm font-mono focus:ring-2 focus:ring-[#C8FF00] focus:border-transparent outline-none transition-all"
                        placeholder={field.placeholder}
                        value={pixels[field.key] || ""}
                        onChange={(e) => setPixels({ ...pixels, [field.key]: e.target.value })}
                    />
                </div>
            ))}

            <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-gray-400">
                    {activeCount} pixel{activeCount !== 1 ? "s" : ""} configured — scripts inject into your public store automatically
                </span>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-2.5 bg-[#C8FF00] text-black font-bold text-sm rounded-xl hover:bg-[#9FCC00] transition-all disabled:opacity-50"
                >
                    {saved ? "✓ Saved!" : saving ? "Saving..." : "Save Pixels"}
                </button>
            </div>
        </div>
    );
}
