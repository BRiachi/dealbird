"use client";

import Link from "next/link";

interface BrandCardProps {
  brand: {
    id: string;
    name: string;
    logoUrl: string | null;
    industry: string | null;
    rank: number;
    confidence: number | null;
    estimatedSpend: string | null;
    avgDealSize: string | null;
    platforms: string[];
    matchReason: string | null;
    videoMentionCount: number;
    status: string;
    locked: boolean;
  };
}

const platformIcons: Record<string, string> = {
  youtube: "▶️",
  tiktok: "🎵",
  instagram: "📸",
};

export function BrandCard({ brand }: BrandCardProps) {
  const confidenceLevel =
    (brand.confidence || 0) >= 0.8
      ? "High"
      : (brand.confidence || 0) >= 0.5
      ? "Med"
      : "Low";

  const confidenceColor =
    confidenceLevel === "High"
      ? "bg-green-100 text-green-700"
      : confidenceLevel === "Med"
      ? "bg-yellow-100 text-yellow-700"
      : "bg-gray-100 text-gray-600";

  if (brand.locked) {
    return (
      <div className="relative bg-white rounded-2xl border border-gray-100 p-5 opacity-60 overflow-hidden">
        {/* Blur overlay */}
        <div className="absolute inset-0 backdrop-blur-[6px] bg-white/40 z-10 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl mb-2">🔒</div>
            <p className="text-xs font-semibold text-gray-600">Upgrade to Pro</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-lg">
            🏢
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-900 text-sm">#{brand.rank}</span>
              <h3 className="font-semibold text-gray-900 text-sm truncate">{brand.name}</h3>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">{brand.industry}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Link
      href={`/dashboard/brand-intel/${brand.id}`}
      className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-gray-200 hover:shadow-sm transition-all group"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-lg shrink-0 group-hover:bg-[#C8FF00]/10 transition-colors">
          {brand.logoUrl ? (
            <img src={brand.logoUrl} alt="" className="w-6 h-6 rounded" />
          ) : (
            "🏢"
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-400">#{brand.rank}</span>
            <h3 className="font-semibold text-gray-900 text-sm truncate">{brand.name}</h3>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${confidenceColor}`}>
              {confidenceLevel}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">{brand.industry}</p>
        </div>
      </div>

      {/* Deal info */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {brand.avgDealSize && (
          <span className="text-[10px] font-semibold bg-green-50 text-green-700 px-2 py-0.5 rounded-full">
            {brand.avgDealSize}
          </span>
        )}
        {brand.platforms.map((p) => (
          <span key={p} className="text-[10px] bg-gray-50 px-1.5 py-0.5 rounded-full">
            {platformIcons[p] || p}
          </span>
        ))}
      </div>

      {/* Bottom row */}
      <div className="mt-3 flex items-center justify-between text-xs">
        <span className="text-gray-400">
          {brand.videoMentionCount > 0
            ? `${brand.videoMentionCount} video${brand.videoMentionCount !== 1 ? "s" : ""} mention`
            : "Category match"}
        </span>
        {brand.status === "email_sent" ? (
          <span className="text-green-600 font-semibold">Email Sent ✓</span>
        ) : (
          <span className="text-gray-400 group-hover:text-black transition-colors font-medium">
            View Details →
          </span>
        )}
      </div>
    </Link>
  );
}
