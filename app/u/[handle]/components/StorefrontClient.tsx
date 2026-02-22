"use client";

import { StoreFooter } from "./StoreFooter";
import ProductList from "./ProductList";

interface Product {
    id: string;
    title: string;
    description: string | null;
    price: number;
    image: string | null;
    type: string;
    currency: string;
    userId: string;
    order: number;
    archived: boolean;
    settings: any;
    sales: number;
    createdAt: Date;
    updatedAt: Date;
}

interface User {
    id: string;
    name: string | null;
    handle: string | null;
    image: string | null;
    avatar: string | null;
    bio: string | null;
    theme: string;
    accentColor: string | null;
    font: string;
    buttonStyle: string;
    backgroundType: string;
    backgroundValue: string | null;
    layout: string;
    socialLinks: any;
    pixels: any;
    products: Product[];
}

interface StorefrontClientProps {
    user: User;
}

const THEMES: Record<string, { bg: string; text: string; card: string; cardBorder: string }> = {
    simple: { bg: "#FFFFFF", text: "#000000", card: "#F9FAFB", cardBorder: "#E5E7EB" },
    dark: { bg: "#0A0A0A", text: "#FFFFFF", card: "#1A1A1A", cardBorder: "#2A2A2A" },
    warm: { bg: "#FFF8F0", text: "#1A1A1A", card: "#FFFFFF", cardBorder: "#F0E6D8" },
    ocean: { bg: "#F0F7FF", text: "#0A1628", card: "#FFFFFF", cardBorder: "#D0E3F5" },
    forest: { bg: "#F0FFF4", text: "#1A2E1A", card: "#FFFFFF", cardBorder: "#C6F6D5" },
    sunset: { bg: "#FFF5F5", text: "#1A0A0A", card: "#FFFFFF", cardBorder: "#FED7D7" },
    midnight: { bg: "#0F172A", text: "#E2E8F0", card: "#1E293B", cardBorder: "#334155" },
    lavender: { bg: "#FAF5FF", text: "#1A1033", card: "#FFFFFF", cardBorder: "#E9D5FF" },
};

const SOCIAL_ICONS: Record<string, { svg: string; urlPrefix: string }> = {
    instagram: {
        svg: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>`,
        urlPrefix: "https://instagram.com/",
    },
    twitter: {
        svg: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
        urlPrefix: "https://x.com/",
    },
    tiktok: {
        svg: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.52a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.6a8.22 8.22 0 0 0 4.76 1.52V6.69h-1z"/></svg>`,
        urlPrefix: "https://tiktok.com/@",
    },
    youtube: {
        svg: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`,
        urlPrefix: "",
    },
    linkedin: {
        svg: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`,
        urlPrefix: "",
    },
    website: {
        svg: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
        urlPrefix: "",
    },
};

