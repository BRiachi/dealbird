"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UploadButton } from "@/app/utils/uploadthing";

const FONTS = [
  "Inter", "Poppins", "Montserrat", "Playfair Display", "DM Sans",
  "Space Grotesk", "Outfit", "Raleway", "Nunito", "Lora",
  "Merriweather", "Rubik", "Work Sans", "Source Sans 3", "Libre Baskerville",
];

const THEMES = ["simple", "dark", "warm", "ocean", "forest", "sunset", "midnight", "lavender"];
const ACCENTS = ["#000000", "#FFFFFF", "#FF5733", "#33FF57", "#3357FF", "#F1C40F", "#8E44AD", "#E91E63"];

export default function SettingsForm({
  initialName,
  initialHandle,
  initialBio,
  initialAvatar = "",
  initialTheme,
  initialAccent,
  initialFont = "Inter",
  initialButtonStyle = "rounded",
  initialBackgroundType = "theme",
  initialBackgroundValue = "",
  initialLayout = "grid-2",
  initialSocialLinks = {},
}: {
  initialName: string;
  initialHandle: string;
  initialBio: string;
  initialAvatar?: string;
  initialTheme: string;
  initialAccent: string;
  initialFont?: string;
  initialButtonStyle?: string;
  initialBackgroundType?: string;
  initialBackgroundValue?: string;
  initialLayout?: string;
  initialSocialLinks?: any;
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [handle, setHandle] = useState(initialHandle);
  const [bio, setBio] = useState(initialBio);
  const [avatar, setAvatar] = useState(initialAvatar);
  const [theme, setTheme] = useState(initialTheme || "simple");
  const [accent, setAccent] = useState(initialAccent || "#000000");
  const [font, setFont] = useState(initialFont);
  const [buttonStyle, setButtonStyle] = useState(initialButtonStyle);
  const [backgroundType, setBackgroundType] = useState(initialBackgroundType);
  const [backgroundValue, setBackgroundValue] = useState(initialBackgroundValue);
  const [layout, setLayout] = useState(initialLayout);
  const [socialLinks, setSocialLinks] = useState<any>(initialSocialLinks);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Parse gradient values
  const gradientParts = backgroundType === "gradient" && backgroundValue ? backgroundValue.split(",") : [];
  const gradColor1 = gradientParts[0] || "#C8FF00";
  const gradColor2 = gradientParts[1] || "#000000";
  const gradDirection = gradientParts[2] || "to bottom right";

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, handle, bio, avatar, theme, accentColor: accent, font,
          buttonStyle, backgroundType, backgroundValue, layout, socialLinks,
        }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
        router.refresh();
      }
    } catch { }
    setSaving(false);
  };

  const updateSocial = (platform: string, value: string) => {
    setSocialLinks({ ...socialLinks, [platform]: value });
  };

  const setGradient = (color1: string, color2: string, direction: string) => {
    setBackgroundValue(`${color1},${color2},${direction}`);
  };

  return (
    <div className="flex flex-col gap-8">
      {/* ── Avatar ── */}
      <div className="flex items-center gap-5">
        <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200 shrink-0">
          {avatar ? (
            <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-gray-300">
              {name?.[0]?.toUpperCase() || "?"}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <label className="block text-xs font-semibold text-gray-500">Profile Photo</label>
          <div className="flex items-center gap-2">
            <UploadButton
              endpoint="avatar"
              onClientUploadComplete={(res) => {
                if (res?.[0]) setAvatar(res[0].url);
              }}
              onUploadError={(error: Error) => alert(`Upload error: ${error.message}`)}
              appearance={{ button: "bg-black text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-gray-800 transition-colors", allowedContent: "hidden" }}
            />
            {avatar && (
              <button
                onClick={() => setAvatar("")}
                className="px-3 py-2 text-xs font-bold text-red-500 border-2 border-red-200 rounded-lg hover:bg-red-50 transition-colors"
              >
                Remove
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Profile ── */}
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

      {/* ── Theme & Accent ── */}
      <div>
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Appearance</h4>
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
      </div>

      {/* ── Font ── */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-2">Font</label>
        <select
          value={font}
          onChange={(e) => setFont(e.target.value)}
          className="w-full px-3.5 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-[#C8FF00] outline-none bg-white"
          style={{ fontFamily: `'${font}', sans-serif` }}
        >
          {FONTS.map(f => (
            <option key={f} value={f} style={{ fontFamily: `'${f}', sans-serif` }}>{f}</option>
          ))}
        </select>
        <link rel="stylesheet" href={`https://fonts.googleapis.com/css2?${FONTS.map(f => `family=${f.replace(/ /g, "+")}`).join("&")}&display=swap`} />
      </div>

      {/* ── Button Style ── */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-2">Button Style</label>
        <div className="grid grid-cols-4 gap-3">
          {[
            { value: "rounded", label: "Rounded", cls: "rounded-xl" },
            { value: "sharp", label: "Sharp", cls: "rounded-none" },
            { value: "outline", label: "Outline", cls: "rounded-xl" },
            { value: "pill", label: "Pill", cls: "rounded-full" },
          ].map(s => (
            <button
              key={s.value}
              onClick={() => setButtonStyle(s.value)}
              className={`border-2 p-2 rounded-xl transition-all ${buttonStyle === s.value ? "border-black" : "border-gray-100 hover:border-gray-300"}`}
            >
              <div
                className={`w-full py-2 text-[10px] font-bold text-center ${s.cls} ${
                  s.value === "outline"
                    ? "bg-transparent border-2 border-black text-black"
                    : "bg-black text-white"
                }`}
              >
                {s.label}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Background ── */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-2">Background</label>
        <div className="flex gap-2 mb-3">
          {[
            { value: "theme", label: "Theme Default" },
            { value: "gradient", label: "Gradient" },
            { value: "image", label: "Image" },
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => { setBackgroundType(opt.value); if (opt.value === "theme") setBackgroundValue(""); }}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg border-2 transition-all ${
                backgroundType === opt.value ? "border-black bg-black text-white" : "border-gray-100 hover:border-gray-300"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {backgroundType === "gradient" && (
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <input
              type="color"
              value={gradColor1}
              onChange={(e) => setGradient(e.target.value, gradColor2, gradDirection)}
              className="w-10 h-10 rounded-lg overflow-hidden border-0 p-0 cursor-pointer"
            />
            <span className="text-xs text-gray-400 font-bold">to</span>
            <input
              type="color"
              value={gradColor2}
              onChange={(e) => setGradient(gradColor1, e.target.value, gradDirection)}
              className="w-10 h-10 rounded-lg overflow-hidden border-0 p-0 cursor-pointer"
            />
            <select
              value={gradDirection}
              onChange={(e) => setGradient(gradColor1, gradColor2, e.target.value)}
              className="ml-auto px-2 py-1.5 text-xs border rounded-lg bg-white"
            >
              <option value="to right">Horizontal</option>
              <option value="to bottom">Vertical</option>
              <option value="to bottom right">Diagonal</option>
            </select>
            <div
              className="w-16 h-10 rounded-lg border shrink-0"
              style={{ background: `linear-gradient(${gradDirection}, ${gradColor1}, ${gradColor2})` }}
            />
          </div>
        )}

        {backgroundType === "image" && (
          <div className="p-3 bg-gray-50 rounded-xl">
            {backgroundValue ? (
              <div className="relative rounded-lg overflow-hidden">
                <img src={backgroundValue} alt="" className="w-full h-24 object-cover" />
                <button
                  onClick={() => setBackgroundValue("")}
                  className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg"
                >
                  Remove
                </button>
              </div>
            ) : (
              <UploadButton
                endpoint="backgroundImage"
                onClientUploadComplete={(res) => {
                  if (res?.[0]) setBackgroundValue(res[0].url);
                }}
                onUploadError={(error: Error) => alert(`Upload error: ${error.message}`)}
                appearance={{ button: "bg-black text-white px-4 py-2 rounded-lg text-xs font-bold" }}
              />
            )}
          </div>
        )}
      </div>

      {/* ── Layout ── */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-2">Product Layout</label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: "list", label: "List", icon: (
              <div className="flex flex-col gap-1 w-full">
                <div className="h-2 bg-gray-300 rounded-full w-full" />
                <div className="h-2 bg-gray-300 rounded-full w-full" />
                <div className="h-2 bg-gray-300 rounded-full w-full" />
              </div>
            )},
            { value: "grid-2", label: "Grid 2", icon: (
              <div className="grid grid-cols-2 gap-1 w-full">
                <div className="h-4 bg-gray-300 rounded" />
                <div className="h-4 bg-gray-300 rounded" />
                <div className="h-4 bg-gray-300 rounded" />
                <div className="h-4 bg-gray-300 rounded" />
              </div>
            )},
            { value: "grid-3", label: "Grid 3", icon: (
              <div className="grid grid-cols-3 gap-0.5 w-full">
                <div className="h-3 bg-gray-300 rounded-sm" />
                <div className="h-3 bg-gray-300 rounded-sm" />
                <div className="h-3 bg-gray-300 rounded-sm" />
                <div className="h-3 bg-gray-300 rounded-sm" />
                <div className="h-3 bg-gray-300 rounded-sm" />
                <div className="h-3 bg-gray-300 rounded-sm" />
              </div>
            )},
          ].map(l => (
            <button
              key={l.value}
              onClick={() => setLayout(l.value)}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                layout === l.value ? "border-black" : "border-gray-100 hover:border-gray-300"
              }`}
            >
              <div className="w-12 h-8 flex items-center">{l.icon}</div>
              <span className="text-[10px] font-bold text-gray-500">{l.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Social Links ── */}
      <div>
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Social Links</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { key: "instagram", label: "Instagram", placeholder: "username" },
            { key: "twitter", label: "Twitter / X", placeholder: "username" },
            { key: "tiktok", label: "TikTok", placeholder: "username" },
            { key: "youtube", label: "YouTube", placeholder: "channel URL" },
            { key: "linkedin", label: "LinkedIn", placeholder: "profile URL" },
            { key: "website", label: "Website", placeholder: "https://" },
          ].map(s => (
            <div key={s.key}>
              <label className="block text-xs font-semibold text-gray-500 mb-1">{s.label}</label>
              <input
                value={socialLinks[s.key] || ""}
                onChange={(e) => updateSocial(s.key, e.target.value)}
                placeholder={s.placeholder}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl text-sm focus:border-[#C8FF00] outline-none"
              />
            </div>
          ))}
        </div>
      </div>

      {/* ── Save ── */}
      <button onClick={handleSave} disabled={saving} className="self-end px-8 py-3 bg-[#C8FF00] text-black font-bold text-sm rounded-xl hover:bg-[#9FCC00] transition-all disabled:opacity-50 shadow-sm hover:shadow-md hover:-translate-y-0.5">
        {saved ? "✓ Saved!" : saving ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );
}
