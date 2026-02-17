import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import ProductList from "./components/ProductList";
import { StoreFooter } from "./components/StoreFooter";

interface Props {
    params: { handle: string };
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

// Generate metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const user = await prisma.user.findFirst({
        where: { handle: { equals: params.handle, mode: "insensitive" } },
    });

    if (!user) return { title: "User Not Found" };

    return {
        title: `${user.name || user.handle} | DealBird`,
        description: user.bio || `Check out ${user.handle}'s store on DealBird.`,
        openGraph: {
            images: user.avatar || user.image || [],
        },
    };
}

export default async function PublicStorePage({ params }: Props) {
    // Fetch user and products
    const user = await prisma.user.findFirst({
        where: { handle: { equals: params.handle, mode: "insensitive" } },
        include: {
            products: {
                where: { archived: false },
                orderBy: { order: "asc" },
            },
        },
    });

    if (!user) notFound();

    const theme = THEMES[user.theme] || THEMES.simple;
    const accent = user.accentColor || "#000000";
    const fontFamily = user.font || "Inter";
    const fontUrl = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/ /g, "+")}&display=swap`;

    // Determine if accent color is light for text contrast
    const isLightAccent = (() => {
        const hex = accent.replace("#", "");
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        return (r * 299 + g * 587 + b * 114) / 1000 > 128;
    })();

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
                className="min-h-screen flex flex-col"
                style={{
                    backgroundColor: theme.bg,
                    color: theme.text,
                    fontFamily: `'${fontFamily}', sans-serif`,
                }}
            >
                <main className="flex-1 w-full max-w-md mx-auto px-6 py-12">
                    {/* Profile Header */}
                    <div className="flex flex-col items-center text-center mb-10">
                        <div
                            className="w-24 h-24 rounded-full overflow-hidden mb-4 shadow-sm"
                            style={{ borderWidth: "3px", borderStyle: "solid", borderColor: theme.cardBorder }}
                        >
                            {user.avatar || user.image ? (
                                <img
                                    src={user.avatar || user.image!}
                                    alt={user.name || user.handle || "User"}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div
                                    className="w-full h-full flex items-center justify-center text-3xl font-bold"
                                    style={{
                                        background: `linear-gradient(135deg, ${accent}, ${accent}88)`,
                                        color: isLightAccent ? "#000" : "#fff",
                                    }}
                                >
                                    {(user.name || user.handle || "U")[0].toUpperCase()}
                                </div>
                            )}
                        </div>

                        <h1 className="text-xl font-bold tracking-tight mb-2">
                            @{user.handle}
                        </h1>

                        {user.bio && (
                            <p className="text-sm leading-relaxed max-w-xs mx-auto whitespace-pre-wrap" style={{ opacity: 0.7 }}>
                                {user.bio}
                            </p>
                        )}
                    </div>

                    {/* Products List */}
                    <ProductList
                        products={user.products}
                        username={user.handle || ""}
                        theme={theme}
                        accentColor={accent}
                        isLightAccent={isLightAccent}
                    />

                    {/* Footer */}
                    <StoreFooter />
                </main>
            </div>
        </>
    );
}
