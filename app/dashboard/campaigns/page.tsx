"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Campaign {
  id: string;
  name: string;
  status: string;
  totalBrands: number;
  sentCount: number;
  openCount: number;
  replyCount: number;
  emailSteps: number;
  createdAt: string;
  scan?: { platform: string; handle: string };
  _count: { emails: number };
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/campaigns")
      .then((r) => r.json())
      .then(setCampaigns)
      .finally(() => setLoading(false));
  }, []);

  const statusColor: Record<string, string> = {
    draft: "bg-gray-100 text-gray-600",
    active: "bg-green-50 text-green-700",
    paused: "bg-yellow-50 text-yellow-700",
    completed: "bg-blue-50 text-blue-700",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-1">Campaigns</h1>
          <p className="text-gray-500">Automated outreach sequences to brands.</p>
        </div>
        <Link
          href="/dashboard/campaigns/new"
          className="px-5 py-2.5 bg-[#C8FF00] text-black font-bold text-sm rounded-xl hover:bg-[#b3e600] transition-colors"
        >
          + New Campaign
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-50 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">📬</div>
          <h2 className="text-xl font-bold mb-2">No campaigns yet</h2>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Create your first outreach campaign to start pitching brands automatically.
            Run a Brand Intel scan first to find your best matches.
          </p>
          <Link
            href="/dashboard/campaigns/new"
            className="inline-flex px-6 py-3 bg-[#C8FF00] text-black font-bold rounded-xl hover:bg-[#b3e600] transition-colors"
          >
            Create Campaign
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {campaigns.map((campaign) => (
            <Link
              key={campaign.id}
              href={`/dashboard/campaigns/${campaign.id}`}
              className="block bg-white rounded-2xl border border-black/[0.07] p-5 hover:border-black/20 transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <h3 className="font-bold text-lg">{campaign.name}</h3>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize ${statusColor[campaign.status] || statusColor.draft}`}>
                    {campaign.status}
                  </span>
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(campaign.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className="flex items-center gap-6 text-sm">
                <div>
                  <span className="text-gray-400">Brands</span>{" "}
                  <span className="font-bold">{campaign.totalBrands}</span>
                </div>
                <div>
                  <span className="text-gray-400">Sent</span>{" "}
                  <span className="font-bold">{campaign.sentCount}</span>
                </div>
                <div>
                  <span className="text-gray-400">Opened</span>{" "}
                  <span className="font-bold text-green-600">{campaign.openCount}</span>
                </div>
                <div>
                  <span className="text-gray-400">Replied</span>{" "}
                  <span className="font-bold text-blue-600">{campaign.replyCount}</span>
                </div>
                {campaign.totalBrands > 0 && (
                  <div>
                    <span className="text-gray-400">Open rate</span>{" "}
                    <span className="font-bold">
                      {campaign.sentCount > 0
                        ? Math.round((campaign.openCount / campaign.sentCount) * 100)
                        : 0}%
                    </span>
                  </div>
                )}
                <div className="ml-auto text-xs text-gray-400">
                  {campaign.emailSteps}-step sequence &middot; {campaign._count.emails} emails
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
