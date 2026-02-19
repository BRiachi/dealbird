"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SettingsForm({
  initialName,
  initialHandle,
  initialBio,
  initialTheme,
  initialAccent,
}: {
  initialName: string;
  initialHandle: string;
  initialBio: string;
  initialTheme: string;
  initialAccent: string;
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [handle, setHandle] = useState(initialHandle);
  const [bio, setBio] = useState(initialBio);
  const [theme, setTheme] = useState(initialTheme || "simple");
  const [accent, setAccent] = useState(initialAccent || "#000000");

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const THEMES = ["simple", "dark", "warm", "ocean", "forest", "sunset", "midnight", "lavender"];
  const ACCENTS = ["#000000", "#FFFFFF", "#FF5733", "#33FF57", "#3357FF", "#F1C40F", "#8E44AD", "#E91E63"];

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, handle, bio, theme, accentColor: accent }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
        router.refresh();
      }
    } catch { }
    setSaving(false);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">Full Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3.5 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-[#C8FF00] outline-none" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">Handle / Username</label>
          <div className="relative">
            <span className="absolute left-3.5 top-2.5 text-gray-400 text-sm">@</span>
            <input value={handle} onChange={(e) => setHandle(e.target.value)} placeholder="yourhandle" className="w-full pl-8 pr-3.5 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-[#C8FF00] outline-none" />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1.5">Bio</label>
        <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Creator, content strategist..." className="w-full px-3.5 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-[#C8FF00] outline-none min-h-[80px] resize-y" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-2">Theme</label>
          <div className="grid grid-cols-4 gap-2">
            {THEMES.map(t => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`px-2 py-2 text-xs font-bold rounded-lg border-2 capitalize transition-all ${theme === t ? "border-black bg-black text-white" : "border-gray-100 hover:border-gray-300"}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-2">Accent Color</label>
          <div className="flex flex-wrap gap-2">
            {ACCENTS.map(c => (
              <button
                key={c}
                onClick={() => setAccent(c)}
                className={`w-8 h-8 rounded-full border-2 transition-all ${accent === c ? "scale-110 border-black shadow-sm" : "border-transparent hover:scale-105"}`}
                style={{ backgroundColor: c }}
                title={c}
              />
            ))}
            <input
              type="color"
              value={accent}
              onChange={(e) => setAccent(e.target.value)}
              className="w-8 h-8 rounded-full overflow-hidden border-0 p-0 cursor-pointer"
              title="Custom Color"
            />
          </div>
        </div>
      </div>

      <button onClick={handleSave} disabled={saving} className="self-end px-8 py-3 bg-[#C8FF00] text-black font-bold text-sm rounded-xl hover:bg-[#9FCC00] transition-all disabled:opacity-50 shadow-sm hover:shadow-md hover:-translate-y-0.5">
        {saved ? "✓ Saved!" : saving ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );
}
