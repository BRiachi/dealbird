"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface OutreachEmail {
  id: string;
  subject: string;
  body: string;
  toEmail: string | null;
  stepNumber: number;
  channel: string;
  status: string;
  sentAt: string | null;
  openedAt: string | null;
  repliedAt: string | null;
  openCount: number;
  scheduledFor: string | null;
  brand: { name: string; industry: string; logoUrl: string | null };
  emailAccount: { email: string; provider: string } | null;
}

interface CampaignDetail {
  id: string;
  name: string;
  instructions: string | null;
  status: string;
  emailSteps: number;
  linkedinSteps: number;
  delayDays: number;
  totalBrands: number;
  sentCount: number;
  openCount: number;
  replyCount: number;
  createdAt: string;
  scan: { platform: string; handle: string; brandCount: number } | null;
  emails: OutreachEmail[];
}

export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [campaign, setCampaign] = useState<CampaignDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [copiedId, setCopiedId] = useState("");

  useEffect(() => {
    fetchCampaign();
  }, []);

  const fetchCampaign = async () => {
    try {
      const res = await fetch(`/api/campaigns/${params.id}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setCampaign(data);
    } catch {
      router.push("/dashboard/campaigns");
    } finally {
      setLoading(false);
    }
  };

  const togglePause = async () => {
    if (!campaign) return;
    setActionLoading("pause");
    const newStatus = campaign.status === "active" ? "paused" : "active";
    await fetch(`/api/campaigns/${campaign.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    fetchCampaign();
    setActionLoading("");
  };

  const deleteCampaign = async () => {
    if (!confirm("Delete this campaign? This cannot be undone.")) return;
    setActionLoading("delete");
    await fetch(`/api/campaigns/${params.id}`, { method: "DELETE" });
    router.push("/dashboard/campaigns");
  };

  const copyMessage = (email: OutreachEmail) => {
    navigator.clipboard.writeText(email.body);
    setCopiedId(email.id);
    setTimeout(() => setCopiedId(""), 2000);
  };

  const markLinkedinSent = async (emailId: string) => {
    setActionLoading(`mark-${emailId}`);
    try {
      await fetch(`/api/outreach-emails/${emailId}/mark-sent`, { method: "POST" });
      fetchCampaign();
    } catch {
      // ignore
    }
    setActionLoading("");
  };

  if (loading) {
    return <div className="h-64 bg-gray-50 rounded-2xl animate-pulse" />;
  }

  if (!campaign) return null;

  // Group emails by brand
  const emailsByBrand: Record<string, OutreachEmail[]> = {};
  for (const email of campaign.emails) {
    const key = email.brand.name;
    if (!emailsByBrand[key]) emailsByBrand[key] = [];
    emailsByBrand[key].push(email);
  }

  const statusColors: Record<string, string> = {
    draft: "bg-gray-100 text-gray-600",
    scheduled: "bg-yellow-50 text-yellow-700",
    sent: "bg-blue-50 text-blue-700",
    opened: "bg-green-50 text-green-700",
    replied: "bg-purple-50 text-purple-700",
    bounced: "bg-red-50 text-red-700",
  };

  const linkedinSteps = campaign.linkedinSteps || 0;

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <Link href="/dashboard/campaigns" className="text-sm text-gray-400 hover:text-black transition-colors mb-1 inline-block">
            ← Campaigns
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight">{campaign.name}</h1>
          <div className="flex items-center gap-3 mt-2">
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize ${
              campaign.status === "active" ? "bg-green-50 text-green-700" :
              campaign.status === "paused" ? "bg-yellow-50 text-yellow-700" :
              campaign.status === "completed" ? "bg-blue-50 text-blue-700" :
              "bg-gray-100 text-gray-600"
            }`}>
              {campaign.status}
            </span>
            <span className="text-sm text-gray-400">
              {campaign.emailSteps}-step email{linkedinSteps > 0 ? ` + ${linkedinSteps} LinkedIn` : ""} &middot; {campaign.delayDays} day delay
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          {(campaign.status === "active" || campaign.status === "paused") && (
            <button
              onClick={togglePause}
              disabled={!!actionLoading}
              className={`px-4 py-2 text-sm font-bold rounded-xl transition-all ${
                campaign.status === "active"
                  ? "border-2 border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                  : "bg-green-500 text-white hover:bg-green-600"
              }`}
            >
              {actionLoading === "pause" ? "..." : campaign.status === "active" ? "Pause" : "Resume"}
            </button>
          )}
          <button
            onClick={deleteCampaign}
            disabled={!!actionLoading}
            className="px-4 py-2 text-sm font-bold text-red-500 border-2 border-red-200 rounded-xl hover:bg-red-50 transition-all"
          >
            {actionLoading === "delete" ? "..." : "Delete"}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: "Brands", value: campaign.totalBrands, color: "text-black" },
          { label: "Sent", value: campaign.sentCount, color: "text-blue-600" },
          { label: "Opened", value: campaign.openCount, color: "text-green-600" },
          { label: "Replied", value: campaign.replyCount, color: "text-purple-600" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-black/[0.07] p-4 text-center">
            <div className={`text-2xl font-extrabold ${stat.color}`}>{stat.value}</div>
            <div className="text-xs text-gray-400 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Rate bars */}
      {campaign.sentCount > 0 && (
        <div className="bg-white rounded-xl border border-black/[0.07] p-4 mb-6 space-y-3">
          {/* Open rate */}
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="font-bold">Open Rate</span>
              <span className="font-bold text-green-600">
                {Math.round((campaign.openCount / campaign.sentCount) * 100)}%
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-400 rounded-full transition-all"
                style={{ width: `${Math.min((campaign.openCount / campaign.sentCount) * 100, 100)}%` }}
              />
            </div>
          </div>
          {/* Reply rate */}
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="font-bold">Reply Rate</span>
              <span className="font-bold text-purple-600">
                {Math.round((campaign.replyCount / campaign.sentCount) * 100)}%
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-400 rounded-full transition-all"
                style={{ width: `${Math.min((campaign.replyCount / campaign.sentCount) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Messages by brand */}
      <h2 className="text-lg font-bold mb-3">Messages ({campaign.emails.length})</h2>
      <div className="space-y-3">
        {Object.entries(emailsByBrand).map(([brandName, emails]) => {
          const hasReply = emails.some((e) => e.status === "replied");
          return (
            <div key={brandName} className={`bg-white rounded-xl border overflow-hidden ${
              hasReply ? "border-purple-200" : "border-black/[0.07]"
            }`}>
              <div className={`px-4 py-3 border-b ${
                hasReply ? "bg-purple-50 border-purple-100" : "bg-gray-50 border-black/[0.05]"
              }`}>
                <div className="flex items-center gap-2">
                  <div className="font-bold text-sm">{brandName}</div>
                  {hasReply && (
                    <span className="text-[10px] font-bold text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">
                      Replied
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-400">
                  {emails[0].brand.industry} &middot; {emails.length} steps
                </div>
              </div>
              <div className="divide-y divide-gray-50">
                {emails.map((email) => (
                  <div key={email.id} className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {/* Step indicator */}
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                        email.channel === "linkedin"
                          ? "bg-blue-600 text-white"
                          : "bg-black text-white"
                      }`}>
                        {email.channel === "linkedin" ? "in" : email.stepNumber}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{email.subject}</div>
                        <div className="text-xs text-gray-400 truncate">
                          {email.channel === "linkedin" ? "LinkedIn" : email.toEmail ? `To: ${email.toEmail}` : "No recipient"}{" "}
                          {email.emailAccount && ` via ${email.emailAccount.email}`}
                          {email.scheduledFor && ` · ${new Date(email.scheduledFor).toLocaleDateString()}`}
                          {email.repliedAt && ` · Replied ${new Date(email.repliedAt).toLocaleDateString()}`}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {email.openCount > 0 && (
                          <span className="text-[10px] font-bold text-green-600">
                            {email.openCount} opens
                          </span>
                        )}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${statusColors[email.status] || statusColors.draft}`}>
                          {email.status}
                        </span>
                      </div>
                    </div>

                    {/* LinkedIn actions */}
                    {email.channel === "linkedin" && email.status === "draft" && (
                      <div className="flex items-center gap-2 mt-2 ml-9">
                        <button
                          onClick={() => copyMessage(email)}
                          className="text-xs font-bold px-3 py-1.5 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          {copiedId === email.id ? "Copied!" : "Copy Message"}
                        </button>
                        <a
                          href={`https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent(brandName)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-bold px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                        >
                          Open LinkedIn
                        </a>
                        <button
                          onClick={() => markLinkedinSent(email.id)}
                          disabled={actionLoading === `mark-${email.id}`}
                          className="text-xs font-bold px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50"
                        >
                          {actionLoading === `mark-${email.id}` ? "..." : "Mark Sent"}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {campaign.emails.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          No messages generated yet.
        </div>
      )}
    </div>
  );
}
