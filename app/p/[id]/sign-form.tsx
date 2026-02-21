"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

import { formatCurrency } from "@/lib/utils";

interface ProposalItem {
  id: string;
  name: string;
  price: number;
}

interface ProposalAddOn {
  id: string;
  name: string;
  description: string | null;
  price: number;
}

export default function ProposalSignForm({
  slug,
  baseTotal,
  items,
  addOns,
}: {
  slug: string;
  baseTotal: number;
  items: ProposalItem[];
  addOns: ProposalAddOn[];
}) {
  const router = useRouter();
  const [sigName, setSigName] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [signed, setSigned] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [selectedAddOns, setSelectedAddOns] = useState<Record<string, boolean>>({});

  const dynamicTotal = baseTotal + addOns.filter(a => selectedAddOns[a.id]).reduce((sum, a) => sum + a.price, 0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ("touches" in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const ctx = canvasRef.current!.getContext("2d")!;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    isDrawing.current = true;
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing.current) return;
    e.preventDefault();
    const ctx = canvasRef.current!.getContext("2d")!;
    const pos = getPos(e);
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#0A0A0A";
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDraw = () => {
    isDrawing.current = false;
  };

  const clearSig = () => {
    const ctx = canvasRef.current!.getContext("2d")!;
    ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
    setHasSignature(false);
  };

  const handleSign = async () => {
    setLoading(true);
    try {
      const signatureData = canvasRef.current?.toDataURL("image/png");
      const res = await fetch("/api/proposals/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          signature: sigName,
          signatureData,
          selectedAddOnIds: Object.keys(selectedAddOns).filter(id => selectedAddOns[id])
        }),
      });

      if (res.ok) {
        setSigned(true);
        // Refresh after a moment to show signed state
        setTimeout(() => router.refresh(), 1500);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  if (signed) {
    return (
      <div className="mt-8 p-6 bg-green-50 rounded-2xl border border-green-200 text-center animate-fade-in">
        <div className="text-3xl mb-2">✓</div>
        <h3 className="font-bold text-green-700 text-lg mb-1">
          Proposal Approved & Signed!
        </h3>
        <p className="text-sm text-green-600">
          Signed by {sigName} · The creator has been notified.
        </p>
      </div>
    );
  }

  const canSign = sigName.trim().length > 0 && agreed && hasSignature;

  return (
    <div className="mt-8 p-6 bg-[#FAFAFA] rounded-2xl border border-gray-200">
      <h3 className="font-bold text-base mb-5">✍️ Approve & Sign</h3>

      {/* Add-Ons Checklist */}
      {addOns && addOns.length > 0 && (
        <div className="mb-6">
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
            Optional Upgrades
          </label>
          <div className="flex flex-col gap-3">
            {addOns.map((addon) => {
              const checked = !!selectedAddOns[addon.id];
              return (
                <label
                  key={addon.id}
                  className={`flex items-start gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer ${checked
                    ? "border-[#C8FF00] bg-[#FAFAFA]"
                    : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                >
                  <div className="pt-0.5">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) =>
                        setSelectedAddOns((prev) => ({
                          ...prev,
                          [addon.id]: e.target.checked,
                        }))
                      }
                      className="w-5 h-5 accent-[#C8FF00] rounded text-black focus:ring-black"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-bold text-sm">{addon.name}</span>
                      <span className="font-mono font-bold text-sm text-green-600">
                        +{formatCurrency(addon.price)}
                      </span>
                    </div>
                    {addon.description && (
                      <p className="text-xs text-gray-500 leading-relaxed">
                        {addon.description}
                      </p>
                    )}
                  </div>
                </label>
              );
            })}
          </div>

          <div className="mt-5 flex justify-between items-center py-4 border-y border-dashed border-gray-200">
            <span className="font-bold text-sm text-gray-500">New Total (if signed)</span>
            <span className="font-mono font-extrabold text-xl">{formatCurrency(dynamicTotal)}</span>
          </div>
        </div>
      )}

      {/* Name */}
      <div className="mb-4">
        <label className="block text-xs font-semibold text-gray-500 mb-1.5">
          Full Name
        </label>
        <input
          type="text"
          value={sigName}
          onChange={(e) => setSigName(e.target.value)}
          placeholder="Sarah Chen"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-white"
        />
      </div>

      {/* Signature Canvas */}
      <div className="mb-4">
        <label className="block text-xs font-semibold text-gray-500 mb-1.5">
          Signature
        </label>
        <div className="relative border border-gray-200 rounded-xl overflow-hidden bg-white">
          <canvas
            ref={canvasRef}
            width={580}
            height={120}
            className="w-full h-[120px] cursor-crosshair signature-canvas"
            onMouseDown={startDraw}
            onMouseMove={draw}
            onMouseUp={stopDraw}
            onMouseLeave={stopDraw}
            onTouchStart={startDraw}
            onTouchMove={draw}
            onTouchEnd={stopDraw}
          />
          {!hasSignature && (
            <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-300 pointer-events-none">
              Draw your signature here
            </div>
          )}
        </div>
        {hasSignature && (
          <button
            onClick={clearSig}
            className="text-xs text-gray-400 hover:text-gray-600 mt-1.5"
          >
            Clear signature
          </button>
        )}
      </div>

      {/* Agreement */}
      <label className="flex items-start gap-3 mb-5 cursor-pointer">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-0.5 accent-[#C8FF00]"
        />
        <span className="text-sm text-gray-500 leading-relaxed">
          I agree to the deliverables, pricing, and terms outlined in this
          proposal. This constitutes a binding agreement between both parties.
        </span>
      </label>

      {/* Sign Button */}
      <button
        disabled={!canSign || loading}
        onClick={handleSign}
        className="w-full bg-[#C8FF00] text-black font-bold py-4 rounded-xl text-base hover:bg-[#9FCC00] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
      >
        {loading ? "Signing..." : "✓ Approve & Sign Proposal"}
      </button>
    </div>
  );
}
