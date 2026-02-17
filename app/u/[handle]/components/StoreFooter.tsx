"use client";

export function StoreFooter() {
    return (
        <div className="mt-16 text-center">
            <a
                href="/"
                className="inline-flex items-center gap-2 opacity-40 hover:opacity-100 transition-opacity"
            >
                <span className="text-xs font-bold uppercase tracking-widest">Powered by</span>
                <span className="font-extrabold text-sm flex items-center gap-1">
                    <img src="/logo.png" className="w-4 h-4 rounded-sm" alt="DealBird" /> DealBird
                </span>
            </a>
        </div>
    );
}
