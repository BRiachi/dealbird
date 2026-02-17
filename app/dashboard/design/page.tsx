"use client";

import { useState, useEffect } from "react";

const THEMES = [
    { id: "simple", label: "Simple", bg: "#FFFFFF", text: "#000000", card: "#F9FAFB", desc: "Clean white background" },
    { id: "dark", label: "Dark", bg: "#0A0A0A", text: "#FFFFFF", card: "#1A1A1A", desc: "Sleek dark mode" },
    { id: "warm", label: "Warm", bg: "#FFF8F0", text: "#1A1A1A", card: "#FFFFFF", desc: "Soft warm tones" },
    { id: "ocean", label: "Ocean", bg: "#F0F7FF", text: "#0A1628", card: "#FFFFFF", desc: "Cool ocean vibes" },
    { id: "forest", label: "Forest", bg: "#F0FFF4", text: "#1A2E1A", card: "#FFFFFF", desc: "Natural green tones" },
    { id: "sunset", label: "Sunset", bg: "#FFF5F5", text: "#1A0A0A", card: "#FFFFFF", desc: "Warm sunset hues" },
    { id: "midnight", label: "Midnight", bg: "#0F172A", text: "#E2E8F0", card: "#1E293B", desc: "Deep blue darkness" },
    { id: "lavender", label: "Lavender", bg: "#FAF5FF", text: "#1A1033", card: "#FFFFFF", desc: "Soft purple feel" },
];

const FONTS = [
    { id: "Inter", label: "Inter", style: "font-sans" },
    { id: "DM Sans", label: "DM Sans", style: "font-sans" },
    { id: "Outfit", label: "Outfit", style: "font-sans" },
    { id: "Poppins", label: "Poppins", style: "font-sans" },
    { id: "Space Grotesk", label: "Space Grotesk", style: "font-sans" },
    { id: "Playfair Display", label: "Playfair Display", style: "font-serif" },
    { id: "Lora", label: "Lora", style: "font-serif" },
    { id: "Roboto Mono", label: "Roboto Mono", style: "font-mono" },
];

const PRESET_COLORS = [
    "#000000", "#C8FF00", "#FF6B6B", "#4ECDC4", "#45B7D1",
    "#96CEB4", "#FFEAA7", "#DDA0DD", "#FF8C42", "#98D8C8",
    "#6C5CE7", "#FD79A8", "#00B894", "#E17055", "#0984E3",
];