export default function StorefrontClient({ user }: StorefrontClientProps) {
    const theme = THEMES[user.theme] || THEMES.simple;
    const accent = user.accentColor || "#000000";
    const fontFamily = user.font || "Inter";
    const fontUrl = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/ /g, "+")}&display=swap`;
    const buttonStyle = user.buttonStyle || "rounded";
    const layout = user.layout || "grid-2";
    const socialLinks = user.socialLinks || {};
    const backgroundType = user.backgroundType || "theme";
    const backgroundValue = user.backgroundValue || "";

    // Determine if accent color is light for text contrast
    const isLightAccent = (() => {
        const hex = accent.replace("#", "");
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        return (r * 299 + g * 587 + b * 114) / 1000 > 128;
    })();

    // Background styles
    const getBackgroundStyle = (): React.CSSProperties => {
        if (backgroundType === "gradient" && backgroundValue) {
            const parts = backgroundValue.split(",");
            const color1 = parts[0] || "#C8FF00";
            const color2 = parts[1] || "#000000";
            const direction = parts[2] || "to bottom right";
            return { background: `linear-gradient(${direction}, ${color1}, ${color2})` };
        }
        if (backgroundType === "image" && backgroundValue) {
            return {
                backgroundImage: `url(${backgroundValue})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundAttachment: "fixed",
            };
        }
        return { backgroundColor: theme.bg };
    };

    // Social links helper
    const getSocialUrl = (platform: string, value: string): string => {
        if (!value) return "";
        if (value.startsWith("http")) return value;
        const prefix = SOCIAL_ICONS[platform]?.urlPrefix;
        return prefix ? `${prefix}${value}` : value;
    };

    const hasSocialLinks = Object.values(socialLinks).some((v: any) => v && v.trim());

    // Build pixel scripts from user settings
    const pixels = ((user as any).pixels as any) || {};
    const pixelScripts: string[] = [];

    if (pixels.meta) {
        pixelScripts.push(`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${pixels.meta}');fbq('track','PageView');`);
    }
    if (pixels.tiktok) {
        pixelScripts.push(`!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"];ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{};ttq._i[e]=[];ttq._i[e]._u=i;ttq._t=ttq._t||{};ttq._t[e]=+new Date;ttq._o=ttq._o||{};ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript";o.async=!0;o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};ttq.load('${pixels.tiktok}');ttq.page();}(window,document,'ttq');`);
    }
    if (pixels.google) {
        pixelScripts.push(`(function(){var s=document.createElement('script');s.async=true;s.src='https://www.googletagmanager.com/gtag/js?id=${pixels.google}';document.head.appendChild(s);window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${pixels.google}');})();`);
    }
    if (pixels.snapchat) {
        pixelScripts.push(`(function(e,t,n){if(e.snaptr)return;var a=e.snaptr=function(){a.handleRequest?a.handleRequest.apply(a,arguments):a.queue.push(arguments)};a.queue=[];var s='script';r=t.createElement(s);r.async=!0;r.src=n;var u=t.getElementsByTagName(s)[0];u.parentNode.insertBefore(r,u);})(window,document,'https://sc-static.net/scevent.min.js');snaptr('init','${pixels.snapchat}',{});snaptr('track','PAGE_VIEW');`);
    }
    if (pixels.pinterest) {
        pixelScripts.push(`!function(e){if(!window.pintrk){window.pintrk=function(){window.pintrk.queue.push(Array.prototype.slice.call(arguments))};var n=window.pintrk;n.queue=[],n.version="3.0";var t=document.createElement("script");t.async=!0,t.src=e;var r=document.getElementsByTagName("script")[0];r.parentNode.insertBefore(t,r)}}("https://s.pinimg.com/ct/core.js");pintrk('load','${pixels.pinterest}');pintrk('page');`);
    }

    const combinedPixelScript = pixelScripts.join("\n");

    return (
        <>
            {/* eslint-disable-next-line @next/next/no-page-custom-font */}
            <link href={fontUrl} rel="stylesheet" />
            {combinedPixelScript && (
                <script dangerouslySetInnerHTML={{ __html: combinedPixelScript }} />
            )}
            <div
                className="min-h-screen flex flex-col transition-colors duration-500 pt-0"
                style={{
                    ...getBackgroundStyle(),
                    color: theme.text,
                    fontFamily: `'${fontFamily}', sans-serif`,
                }}
            >
                {/* Premium Banner */}
                <div
                    className="h-48 sm:h-64 w-full relative overflow-hidden"
                >
                    <div
                        className="absolute inset-0 opacity-90"
                        style={{
                            background: `linear-gradient(135deg, ${accent}, ${theme.bg}, ${accent})`,
                            backgroundSize: "200% 200%",
                            animation: "gradient-xy 15s ease infinite"
                        }}
                    />
                    <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]" />
                </div>

                <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 -mt-12 sm:-mt-20 z-10 pb-20">
                    {/* Glassmorphism Profile Card */}
                    <div
                        className="mb-12 flex flex-col items-center text-center p-8 sm:p-10 rounded-[2.5rem] border shadow-xl backdrop-blur-xl transition-all duration-300 hover:shadow-2xl"
                        style={{
                            backgroundColor: isLightAccent ? "rgba(255,255,255,0.75)" : "rgba(20,20,20,0.6)",
                            borderColor: isLightAccent ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.1)",
                            color: theme.text,
                            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)"
                        }}
                    >
                        <div
                            className="w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden mb-6 shadow-2xl ring-4 ring-offset-4 ring-offset-transparent transform transition-transform duration-500 hover:scale-105"
                            style={{
                                borderColor: accent,
                                backgroundColor: theme.card
                            }}
                        >
                            {user.avatar || user.image ? (
                                <img
                                    src={user.avatar || user.image!}
                                    alt={user.name || user.handle || "User"}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div
                                    className="w-full h-full flex items-center justify-center text-5xl font-bold"
                                    style={{
                                        background: `linear-gradient(135deg, ${accent}, ${accent}88)`,
                                        color: isLightAccent ? "#000" : "#fff",
                                    }}
                                >
                                    {(user.name || user.handle || "U")[0].toUpperCase()}
                                </div>
                            )}
                        </div>

                        <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2 flex items-center gap-2 drop-shadow-sm">
                            {user.name || `@${user.handle}`}
                            <span className="text-blue-500 text-xl" title="Verified">✓</span>
                        </h1>

                        {user.handle && user.name && (
                            <p className="text-lg opacity-60 font-medium mb-6">@{user.handle}</p>
                        )}

                        {user.bio && (
                            <p className="text-lg leading-relaxed max-w-xl mx-auto whitespace-pre-wrap opacity-90 font-medium">
                                {user.bio}
                            </p>
                        )}

                        {/* Social Links */}
                        {hasSocialLinks && (
                            <div className="mt-8 flex gap-3">
                                {Object.entries(socialLinks).map(([platform, value]) => {
                                    if (!value || !(value as string).trim()) return null;
                                    const icon = SOCIAL_ICONS[platform];
                                    if (!icon) return null;
                                    return (
                                        <a
                                            key={platform}
                                            href={getSocialUrl(platform, value as string)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg"
                                            style={{
                                                backgroundColor: `${accent}15`,
                                                color: theme.text,
                                            }}
                                            title={platform}
                                            dangerouslySetInnerHTML={{ __html: icon.svg }}
                                        />
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Products Grid */}
                    <ProductList
                        products={user.products}
                        username={user.handle || ""}
                        theme={theme}
                        accentColor={accent}
                        isLightAccent={isLightAccent}
                        layout={layout}
                        buttonStyle={buttonStyle}
                    />

                    {/* Footer */}
                    <div className="mt-20 mb-10 opacity-60 hover:opacity-100 transition-opacity">
                        <StoreFooter />
                    </div>
                </main>
            </div>

            <style jsx global>{`
                @keyframes gradient-xy {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
            `}</style>
        </>
    );
}
