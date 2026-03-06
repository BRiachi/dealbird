"use client";

import { useEffect, useState, useCallback } from "react";
import { BrandCard } from "./components/BrandCard";
import { ScanProgress } from "./components/ScanProgress";

type ScanStatus = {
  id: string;
  status: string;
  progress: number;
  progressMsg: string | null;
  videoCount: number;
  brandCount: number;
  error: string | null;
};

type Brand = {
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

export default function BrandIntelPage() {
  const [step, setStep] = useState<"loading" | "empty" | "scanning" | "results">("loading");
  const [platform, setPlatform] = useState("youtube");
  const [handle, setHandle] = useState("");
  const [scan, setScan] = useState<ScanStatus | null>(null);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [total, setTotal] = useState(0);
  const [unlockedCount, setUnlockedCount] = useState(0);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("");

  // Check for existing scans on mount
  useEffect(() => {
    async function init() {
      try {
        const res = await fetch("/api/brand-scan");
        const scans = await res.json();

        if (!Array.isArray(scans) || scans.length === 0) {
          // Try to prefill handle from user's social links
          const profileRes = await fetch("/api/user/profile");
          if (profileRes.ok) {
            const profile = await profileRes.json();
            const socialLinks = profile.socialLinks || {};
            if (socialLinks.youtube) {
              setPlatform("youtube");
              setHandle(socialLinks.youtube);
            } else if (socialLinks.tiktok) {
              setPlatform("tiktok");
              setHandle(socialLinks.tiktok);
            } else if (socialLinks.instagram) {
              setPlatform("instagram");
              setHandle(socialLinks.instagram);
            }
          }
          setStep("empty");
          return;
        }

        const latest = scans[0];
        const inProgress = ["queued", "scraping", "analyzing", "researching", "generating"].includes(latest.status);

        if (inProgress) {
          setScan(latest);
          setStep("scanning");
        } else if (latest.status === "completed") {
          await loadBrands();
          setStep("results");
        } else {
          setStep("empty");
        }
      } catch {
        setStep("empty");
      }
    }
    init();
  }, []);

  // Poll for scan progress
  useEffect(() => {
    if (step !== "scanning" || !scan) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/brand-scan/${scan.id}/status`);
        const data: ScanStatus = await res.json();
        setScan(data);

        if (data.status === "completed") {
          clearInterval(interval);
          await loadBrands();
          setStep("results");
        } else if (data.status === "failed") {
          clearInterval(interval);
          setError(data.error || "Scan failed");
          setStep("empty");
        }
      } catch {
        // Ignore transient errors
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [step, scan?.id]);

  const loadBrands = useCallback(async () => {
    const res = await fetch("/api/brands");
    const data = await res.json();
    setBrands(data.brands || []);
    setTotal(data.total || 0);
    setUnlockedCount(data.unlockedCount || 0);
  }, []);

  const startScan = async () => {
    if (!handle.trim()) {
      setError("Please enter your channel handle or URL");
      return;
    }

    setIsStarting(true);
    setError(null);

    try {
      // Save connection first
      await fetch("/api/social-connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform, handle: handle.trim() }),
      });

      // Start scan
      const res = await fetch("/api/brand-scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform, handle: handle.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to start scan");
        setIsStarting(false);
        return;
      }

      setScan({ id: data.scanId, status: "queued", progress: 0, progressMsg: "Initializing...", videoCount: 0, brandCount: 0, error: null });
      setStep("scanning");
    } catch {
      setError("Failed to start scan. Please try again.");
    } finally {
      setIsStarting(false);
    }
  };

  const filteredBrands = brands.filter((b) => {
    if (!filter) return true;
    return (
      b.name.toLowerCase().includes(filter.toLowerCase()) ||
      b.industry?.toLowerCase().includes(filter.toLowerCase())
    );
  });

  // ── Empty State ──
  if (step === "loading") {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-gray-200 border-t-black rounded-full" />
      </div>
    );
  }

  if (step === "empty") {
    return (
      <div className="max-w-xl mx-auto text-center py-12 space-y-8">
        <div>
          <div className="text-5xl mb-4">🎯</div>
          <h1 className="text-2xl font-bold text-gray-900">Find Your Next Brand Deal</h1>
          <p className="text-gray-500 mt-2 text-sm">
            We&apos;ll scan your videos and use AI to find the top 100 brands you should pitch — with ready-to-send outreach emails.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 p-6 text-left space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">Platform</label>
            <div className="flex gap-2">
              {[
                { value: "youtube", label: "YouTube", icon: "▶️" },
                { value: "tiktok", label: "TikTok", icon: "🎵" },
                { value: "instagram", label: "Instagram", icon: "📸" },
              ].map((p) => (
                <button
                  key={p.value}
                  onClick={() => setPlatform(p.value)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    platform === p.value
                      ? "bg-black text-white"
                      : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <span>{p.icon}</span>
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">
              {platform === "youtube" ? "Channel URL or @handle" : "@username"}
            </label>
            <input
              type="text"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder={
                platform === "youtube"
                  ? "https://youtube.com/@yourchannel or @yourchannel"
                  : "@yourusername"
              }
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8FF00] focus:border-transparent"
            />
          </div>

          <button
            onClick={startScan}
            disabled={isStarting}
            className="w-full py-3.5 bg-[#C8FF00] text-black font-bold rounded-xl hover:bg-[#b3e600] transition-colors disabled:opacity-50 text-sm"
          >
            {isStarting ? "Starting scan..." : "Scan My Channel"}
          </button>

          <p className="text-[11px] text-gray-400 text-center">
            Free: 5 brands revealed · Pro: All 100 brands · Usually takes 5-10 minutes
          </p>
        </div>
      </div>
    );
  }

  // ── Scanning State ──
  if (step === "scanning" && scan) {
    return (
      <div className="py-16">
        <ScanProgress
          status={scan.status}
          progress={scan.progress}
          progressMsg={scan.progressMsg}
        />
      </div>
    );
  }

  // ── Results State ──
  return (
    <div className="space-y-6">
      {/* Summary bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Brand Intel</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {total} brands found
            {unlockedCount < total && ` · ${unlockedCount} unlocked`}
          </p>
        </div>
        <button
          onClick={() => {
            setStep("empty");
            setError(null);
          }}
          className="px-4 py-2 bg-gray-50 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-100 transition-colors"
        >
          New Scan
        </button>
      </div>

      {/* Filter */}
      <input
        type="text"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Filter by brand name or industry..."
        className="w-full max-w-sm px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8FF00] focus:border-transparent"
      />

      {/* Upgrade banner for free tier */}
      {unlockedCount < total && (
        <div className="bg-gradient-to-r from-black to-gray-800 text-white rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="font-bold text-sm">
              {total - unlockedCount} more brands waiting for you
            </p>
            <p className="text-gray-300 text-xs mt-0.5">
              Upgrade to Pro to unlock all {total} brands with outreach emails
            </p>
          </div>
          <a
            href="/dashboard/settings"
            className="px-4 py-2 bg-[#C8FF00] text-black font-bold text-sm rounded-xl hover:bg-[#b3e600] transition-colors shrink-0"
          >
            Upgrade
          </a>
        </div>
      )}

      {/* Brand cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {filteredBrands.map((brand) => (
          <BrandCard key={brand.id} brand={brand} />
        ))}
      </div>

      {filteredBrands.length === 0 && (
        <div className="text-center py-12 text-gray-400 text-sm">
          No brands match your filter.
        </div>
      )}
    </div>
  );
}
