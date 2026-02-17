"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const TEMPLATES = [
  {
    id: "tiktok", name: "TikTok Campaign", icon: "🎵",
    items: [
      { name: "TikTok Video (x1)", detail: "30-60s, hook + CTA, 1 revision", price: 80000 },
      { name: "Usage Rights — 30 Days", detail: "Organic only, no paid ads", price: 20000 },
    ],
  },
  {
    id: "instagram", name: "Instagram Package", icon: "📸",
    items: [
      { name: "Instagram Reel (x1)", detail: "15-30s, trending audio", price: 60000 },
      { name: "Instagram Stories (x3)", detail: "Swipe-up, 24hr post", price: 40000 },
      { name: "Feed Post (x1)", detail: "Carousel or single", price: 50000 },
    ],
  },
  {
    id: "youtube", name: "YouTube Integration", icon: "▶️",
    items: [
      { name: "YouTube Video (x1)", detail: "8-12min, dedicated or integration", price: 300000 },
      { name: "Community Post", detail: "Poll or text post", price: 20000 },
    ],
  },
  {
    id: "ugc", name: "UGC Content", icon: "🎬",
    items: [
      { name: "UGC Video (x3)", detail: "15-60s each, raw footage", price: 90000 },
      { name: "Photo Set (x5)", detail: "Product lifestyle shots", price: 40000 },
    ],
  },
  { id: "blank", name: "Start from Scratch", icon: "✏️", items: [] },
];

