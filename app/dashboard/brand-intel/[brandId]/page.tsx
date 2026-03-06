"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

type BrandDetail = {
  id: string;
  name: string;
  logoUrl: string | null;
  website: string | null;
  industry: string | null;
  rank: number;
  confidence: number | null;
  matchReason: string | null;
  estimatedSpend: string | null;
  avgDealSize: string | null;
  platforms: string[];
  recentCampaigns: { title: string; url: string; publishedDate?: string; snippet: string }[] | null;
  recentNews: { title: string; url: string; publishedDate?: string; snippet: string }[] | null;
  outreachEmail: { subject: string; body: string; videoLinks: { url: string; title: string; relevance: string }[] } | null;
  carouselSlides: { imageUrl: string; headline: string; body: string }[] | null;
  status: string;
  videos: {
    id: string;
    title: string | null;
    url: string;
    thumbnailUrl: string | null;
    viewCount: number;
    publishedAt: string | null;
    platform: string;
    mentionContext: string | null;
  }[];
  scan: { platform: string; handle: string; videoCount: number } | null;
};

export default function BrandDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [brand, setBrand] = useState<BrandDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [locked, setLocked] = useState(false);
  const [emailEditing, setEmailEditing] = useState(false);
  const [editSubject, setEditSubject] = useState("");
  const [editBody, setEditBody] = useState("");
  const [sending, setSending] = useState(false);
  const [sendEmail, setSendEmail] = useState("");
  const [carouselLoading, setCarouselLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/brands/${params.brandId}`);
      if (res.status === 403) {
        setLocked(true);
        setLoading(false);
        return;
      }
      if (!res.ok) {
        router.push("/dashboard/brand-intel");
        return;
      }
      const data = await res.json();
      setBrand(data);
      if (data.outreachEmail) {
        setEditSubject(data.outreachEmail.subject);
        setEditBody(data.outreachEmail.body);
      }
      setLoading(false);
    }
    load();
  }, [params.brandId]);

  const handleCopyEmail = async () => {
    if (!brand?.outreachEmail) return;
    await navigator.clipboard.writeText(
      `Subject: ${editSubject || brand.outreachEmail.subject}\n\n${editBody || brand.outreachEmail.body}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveEmail = async () => {
    await fetch(`/api/brands/${brand?.id}/email`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject: editSubject, body: editBody }),
    });
    setEmailEditing(false);
  };

  const handleSendEmail = async () => {
    if (!sendEmail || !brand) return;
    setSending(true);
    const res = await fetch(`/api/brands/${brand.id}/email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipientEmail: sendEmail }),
    });
    if (res.ok) {
      setBrand({ ...brand, status: "email_sent" });
    }
    setSending(false);
    setSendEmail("");
  };

  const handleGenerateCarousel = async () => {
    if (!brand) return;
    setCarouselLoading(true);
    const res = await fetch(`/api/brands/${brand.id}/carousel`, { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      setBrand({ ...brand, carouselSlides: data.slides });
    }
    setCarouselLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-gray-200 border-t-black rounded-full" />
      </div>
    );
  }

  if (locked) {
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-4">
        <div className="text-5xl">🔒</div>
        <h2 className="text-xl font-bold">Upgrade to Pro</h2>
        <p className="text-sm text-gray-500">This brand is available on Pro and Agency plans.</p>
        <a href="/dashboard/settings" className="inline-block px-6 py-3 bg-[#C8FF00] text-black font-bold rounded-xl hover:bg-[#b3e600] transition-colors text-sm">
          Upgrade Now
        </a>
      </div>
    );
  }

  if (!brand) return null;

  const confidenceLevel =
    (brand.confidence || 0) >= 0.8 ? "High" : (brand.confidence || 0) >= 0.5 ? "Medium" : "Low";

  return (
    <div className="space-y-8">
      {/* Back link */}
      <Link href="/dashboard/brand-intel" className="text-sm text-gray-500 hover:text-black transition-colors">
        ← Back to Brand Intel
      </Link>

      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-2xl shrink-0">
          {brand.logoUrl ? <img src={brand.logoUrl} alt="" className="w-8 h-8 rounded" /> : "🏢"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-gray-900">{brand.name}</h1>
            <span className="text-xs font-bold text-gray-400">#{brand.rank}</span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              confidenceLevel === "High" ? "bg-green-100 text-green-700" :
              confidenceLevel === "Medium" ? "bg-yellow-100 text-yellow-700" :
              "bg-gray-100 text-gray-600"
            }`}>
              {confidenceLevel} match
            </span>
            {brand.status === "email_sent" && (
              <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Email Sent ✓</span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
            {brand.industry && <span>{brand.industry}</span>}
            {brand.website && (
              <>
                <span>·</span>
                <a href={brand.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate max-w-[200px]">
                  {brand.website.replace(/^https?:\/\/(www\.)?/, "")}
                </a>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Match Reason */}
      {brand.matchReason && (
        <div className="bg-[#C8FF00]/10 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-gray-900 mb-1">Why This Brand</h3>
          <p className="text-sm text-gray-700">{brand.matchReason}</p>
        </div>
      )}

      {/* Intelligence Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {brand.estimatedSpend && (
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-[10px] font-bold text-gray-400 uppercase">Est. Monthly Spend</p>
            <p className="text-sm font-bold text-gray-900 mt-1">{brand.estimatedSpend}</p>
          </div>
        )}
        {brand.avgDealSize && (
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-[10px] font-bold text-gray-400 uppercase">Avg Deal Size</p>
            <p className="text-sm font-bold text-gray-900 mt-1">{brand.avgDealSize}</p>
          </div>
        )}
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase">Platforms</p>
          <p className="text-sm font-bold text-gray-900 mt-1">
            {brand.platforms.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(", ") || "All"}
          </p>
        </div>
      </div>

      {/* Your Relevant Videos */}
      {brand.videos.length > 0 && (
        <section>
          <h3 className="text-sm font-bold text-gray-900 mb-3">Your Videos ({brand.videos.length})</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {brand.videos.map((video) => (
              <a
                key={video.id}
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 p-3 hover:border-gray-200 transition-colors"
              >
                {video.thumbnailUrl ? (
                  <img src={video.thumbnailUrl} alt="" className="w-16 h-10 rounded-lg object-cover shrink-0" />
                ) : (
                  <div className="w-16 h-10 bg-gray-100 rounded-lg shrink-0 flex items-center justify-center text-xs">▶️</div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-gray-900 truncate">{video.title || "Untitled"}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {video.viewCount.toLocaleString()} views
                    {video.mentionContext && ` · ${video.mentionContext}`}
                  </p>
                </div>
                <span className="text-green-600 text-[10px] font-bold shrink-0">✓ Verified</span>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Recent Campaigns */}
      {brand.recentCampaigns && (brand.recentCampaigns as any[]).length > 0 && (
        <section>
          <h3 className="text-sm font-bold text-gray-900 mb-3">Recent Campaigns</h3>
          <div className="space-y-2">
            {(brand.recentCampaigns as any[]).map((c, i) => (
              <a
                key={i}
                href={c.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-white rounded-xl border border-gray-100 p-4 hover:border-gray-200 transition-colors"
              >
                <p className="text-sm font-semibold text-gray-900">{c.title}</p>
                {c.snippet && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{c.snippet}</p>}
                <p className="text-[10px] text-gray-400 mt-1.5">
                  {c.publishedDate && new Date(c.publishedDate).toLocaleDateString()} · {new URL(c.url).hostname}
                </p>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Latest News */}
      {brand.recentNews && (brand.recentNews as any[]).length > 0 && (
        <section>
          <h3 className="text-sm font-bold text-gray-900 mb-3">Latest News</h3>
          <div className="space-y-2">
            {(brand.recentNews as any[]).map((n, i) => (
              <a
                key={i}
                href={n.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-white rounded-xl border border-gray-100 p-4 hover:border-gray-200 transition-colors"
              >
                <p className="text-sm font-semibold text-gray-900">{n.title}</p>
                {n.snippet && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{n.snippet}</p>}
                <p className="text-[10px] text-gray-400 mt-1.5">
                  {n.publishedDate && new Date(n.publishedDate).toLocaleDateString()} · {new URL(n.url).hostname}
                </p>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Outreach Email */}
      {brand.outreachEmail && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-gray-900">Outreach Email</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setEmailEditing(!emailEditing)}
                className="text-xs text-gray-500 hover:text-black transition-colors font-medium"
              >
                {emailEditing ? "Cancel" : "Edit"}
              </button>
              {emailEditing && (
                <button
                  onClick={handleSaveEmail}
                  className="text-xs text-green-600 hover:text-green-700 font-semibold"
                >
                  Save
                </button>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-50">
              {emailEditing ? (
                <input
                  type="text"
                  value={editSubject}
                  onChange={(e) => setEditSubject(e.target.value)}
                  className="w-full text-sm font-semibold focus:outline-none"
                />
              ) : (
                <p className="text-sm">
                  <span className="font-semibold text-gray-400">Subject: </span>
                  <span className="font-semibold text-gray-900">{editSubject || brand.outreachEmail.subject}</span>
                </p>
              )}
            </div>
            <div className="px-5 py-4">
              {emailEditing ? (
                <textarea
                  value={editBody}
                  onChange={(e) => setEditBody(e.target.value)}
                  rows={10}
                  className="w-full text-sm text-gray-700 leading-relaxed focus:outline-none resize-none"
                />
              ) : (
                <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {editBody || brand.outreachEmail.body}
                </div>
              )}
            </div>

            {/* Video links in email */}
            {brand.outreachEmail.videoLinks.length > 0 && (
              <div className="px-5 py-3 border-t border-gray-50 bg-green-50/50">
                <p className="text-[10px] font-bold text-green-700 uppercase mb-1.5">Verified Video Links in Email</p>
                {brand.outreachEmail.videoLinks.map((link, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-green-700">
                    <span className="text-green-600">✓</span>
                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="hover:underline truncate">
                      {link.title}
                    </a>
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="px-5 py-3 border-t border-gray-100 flex flex-wrap gap-2">
              <button
                onClick={handleCopyEmail}
                className="px-4 py-2 bg-gray-50 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-100 transition-colors"
              >
                {copied ? "Copied! ✓" : "Copy to Clipboard"}
              </button>

              <div className="flex items-center gap-2">
                <input
                  type="email"
                  value={sendEmail}
                  onChange={(e) => setSendEmail(e.target.value)}
                  placeholder="brand@email.com"
                  className="px-3 py-2 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-[#C8FF00] w-48"
                />
                <button
                  onClick={handleSendEmail}
                  disabled={sending || !sendEmail}
                  className="px-4 py-2 bg-[#C8FF00] text-black text-xs font-bold rounded-lg hover:bg-[#b3e600] transition-colors disabled:opacity-50"
                >
                  {sending ? "Sending..." : "Send via Dealbird"}
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Carousel */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-900">Carousel Posts</h3>
          {!brand.carouselSlides && (
            <button
              onClick={handleGenerateCarousel}
              disabled={carouselLoading}
              className="px-4 py-2 bg-black text-white text-xs font-semibold rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {carouselLoading ? "Generating..." : "Generate Carousel"}
            </button>
          )}
        </div>

        {carouselLoading && (
          <div className="bg-gray-50 rounded-2xl p-8 text-center">
            <div className="animate-spin w-6 h-6 border-2 border-gray-200 border-t-black rounded-full mx-auto mb-3" />
            <p className="text-sm text-gray-500">Generating carousel slides with AI...</p>
          </div>
        )}

        {brand.carouselSlides && (brand.carouselSlides as any[]).length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {(brand.carouselSlides as any[]).map((slide, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                {slide.imageUrl ? (
                  <img src={slide.imageUrl} alt={slide.headline} className="w-full aspect-square object-cover" />
                ) : (
                  <div className="w-full aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <span className="text-gray-400 text-xs">No image</span>
                  </div>
                )}
                <div className="p-3">
                  <p className="text-xs font-bold text-gray-900">{slide.headline}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-2">{slide.body}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {!brand.carouselSlides && !carouselLoading && (
          <p className="text-sm text-gray-400">Click &quot;Generate Carousel&quot; to create AI-powered carousel posts for this brand.</p>
        )}
      </section>
    </div>
  );
}