export default function DesignPage() {
    const [theme, setTheme] = useState("simple");
    const [accentColor, setAccentColor] = useState("#000000");
    const [font, setFont] = useState("Inter");
    const [avatar, setAvatar] = useState<string | null>(null);
    const [handle, setHandle] = useState("");
    const [bio, setBio] = useState("");
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/user/profile")
            .then((r) => r.json())
            .then((data) => {
                setTheme(data.theme || "simple");
                setAccentColor(data.accentColor || "#000000");
                setFont(data.font || "Inter");
                setAvatar(data.avatar || data.image || null);
                setHandle(data.handle || "yourname");
                setBio(data.bio || "");
                setLoading(false);
            });
    }, []);

    const save = async () => {
        setSaving(true);
        setSaved(false);
        await fetch("/api/user/profile", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ theme, accentColor, font }),
        });
        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const currentTheme = THEMES.find((t) => t.id === theme) || THEMES[0];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-8 h-8 border-2 border-black/10 border-t-black rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight mb-1">
                        Store Design
                    </h1>
                    <p className="text-gray-500">
                        Customize how your public store looks.
                    </p>
                </div>
                <button
                    onClick={save}
                    disabled={saving}
                    className={`px-6 py-2.5 font-bold text-sm rounded-xl transition-all ${saved
                        ? "bg-green-100 text-green-700 border-2 border-green-200"
                        : "bg-[#C8FF00] text-black hover:bg-[#9FCC00] border-2 border-transparent"
                        }`}
                >
                    {saving ? "Saving..." : saved ? "✓ Saved" : "Save Changes"}
                </button>
            </div>

            <div className="grid lg:grid-cols-[1fr_380px] gap-8">
                {/* Controls */}
                <div className="space-y-6">
                    {/* Theme Picker */}
                    <div className="bg-white rounded-2xl border border-black/[0.07] p-6">
                        <h3 className="font-bold text-base mb-1">Theme</h3>
                        <p className="text-xs text-gray-400 mb-5">
                            Choose a base look for your storefront
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {THEMES.map((t) => (
                                <button
                                    key={t.id}
                                    onClick={() => setTheme(t.id)}
                                    className={`relative rounded-xl border-2 p-3 transition-all text-left ${theme === t.id
                                        ? "border-black shadow-sm"
                                        : "border-black/[0.07] hover:border-black/20"
                                        }`}
                                >
                                    <div
                                        className="w-full h-12 rounded-lg mb-2.5 border border-black/5"
                                        style={{ backgroundColor: t.bg }}
                                    >
                                        <div
                                            className="w-2/3 h-2 rounded-full mt-3 ml-2"
                                            style={{ backgroundColor: t.text, opacity: 0.3 }}
                                        />
                                        <div
                                            className="w-1/2 h-2 rounded-full mt-1.5 ml-2"
                                            style={{ backgroundColor: t.text, opacity: 0.15 }}
                                        />
                                    </div>
                                    <div className="text-xs font-bold">{t.label}</div>
                                    <div className="text-[10px] text-gray-400 leading-tight">
                                        {t.desc}
                                    </div>
                                    {theme === t.id && (
                                        <div className="absolute top-2 right-2 w-5 h-5 bg-black rounded-full flex items-center justify-center">
                                            <svg
                                                className="w-3 h-3 text-white"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                                strokeWidth={3}
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M5 13l4 4L19 7"
                                                />
                                            </svg>
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Accent Color */}
                    <div className="bg-white rounded-2xl border border-black/[0.07] p-6">
                        <h3 className="font-bold text-base mb-1">Accent Color</h3>
                        <p className="text-xs text-gray-400 mb-5">
                            Used for buttons and highlights on your store
                        </p>
                        <div className="flex flex-wrap gap-2.5 mb-4">
                            {PRESET_COLORS.map((c) => (
                                <button
                                    key={c}
                                    onClick={() => setAccentColor(c)}
                                    className={`w-9 h-9 rounded-xl transition-all ${accentColor === c
                                        ? "ring-2 ring-offset-2 ring-black scale-110"
                                        : "hover:scale-105"
                                        }`}
                                    style={{ backgroundColor: c }}
                                />
                            ))}
                        </div>
                        <div className="flex items-center gap-3">
                            <label className="text-xs font-semibold text-gray-400">
                                Custom:
                            </label>
                            <div className="relative">
                                <input
                                    type="color"
                                    value={accentColor}
                                    onChange={(e) => setAccentColor(e.target.value)}
                                    className="w-10 h-10 rounded-lg cursor-pointer border-0 p-0"
                                />
                            </div>
                            <input
                                type="text"
                                value={accentColor}
                                onChange={(e) => setAccentColor(e.target.value)}
                                className="w-24 px-3 py-2 rounded-lg border border-black/10 text-sm font-mono font-bold"
                            />
                        </div>
                    </div>

                    {/* Font Picker */}
                    <div className="bg-white rounded-2xl border border-black/[0.07] p-6">
                        <h3 className="font-bold text-base mb-1">Font</h3>
                        <p className="text-xs text-gray-400 mb-5">
                            Choose a typeface for your storefront
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                            {FONTS.map((f) => (
                                <button
                                    key={f.id}
                                    onClick={() => setFont(f.id)}
                                    className={`rounded-xl border-2 p-4 transition-all text-left ${font === f.id
                                        ? "border-black shadow-sm"
                                        : "border-black/[0.07] hover:border-black/20"
                                        }`}
                                >
                                    <link
                                        href={`https://fonts.googleapis.com/css2?family=${f.id.replace(
                                            / /g,
                                            "+"
                                        )}&display=swap`}
                                        rel="stylesheet"
                                    />
                                    <div
                                        className="text-lg font-bold mb-1"
                                        style={{ fontFamily: `'${f.id}', sans-serif` }}
                                    >
                                        Aa Bb Cc
                                    </div>
                                    <div className="text-xs font-semibold text-gray-500">
                                        {f.label}
                                    </div>
                                    {font === f.id && (
                                        <div className="mt-2 text-[10px] font-bold text-black bg-black/5 rounded-md px-2 py-0.5 inline-block">
                                            Selected
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Live Preview */}
                <div className="lg:sticky lg:top-24 h-fit">
                    <div className="bg-white rounded-2xl border border-black/[0.07] p-4 mb-3">
                        <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 mb-3">
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                />
                            </svg>
                            LIVE PREVIEW
                        </div>

                        {/* Phone frame preview */}
                        <div
                            className="rounded-2xl overflow-hidden border border-black/10"
                            style={{
                                backgroundColor: currentTheme.bg,
                                fontFamily: `'${font}', sans-serif`,
                            }}
                        >
                            <link
                                href={`https://fonts.googleapis.com/css2?family=${font.replace(
                                    / /g,
                                    "+"
                                )}&display=swap`}
                                rel="stylesheet"
                            />
                            <div className="px-6 py-8 text-center">
                                {/* Avatar */}
                                <div className="w-16 h-16 rounded-full mx-auto mb-3 overflow-hidden border-2 border-white shadow-sm">
                                    {avatar ? (
                                        <img
                                            src={avatar}
                                            alt=""
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div
                                            className="w-full h-full flex items-center justify-center text-xl font-bold"
                                            style={{
                                                background: `linear-gradient(135deg, ${accentColor}, ${accentColor}88)`,
                                                color: "#fff",
                                            }}
                                        >
                                            {handle[0]?.toUpperCase() || "U"}
                                        </div>
                                    )}
                                </div>

                                {/* Name */}
                                <h3
                                    className="font-bold text-base mb-1"
                                    style={{ color: currentTheme.text }}
                                >
                                    @{handle}
                                </h3>
                                {bio && (
                                    <p
                                        className="text-xs leading-relaxed mb-6 max-w-[200px] mx-auto"
                                        style={{ color: currentTheme.text, opacity: 0.6 }}
                                    >
                                        {bio.length > 60 ? bio.slice(0, 60) + "..." : bio}
                                    </p>
                                )}

                                {/* Sample products */}
                                <div className="space-y-2.5 mt-4">
                                    {["Digital Product", "Coaching Call", "Free Guide"].map(
                                        (name, i) => (
                                            <div
                                                key={i}
                                                className="rounded-xl p-3 text-left border"
                                                style={{
                                                    backgroundColor: currentTheme.card,
                                                    borderColor: `${currentTheme.text}10`,
                                                }}
                                            >
                                                <div
                                                    className="text-xs font-bold mb-2"
                                                    style={{ color: currentTheme.text }}
                                                >
                                                    {name}
                                                </div>
                                                <div
                                                    className="w-full py-2 rounded-lg text-center text-xs font-bold"
                                                    style={{
                                                        backgroundColor: accentColor,
                                                        color:
                                                            accentColor === "#000000" ||
                                                                accentColor === "#0A0A0A"
                                                                ? "#fff"
                                                                : "#000",
                                                    }}
                                                >
                                                    {i === 2 ? "Get it Free" : `$${(i + 1) * 19}`}
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>

                                {/* Powered by */}
                                <div
                                    className="mt-6 text-[10px] font-bold"
                                    style={{ color: currentTheme.text, opacity: 0.3 }}
                                >
                                    Powered by DealBird
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Store URL */}
                    {handle && (
                        <div className="bg-white rounded-2xl border border-black/[0.07] p-4 text-center">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                                Your Store URL
                            </p>
                            <a
                                href={`/u/${handle}`}
                                target="_blank"
                                className="text-sm font-bold text-black hover:underline"
                            >
                                dealbird.ai/u/{handle}
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