const fmtDollars = (cents: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(cents / 100);

export default function NewProposalPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    brand: "",
    brandEmail: "",
    terms: "Net 30",
    notes: "",
    items: [] as { name: string; detail: string; price: number }[],
  });

  const total = form.items.reduce((s, i) => s + (i.price || 0), 0);

  const selectTemplate = (t: (typeof TEMPLATES)[0]) => {
    setForm({ ...form, items: t.items.map((i) => ({ ...i })) });
    setStep(1);
  };

  const updateItem = (idx: number, field: string, val: string | number) => {
    const items = [...form.items];
    items[idx] = { ...items[idx], [field]: field === "price" ? Number(val) || 0 : val };
    setForm({ ...form, items });
  };

  const addItem = () => setForm({ ...form, items: [...form.items, { name: "", detail: "", price: 0 }] });
  const removeItem = (idx: number) => setForm({ ...form, items: form.items.filter((_, i) => i !== idx) });

  const handleSave = async (status: "DRAFT" | "SENT") => {
    setSaving(true);
    try {
      const res = await fetch("/api/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, status }),
      });
      const data = await res.json();
      if (res.ok) router.push(`/dashboard/proposals/${data.id}`);
      else alert(data.error || "Failed to save");
    } catch (e) {
      alert("Network error");
    }
    setSaving(false);
  };

  // Step 0: Template picker
  if (step === 0) {
    return (
      <div>
        <button onClick={() => router.push("/dashboard/proposals")} className="text-sm text-gray-400 hover:text-black mb-6 font-semibold transition-colors">
          ← Back
        </button>
        <h1 className="text-3xl font-extrabold tracking-tight mb-2">Choose a Template</h1>
        <p className="text-gray-500 mb-8">Start with a template or build from scratch.</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {TEMPLATES.map((t) => (
            <button key={t.id} onClick={() => selectTemplate(t)} className="bg-white rounded-2xl border-2 border-black/[0.07] p-8 text-center hover:border-[#C8FF00] transition-all group">
              <div className="text-3xl mb-3">{t.icon}</div>
              <div className="font-bold mb-1">{t.name}</div>
              <div className="text-xs text-gray-400">{t.items.length > 0 ? `${t.items.length} items included` : "Empty canvas"}</div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Step 1: Builder
  return (
    <div>
      <button onClick={() => setStep(0)} className="text-sm text-gray-400 hover:text-black mb-6 font-semibold transition-colors">
        ← Back to Templates
      </button>

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight">Build Your Proposal</h1>
        <div className="flex gap-3">
          <button onClick={() => handleSave("DRAFT")} disabled={saving} className="px-5 py-2.5 border-2 border-gray-200 rounded-lg font-bold text-sm hover:border-black transition-all disabled:opacity-50">
            Save Draft
          </button>
          <button onClick={() => handleSave("SENT")} disabled={saving} className="px-5 py-2.5 bg-[#C8FF00] rounded-lg font-bold text-sm hover:bg-[#9FCC00] transition-all disabled:opacity-50">
            {saving ? "Saving..." : "Save & Send →"}
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        {/* Form */}
        <div className="flex flex-col gap-5">
          {/* Brand Details */}
          <div className="bg-white rounded-2xl border border-black/[0.07] p-6">
            <h3 className="font-bold mb-4">Brand Details</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Proposal Title</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Summer Campaign — 3 TikToks" className="w-full px-3.5 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-[#C8FF00] focus:ring-0 outline-none transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Brand Name</label>
                <input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} placeholder="Glow Skincare Co." className="w-full px-3.5 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-[#C8FF00] focus:ring-0 outline-none transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Brand Email</label>
                <input value={form.brandEmail} onChange={(e) => setForm({ ...form, brandEmail: e.target.value })} placeholder="partnerships@brand.com" className="w-full px-3.5 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-[#C8FF00] focus:ring-0 outline-none transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Payment Terms</label>
                <select value={form.terms} onChange={(e) => setForm({ ...form, terms: e.target.value })} className="w-full px-3.5 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-[#C8FF00] focus:ring-0 outline-none transition-colors bg-white">
                  <option>Net 15</option>
                  <option>Net 30</option>
                  <option>Net 45</option>
                  <option>Due on Receipt</option>
                  <option>50% Upfront</option>
                </select>
              </div>
            </div>
          </div>

          {/* Deliverables */}
          <div className="bg-white rounded-2xl border border-black/[0.07] p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold">Deliverables</h3>
              <button onClick={addItem} className="px-4 py-1.5 bg-[#C8FF00] text-black font-bold text-xs rounded-lg hover:bg-[#9FCC00] transition-all">
                + Add Item
              </button>
            </div>
            <div className="flex flex-col gap-3">
              {form.items.map((item, i) => (
                <div key={i} className="p-4 bg-[#FAFAFA] rounded-xl border border-black/[0.04]">
                  <div className="grid grid-cols-[1fr_140px_auto] gap-3 mb-2.5">
                    <input value={item.name} onChange={(e) => updateItem(i, "name", e.target.value)} placeholder="TikTok Video (x3)" className="px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:border-[#C8FF00] outline-none" />
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-400 text-sm">$</span>
                      <input type="number" value={item.price ? item.price / 100 : ""} onChange={(e) => updateItem(i, "price", Math.round(Number(e.target.value) * 100))} placeholder="0" className="w-full pl-7 pr-3 py-2 border-2 border-gray-200 rounded-lg text-sm font-mono focus:border-[#C8FF00] outline-none" />
                    </div>
                    <button onClick={() => removeItem(i)} className="px-3 py-2 bg-red-50 text-red-500 rounded-lg text-sm font-bold hover:bg-red-100 transition-colors">✕</button>
                  </div>
                  <input value={item.detail} onChange={(e) => updateItem(i, "detail", e.target.value)} placeholder="30-60s, hook + CTA, 1 revision" className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-xs focus:border-[#C8FF00] outline-none" />
                </div>
              ))}
              {form.items.length === 0 && (
                <div className="text-center py-8 text-gray-400 text-sm">No items yet. Click "+ Add Item" to start.</div>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-2xl border border-black/[0.07] p-6">
            <h3 className="font-bold mb-3">Notes</h3>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Deliverables due within 14 days of signing..." className="w-full px-3.5 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-[#C8FF00] outline-none min-h-[80px] resize-y" />
          </div>
        </div>

        {/* Live Preview */}
        <div className="lg:sticky lg:top-24 self-start">
          <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Live Preview</div>
          <div className="bg-white rounded-2xl border border-black/[0.07] p-6 border-t-4 border-t-[#C8FF00]">
            <div className="font-bold mb-1">{form.title || "Untitled Proposal"}</div>
            <div className="text-xs text-gray-400 mb-5">For {form.brand || "Brand Name"}</div>
            {form.items.map((item, i) => (
              <div key={i} className="flex justify-between py-2.5 border-b border-black/[0.04] text-sm">
                <span className="font-semibold">{item.name || "Item"}</span>
                <span className="font-mono font-bold">{fmtDollars(item.price || 0)}</span>
              </div>
            ))}
            <div className="flex justify-between pt-3.5 border-t-2 border-black mt-2">
              <span className="font-bold">Total</span>
              <span className="font-mono font-bold text-lg">{fmtDollars(total)}</span>
            </div>
            <div className="mt-4 py-3 bg-[#C8FF00] rounded-xl text-center font-bold text-sm">✍️ Approve & Sign</div>
            <div className="text-center mt-3 text-[0.7rem] text-gray-400">Powered by <strong className="text-black">DealBird</strong></div>
          </div>
        </div>
      </div>
    </div>
  );
}
