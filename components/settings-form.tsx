"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SettingsForm({
  initialName,
  initialHandle,
  initialBio,
}: {
  initialName: string;
  initialHandle: string;
  initialBio: string;
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [handle, setHandle] = useState(initialHandle);
  const [bio, setBio] = useState(initialBio);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, handle, bio }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
        router.refresh();
      }
    } catch {}
    setSaving(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1.5">Full Name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3.5 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-[#C8FF00] outline-none" />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1.5">Handle / Username</label>
        <input value={handle} onChange={(e) => setHandle(e.target.value)} placeholder="@yourhandle" className="w-full px-3.5 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-[#C8FF00] outline-none" />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1.5">Bio</label>
        <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Creator, content strategist..." className="w-full px-3.5 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-[#C8FF00] outline-none min-h-[80px] resize-y" />
      </div>
      <button onClick={handleSave} disabled={saving} className="self-start px-6 py-2.5 bg-[#C8FF00] text-black font-bold text-sm rounded-xl hover:bg-[#9FCC00] transition-all disabled:opacity-50">
        {saved ? "✓ Saved!" : saving ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );
}
