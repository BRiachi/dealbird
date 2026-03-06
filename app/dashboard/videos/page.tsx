"use client";

import { useEffect, useState } from "react";

type Video = {
  id: string;
  platform: string;
  title: string | null;
  url: string;
  thumbnailUrl: string | null;
  viewCount: number;
  likeCount: number;
  publishedAt: string | null;
  _count: { brandMentions: number };
};

const platformIcons: Record<string, string> = {
  youtube: "▶️",
  tiktok: "🎵",
  instagram: "📸",
};

export default function VideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [platformFilter, setPlatformFilter] = useState<string>("all");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/videos");
        if (res.ok) {
          const data = await res.json();
          setVideos(data.videos || []);
        }
      } catch {
        // Ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = videos.filter((v) => {
    if (platformFilter !== "all" && v.platform !== platformFilter) return false;
    if (search) {
      return v.title?.toLowerCase().includes(search.toLowerCase());
    }
    return true;
  });

  const platforms = Array.from(new Set(videos.map((v) => v.platform)));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-gray-200 border-t-black rounded-full" />
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="text-center py-16 space-y-4">
        <div className="text-5xl">🎬</div>
        <h1 className="text-xl font-bold text-gray-900">No videos yet</h1>
        <p className="text-sm text-gray-500 max-w-md mx-auto">
          Run a brand scan from the <a href="/dashboard/brand-intel" className="text-black font-semibold hover:underline">Brand Intel</a> page to index your video library.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">My Videos</h1>
        <p className="text-sm text-gray-500 mt-0.5">{videos.length} videos indexed across your channels</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title..."
          className="flex-1 max-w-sm px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8FF00] focus:border-transparent"
        />
        <div className="flex gap-1.5">
          <button
            onClick={() => setPlatformFilter("all")}
            className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
              platformFilter === "all" ? "bg-black text-white" : "bg-gray-50 text-gray-600 hover:bg-gray-100"
            }`}
          >
            All
          </button>
          {platforms.map((p) => (
            <button
              key={p}
              onClick={() => setPlatformFilter(p)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                platformFilter === p ? "bg-black text-white" : "bg-gray-50 text-gray-600 hover:bg-gray-100"
              }`}
            >
              {platformIcons[p]} {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Video grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((video) => (
          <a
            key={video.id}
            href={video.url}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-gray-200 hover:shadow-sm transition-all group"
          >
            {video.thumbnailUrl ? (
              <div className="relative">
                <img src={video.thumbnailUrl} alt="" className="w-full aspect-video object-cover" />
                <span className="absolute top-2 left-2 text-base">{platformIcons[video.platform]}</span>
              </div>
            ) : (
              <div className="w-full aspect-video bg-gray-50 flex items-center justify-center">
                <span className="text-3xl">{platformIcons[video.platform]}</span>
              </div>
            )}
            <div className="p-4">
              <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-black">
                {video.title || "Untitled"}
              </h3>
              <div className="flex items-center gap-3 mt-2 text-[11px] text-gray-400">
                <span>{video.viewCount.toLocaleString()} views</span>
                {video.publishedAt && (
                  <span>{new Date(video.publishedAt).toLocaleDateString()}</span>
                )}
                {video._count.brandMentions > 0 && (
                  <span className="text-green-600 font-semibold">
                    {video._count.brandMentions} brand{video._count.brandMentions !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
            </div>
          </a>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-400 text-sm">
          No videos match your search.
        </div>
      )}
    </div>
  );
}
