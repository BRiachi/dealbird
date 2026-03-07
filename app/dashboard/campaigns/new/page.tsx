"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface BrandScan {
  id: string;
  platform: string;
  handle: string;
  brandCount: number;
  status: string;
  createdAt: string;
}

interface Brand {
  id: string;
  name: string;
  industry: string;
  rank: number;
  confidence: number;
  matchReason: string;
  outreachEmail: any;
  status: string;
}

interface EmailAccount {
  id: string;
  provider: string;
  email: string;
  isDefault: boolean;
  dailySendLimit: number;
  sentToday: number;
}

const STEPS = [
  { num: 1, label: "Campaign" },
  { num: 2, label: "Targeting" },
  { num: 3, label: "Sequence" },
  { num: 4, label: "Launch" },
];

export default function NewCampaignPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1 state
  const [name, setName] = useState("");
  const [instructions, setInstructions] = useState("");

  // Step 2 state
  const [scans, setScans] = useState<BrandScan[]>([]);
  const [selectedScanId, setSelectedScanId] = useState("");
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrandIds, setSelectedBrandIds] = useState<Set<string>>(new Set());

  // Step 3 state
  const [emailSteps, setEmailSteps] = useState(3);
  const [linkedinSteps, setLinkedinSteps] = useState(0);
  const [delayDays, setDelayDays] = useState(3);

  // Step 4 state
  const [emailAccounts, setEmailAccounts] = useState<EmailAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [campaignId, setCampaignId] = useState("");

  // Fetch scans on mount
  useEffect(() => {
    fetch("/api/brand-scan/list")
      .then((r) => r.json())
      .then((data) => {
        const completed = (data || []).filter((s: BrandScan) => s.status === "completed");
        setScans(completed);
        if (completed.length > 0) setSelectedScanId(completed[0].id);
      })
      .catch(() => {});

    fetch("/api/email-accounts")
      .then((r) => r.json())
      .then((data) => {
        setEmailAccounts(data || []);
        const def = data?.find((a: EmailAccount) => a.isDefault);
        if (def) setSelectedAccountId(def.id);
      })
      .catch(() => {});
  }, []);

  // Fetch brands when scan selected
  useEffect(() => {
    if (!selectedScanId) return;
    fetch(`/api/brands?scanId=${selectedScanId}`)
      .then((r) => r.json())
      .then((data) => {
        const brandList = data?.brands || data || [];
        setBrands(brandList);
        // Auto-select top 20 by default
        const top = brandList.slice(0, 20).map((b: Brand) => b.id);
        setSelectedBrandIds(new Set(top));
      })
      .catch(() => {});
  }, [selectedScanId]);

  const toggleBrand = (id: string) => {
    setSelectedBrandIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedBrandIds.size === brands.length) {
      setSelectedBrandIds(new Set());
    } else {
      setSelectedBrandIds(new Set(brands.map((b) => b.id)));
    }
  };

  const createAndGenerateSequence = async () => {
    setLoading(true);
    try {
      // Step 1: Create campaign
      const createRes = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          instructions,
          scanId: selectedScanId || null,
          emailSteps,
          linkedinSteps,
          delayDays,
        }),
      });
      const campaign = await createRes.json();
      if (!createRes.ok) throw new Error(campaign.error);
      setCampaignId(campaign.id);

      // Step 2: Generate sequence emails
      const genRes = await fetch(`/api/campaigns/${campaign.id}/generate-sequence`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandIds: Array.from(selectedBrandIds),
          emailAccountId: selectedAccountId || null,
        }),
      });
      const genData = await genRes.json();
      if (!genRes.ok) throw new Error(genData.error);

      setStep(4);
    } catch (err: any) {
      alert(err.message || "Failed to create campaign");
    } finally {
      setLoading(false);
    }
  };

  const launchCampaign = async () => {
    if (!campaignId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/campaigns/${campaignId}/launch`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push(`/dashboard/campaigns/${campaignId}`);
    } catch (err: any) {
      alert(err.message || "Failed to launch campaign");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Step indicator */}
      <div className="flex items-center justify-center gap-0 mb-8">
        {STEPS.map((s, i) => (
          <div key={s.num} className="flex items-center">
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${
                step === s.num
                  ? "bg-[#C8FF00] text-black"
                  : step > s.num
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-black/10 flex items-center justify-center text-xs">
                {step > s.num ? "✓" : s.num}
              </span>
              {s.label}
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-8 h-0.5 ${step > s.num ? "bg-green-300" : "bg-gray-200"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Campaign Info */}
      {step === 1 && (
        <div className="bg-white rounded-2xl border border-black/[0.07] p-6">
          <h2 className="text-xl font-bold mb-1">Campaign Setup</h2>
          <p className="text-sm text-gray-400 mb-6">Name your campaign and describe your outreach goals.</p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-1.5">Campaign Name *</label>
              <input
                type="text"
                placeholder="e.g., SEO Tools Outreach Q1"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-black/[0.08] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-1.5">Instructions</label>
              <p className="text-xs text-gray-400 mb-1.5">What angle should the emails take? What makes you a good fit?</p>
              <textarea
                placeholder="e.g., Focus on my SEO expertise and 50K+ monthly views. Position me as a thought leader in the affiliate marketing space."
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-black/[0.08] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/20 resize-none"
              />
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!name.trim()}
              className="w-full py-3 bg-black text-white font-bold text-sm rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-40"
            >
              Next: Select Brands →
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Targeting */}
      {step === 2 && (
        <div className="bg-white rounded-2xl border border-black/[0.07] p-6">
          <h2 className="text-xl font-bold mb-1">Select Brands</h2>
          <p className="text-sm text-gray-400 mb-6">Choose which brands to include in this campaign.</p>

          {/* Scan selector */}
          {scans.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-bold mb-1.5">From Scan</label>
              <select
                value={selectedScanId}
                onChange={(e) => setSelectedScanId(e.target.value)}
                className="w-full px-4 py-2.5 border border-black/[0.08] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
              >
                {scans.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.platform} @{s.handle} — {s.brandCount} brands ({new Date(s.createdAt).toLocaleDateString()})
                  </option>
                ))}
              </select>
            </div>
          )}

          {scans.length === 0 && (
            <div className="text-center py-8 bg-gray-50 rounded-xl mb-4">
              <p className="text-gray-500 mb-3">No completed scans found.</p>
              <a
                href="/dashboard/brand-intel"
                className="text-sm font-bold text-blue-600 hover:underline"
              >
                Run a Brand Intel scan first →
              </a>
            </div>
          )}

          {/* Brand list */}
          {brands.length > 0 && (
            <>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-500">
                  {selectedBrandIds.size} of {brands.length} selected
                </span>
                <button onClick={selectAll} className="text-sm font-bold text-blue-600 hover:underline">
                  {selectedBrandIds.size === brands.length ? "Deselect All" : "Select All"}
                </button>
              </div>

              <div className="max-h-[400px] overflow-y-auto space-y-1.5 mb-4">
                {brands.map((brand) => (
                  <label
                    key={brand.id}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                      selectedBrandIds.has(brand.id)
                        ? "bg-[#C8FF00]/10 border border-[#C8FF00]/30"
                        : "bg-gray-50 border border-transparent hover:bg-gray-100"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedBrandIds.has(brand.id)}
                      onChange={() => toggleBrand(brand.id)}
                      className="w-4 h-4 rounded accent-black"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm">{brand.name}</div>
                      <div className="text-xs text-gray-400 truncate">
                        #{brand.rank} &middot; {brand.industry} &middot;{" "}
                        {Math.round((brand.confidence || 0) * 100)}% match
                      </div>
                    </div>
                    {brand.outreachEmail && (
                      <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                        Email ready
                      </span>
                    )}
                  </label>
                ))}
              </div>
            </>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => setStep(1)}
              className="px-6 py-3 border-2 border-gray-200 font-bold text-sm rounded-xl hover:border-black transition-all"
            >
              ← Back
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={selectedBrandIds.size === 0}
              className="flex-1 py-3 bg-black text-white font-bold text-sm rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-40"
            >
              Next: Configure Sequence →
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Sequence Config */}
      {step === 3 && (
        <div className="bg-white rounded-2xl border border-black/[0.07] p-6">
          <h2 className="text-xl font-bold mb-1">Outreach Sequence</h2>
          <p className="text-sm text-gray-400 mb-6">Configure your email and LinkedIn follow-up sequence.</p>

          <div className="space-y-6">
            {/* Email steps */}
            <div>
              <label className="block text-sm font-bold mb-2">Email Steps</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setEmailSteps(Math.max(1, emailSteps - 1))}
                  className="w-10 h-10 border-2 border-gray-200 rounded-xl flex items-center justify-center font-bold hover:border-black transition-all"
                >
                  -
                </button>
                <span className="text-2xl font-bold w-8 text-center">{emailSteps}</span>
                <button
                  onClick={() => setEmailSteps(Math.min(6, emailSteps + 1))}
                  className="w-10 h-10 border-2 border-gray-200 rounded-xl flex items-center justify-center font-bold hover:border-black transition-all"
                >
                  +
                </button>
              </div>
            </div>

            {/* LinkedIn steps */}
            <div>
              <label className="block text-sm font-bold mb-1">LinkedIn Steps</label>
              <p className="text-xs text-gray-400 mb-2">Manual send via browser — copy message and open LinkedIn</p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setLinkedinSteps(Math.max(0, linkedinSteps - 1))}
                  className="w-10 h-10 border-2 border-gray-200 rounded-xl flex items-center justify-center font-bold hover:border-black transition-all"
                >
                  -
                </button>
                <span className="text-2xl font-bold w-8 text-center">{linkedinSteps}</span>
                <button
                  onClick={() => setLinkedinSteps(Math.min(3, linkedinSteps + 1))}
                  className="w-10 h-10 border-2 border-gray-200 rounded-xl flex items-center justify-center font-bold hover:border-black transition-all"
                >
                  +
                </button>
              </div>
            </div>

            {/* Delay between steps */}
            <div>
              <label className="block text-sm font-bold mb-2">Days Between Steps</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setDelayDays(Math.max(1, delayDays - 1))}
                  className="w-10 h-10 border-2 border-gray-200 rounded-xl flex items-center justify-center font-bold hover:border-black transition-all"
                >
                  -
                </button>
                <span className="text-2xl font-bold w-8 text-center">{delayDays}</span>
                <button
                  onClick={() => setDelayDays(Math.min(14, delayDays + 1))}
                  className="w-10 h-10 border-2 border-gray-200 rounded-xl flex items-center justify-center font-bold hover:border-black transition-all"
                >
                  +
                </button>
              </div>
            </div>

            {/* Sequence preview */}
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="text-sm font-bold mb-3">Sequence Preview</div>
              <div className="space-y-2">
                {Array.from({ length: emailSteps }, (_, i) => (
                  <div key={`email-${i}`} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold">
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-bold">
                        {i === 0 ? "Initial outreach" : `Follow-up ${i}`}
                      </div>
                      <div className="text-xs text-gray-400">
                        Day {i * delayDays} &middot;{" "}
                        {i === 0
                          ? "AI-personalized email based on brand intel"
                          : "Gentle follow-up if no reply"}
                      </div>
                    </div>
                  </div>
                ))}
                {Array.from({ length: linkedinSteps }, (_, i) => (
                  <div key={`linkedin-${i}`} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px] font-bold">
                      in
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-bold">
                        {i === 0 ? "LinkedIn connection" : `LinkedIn follow-up ${i}`}
                      </div>
                      <div className="text-xs text-gray-400">
                        Day {(emailSteps + i) * delayDays} &middot; Manual send via browser
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-400">
                Total: {selectedBrandIds.size} brands &times; {emailSteps + linkedinSteps} steps ={" "}
                <strong>{selectedBrandIds.size * (emailSteps + linkedinSteps)} messages</strong> over{" "}
                {(emailSteps + linkedinSteps - 1) * delayDays} days
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setStep(2)}
              className="px-6 py-3 border-2 border-gray-200 font-bold text-sm rounded-xl hover:border-black transition-all"
            >
              ← Back
            </button>
            <button
              onClick={createAndGenerateSequence}
              disabled={loading}
              className="flex-1 py-3 bg-black text-white font-bold text-sm rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-60"
            >
              {loading ? "Generating messages..." : "Generate Sequence →"}
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Launch */}
      {step === 4 && (
        <div className="bg-white rounded-2xl border border-black/[0.07] p-6">
          <h2 className="text-xl font-bold mb-1">Launch Campaign</h2>
          <p className="text-sm text-gray-400 mb-6">Review and activate your outreach campaign.</p>

          <div className="space-y-4">
            {/* Summary */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Campaign</span>
                <span className="font-bold">{name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Brands</span>
                <span className="font-bold">{selectedBrandIds.size}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Sequence</span>
                <span className="font-bold">
                  {emailSteps} emails{linkedinSteps > 0 ? ` + ${linkedinSteps} LinkedIn` : ""} over {(emailSteps + linkedinSteps - 1) * delayDays} days
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total messages</span>
                <span className="font-bold">{selectedBrandIds.size * (emailSteps + linkedinSteps)}</span>
              </div>
            </div>

            {/* Multi-mailbox distribution */}
            <div>
              <label className="block text-sm font-bold mb-1.5">Mailbox Distribution</label>
              {emailAccounts.length > 0 ? (
                <div className="space-y-2">
                  {emailAccounts.map((a, idx) => {
                    const emailsPerAccount = Math.ceil(selectedBrandIds.size / emailAccounts.length);
                    const assignedCount = idx < selectedBrandIds.size % emailAccounts.length
                      ? emailsPerAccount
                      : Math.floor(selectedBrandIds.size / emailAccounts.length);
                    return (
                      <div key={a.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-400" />
                          <span className="text-sm font-medium">{a.email}</span>
                        </div>
                        <div className="text-xs text-gray-400">
                          ~{assignedCount} brands &middot; {a.sentToday}/{a.dailySendLimit} sent today
                        </div>
                      </div>
                    );
                  })}
                  <div className="text-xs text-gray-400 mt-1">
                    Emails distributed round-robin across {emailAccounts.length} account{emailAccounts.length > 1 ? "s" : ""}
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-700">
                  No email accounts connected.{" "}
                  <a href="/dashboard/settings" className="font-bold underline">
                    Connect Gmail or SMTP in Settings
                  </a>
                </div>
              )}
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-700">
              <strong>Note:</strong> Step 1 emails will be sent immediately (respecting daily limits).
              Follow-ups are sent automatically if no reply is detected.
              {linkedinSteps > 0 && " LinkedIn steps require manual action (copy + send)."}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(3)}
                className="px-6 py-3 border-2 border-gray-200 font-bold text-sm rounded-xl hover:border-black transition-all"
              >
                ← Back
              </button>
              <button
                onClick={launchCampaign}
                disabled={loading || emailAccounts.length === 0}
                className="flex-1 py-3 bg-[#C8FF00] text-black font-bold text-sm rounded-xl hover:bg-[#b3e600] transition-colors disabled:opacity-40"
              >
                {loading ? "Launching..." : "Launch Campaign 🚀"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
