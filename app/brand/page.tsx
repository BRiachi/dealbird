export default function BrandPage() {
  const colors = [
    { name: "Volt Green", hex: "#C8FF00", usage: "Primary CTA, highlights, active states" },
    { name: "Pure Black", hex: "#0A0A0A", usage: "Text, buttons, logo" },
    { name: "Off White", hex: "#FAFAFA", usage: "Page backgrounds, cards" },
    { name: "Warm Gray", hex: "#F3F4F6", usage: "Secondary backgrounds, chips" },
    { name: "Mid Gray", hex: "#9CA3AF", usage: "Body text, labels, placeholders" },
    { name: "Border Gray", hex: "#E5E7EB", usage: "Borders, dividers" },
  ];

  const typography = [
    { label: "Display", sample: "Land More Brand Deals", class: "text-4xl font-extrabold tracking-tight" },
    { label: "Heading 1", sample: "Your Deal Dashboard", class: "text-2xl font-bold tracking-tight" },
    { label: "Heading 2", sample: "Recent Proposals", class: "text-lg font-bold" },
    { label: "Body", sample: "Send proposals, get signed, get paid — all in one place.", class: "text-base text-gray-600" },
    { label: "Label / Caption", sample: "TOTAL EARNED · NET 30", class: "text-xs font-bold uppercase tracking-widest text-gray-400" },
    { label: "Mono / Price", sample: "$4,200.00", class: "font-mono font-bold text-xl" },
  ];

  const spacing = [
    { name: "2xs", value: "4px", token: "p-1" },
    { name: "xs", value: "8px", token: "p-2" },
    { name: "sm", value: "12px", token: "p-3" },
    { name: "md", value: "16px", token: "p-4" },
    { name: "lg", value: "24px", token: "p-6" },
    { name: "xl", value: "32px", token: "p-8" },
    { name: "2xl", value: "40px", token: "p-10" },
  ];

  const radii = [
    { name: "Button", value: "rounded-lg (8px)", example: "Buttons, tags" },
    { name: "Card", value: "rounded-2xl (16px)", example: "Dashboard cards, modals" },
    { name: "Avatar", value: "rounded-full", example: "Profile images" },
    { name: "Input", value: "rounded-xl (12px)", example: "Form inputs" },
  ];

  const logoUsage = [
    { do: true, rule: "Use on white or very light backgrounds" },
    { do: true, rule: "Maintain minimum 24px clear space around the logo" },
    { do: true, rule: "Use the Volt Green version on dark backgrounds" },
    { do: false, rule: "Don't stretch or distort the logo" },
    { do: false, rule: "Don't place on busy photos without a backdrop" },
    { do: false, rule: "Don't use colors outside the brand palette" },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA]" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Hero */}
      <div className="bg-[#0A0A0A] text-white px-8 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-14 h-14 rounded-2xl bg-[#C8FF00] flex items-center justify-center">
              <span className="text-2xl">🐦</span>
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight leading-none">DealBird</h1>
              <p className="text-gray-400 text-sm mt-0.5">Brand Guidelines · 2025</p>
            </div>
          </div>
          <h2 className="text-5xl font-extrabold tracking-tight max-w-2xl leading-tight mb-4">
            Built for creators.<br />
            <span className="text-[#C8FF00]">Designed to close deals.</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-xl leading-relaxed">
            DealBird helps influencers send proposals, sign contracts, and collect payments from brands — all in one clean, fast platform.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-8 py-16 space-y-20">

        {/* Mission */}
        <section>
          <SectionLabel>01 · Mission</SectionLabel>
          <h3 className="text-2xl font-bold mb-4">Why DealBird exists</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { icon: "⚡", title: "Speed", desc: "From proposal to signed deal in minutes, not days." },
              { icon: "💰", title: "Get Paid", desc: "Invoicing, Stripe Connect, and PayPal built in from day one." },
              { icon: "🎯", title: "Focus", desc: "One platform for the full brand deal lifecycle — nothing more, nothing less." },
            ].map(p => (
              <div key={p.title} className="bg-white rounded-2xl border border-black/[0.07] p-6">
                <div className="text-3xl mb-3">{p.icon}</div>
                <div className="font-bold mb-1">{p.title}</div>
                <div className="text-sm text-gray-500 leading-relaxed">{p.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Logo */}
        <section>
          <SectionLabel>02 · Logo</SectionLabel>
          <h3 className="text-2xl font-bold mb-6">Logo usage</h3>
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-2xl border border-black/[0.07] p-8 flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-[#C8FF00] flex items-center justify-center text-3xl">🐦</div>
              <span className="font-bold text-sm">Logo Mark</span>
              <span className="text-xs text-gray-400">Use on light backgrounds</span>
            </div>
            <div className="bg-[#0A0A0A] rounded-2xl p-8 flex flex-col items-center gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#C8FF00] flex items-center justify-center text-xl">🐦</div>
                <span className="font-extrabold text-xl text-white">DealBird</span>
              </div>
              <span className="text-xs text-gray-500">Horizontal lockup on dark</span>
            </div>
            <div className="bg-[#C8FF00] rounded-2xl p-8 flex flex-col items-center gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center text-xl">🐦</div>
                <span className="font-extrabold text-xl text-black">DealBird</span>
              </div>
              <span className="text-xs text-black/50">Horizontal on Volt Green</span>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-black/[0.07] p-6">
            <div className="grid md:grid-cols-2 gap-3">
              {logoUsage.map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <span className={`text-base ${item.do ? "text-green-500" : "text-red-400"}`}>
                    {item.do ? "✓" : "✕"}
                  </span>
                  <span className={item.do ? "text-gray-700" : "text-gray-500"}>{item.rule}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Colors */}
        <section>
          <SectionLabel>03 · Color</SectionLabel>
          <h3 className="text-2xl font-bold mb-6">Color palette</h3>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {colors.map(c => (
              <div key={c.hex} className="bg-white rounded-2xl border border-black/[0.07] overflow-hidden">
                <div className="h-20" style={{ backgroundColor: c.hex }} />
                <div className="p-4">
                  <div className="font-bold text-sm mb-0.5">{c.name}</div>
                  <div className="font-mono text-xs text-gray-400 mb-2">{c.hex}</div>
                  <div className="text-xs text-gray-500 leading-relaxed">{c.usage}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Typography */}
        <section>
          <SectionLabel>04 · Typography</SectionLabel>
          <h3 className="text-2xl font-bold mb-2">Type system</h3>
          <p className="text-gray-400 text-sm mb-6">Primary: <strong className="text-black">Inter</strong> · All weights via Google Fonts</p>
          <div className="bg-white rounded-2xl border border-black/[0.07] divide-y divide-black/[0.04]">
            {typography.map(t => (
              <div key={t.label} className="p-6 flex flex-col md:flex-row md:items-center gap-3">
                <div className="w-28 shrink-0">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400">{t.label}</span>
                </div>
                <div className={`${t.class} flex-1`}>{t.sample}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Spacing */}
        <section>
          <SectionLabel>05 · Spacing</SectionLabel>
          <h3 className="text-2xl font-bold mb-6">Spacing scale</h3>
          <div className="bg-white rounded-2xl border border-black/[0.07] p-6 flex flex-wrap gap-4">
            {spacing.map(s => (
              <div key={s.name} className="flex flex-col items-center gap-2">
                <div
                  className="bg-[#C8FF00] rounded"
                  style={{ width: parseInt(s.value), height: parseInt(s.value), minWidth: "4px", minHeight: "4px" }}
                />
                <div className="text-center">
                  <div className="text-xs font-bold">{s.name}</div>
                  <div className="text-[10px] text-gray-400">{s.value}</div>
                  <div className="text-[10px] font-mono text-gray-400">{s.token}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Radius */}
        <section>
          <SectionLabel>06 · Radius</SectionLabel>
          <h3 className="text-2xl font-bold mb-6">Border radius</h3>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            {radii.map(r => (
              <div key={r.name} className="bg-white rounded-2xl border border-black/[0.07] p-5 text-center">
                <div
                  className="w-14 h-14 bg-[#C8FF00] mx-auto mb-4"
                  style={{
                    borderRadius: r.name === "Avatar" ? "50%" : r.name === "Button" ? "8px" : r.name === "Input" ? "12px" : "16px"
                  }}
                />
                <div className="font-bold text-sm mb-1">{r.name}</div>
                <div className="text-xs font-mono text-gray-400 mb-1">{r.value}</div>
                <div className="text-xs text-gray-500">{r.example}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Voice */}
        <section>
          <SectionLabel>07 · Voice & Tone</SectionLabel>
          <h3 className="text-2xl font-bold mb-6">How we communicate</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-green-50 border border-green-100 rounded-2xl p-6">
              <div className="text-xs font-bold uppercase tracking-wider text-green-600 mb-4">We say ✓</div>
              <ul className="space-y-2 text-sm text-gray-700">
                {["Send it. Sign it. Get paid.", "Your next deal is waiting.", "You&apos;re live — go get that bag.", "Signed 🎉 Invoice sent automatically.", "Upgrade to unlock unlimited proposals."].map(s => (
                  <li key={s} className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span dangerouslySetInnerHTML={{ __html: s }} />
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-red-50 border border-red-100 rounded-2xl p-6">
              <div className="text-xs font-bold uppercase tracking-wider text-red-500 mb-4">We don&apos;t say ✕</div>
              <ul className="space-y-2 text-sm text-gray-700">
                {["Error: Invalid operation.", "Please complete all required fields.", "Your subscription has been activated.", "Submit form to proceed.", "Authentication required."].map(s => (
                  <li key={s} className="flex items-start gap-2">
                    <span className="text-red-400 mt-0.5">✕</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Component Preview */}
        <section>
          <SectionLabel>08 · Core Components</SectionLabel>
          <h3 className="text-2xl font-bold mb-6">UI component reference</h3>
          <div className="bg-white rounded-2xl border border-black/[0.07] p-8 space-y-8">
            {/* Buttons */}
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Buttons</div>
              <div className="flex flex-wrap gap-3">
                <button className="px-5 py-2.5 bg-[#C8FF00] text-black font-bold text-sm rounded-lg hover:bg-[#9FCC00]">Primary CTA</button>
                <button className="px-5 py-2.5 bg-black text-white font-bold text-sm rounded-lg hover:bg-gray-800">Secondary</button>
                <button className="px-5 py-2.5 border-2 border-black text-black font-bold text-sm rounded-lg hover:bg-gray-50">Outline</button>
                <button className="px-5 py-2.5 border-2 border-red-200 text-red-500 font-bold text-sm rounded-lg hover:bg-red-50">Destructive</button>
              </div>
            </div>
            {/* Badges */}
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Status Badges</div>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "DRAFT", cls: "bg-gray-100 text-gray-500" },
                  { label: "SENT", cls: "bg-blue-50 text-blue-600" },
                  { label: "VIEWED", cls: "bg-purple-50 text-purple-600" },
                  { label: "SIGNED", cls: "bg-green-50 text-green-600" },
                  { label: "PAID", cls: "bg-green-100 text-green-700" },
                  { label: "PENDING", cls: "bg-yellow-50 text-yellow-600" },
                  { label: "OVERDUE", cls: "bg-red-50 text-red-600" },
                ].map(b => (
                  <span key={b.label} className={`px-2.5 py-1 rounded-full text-xs font-bold ${b.cls}`}>{b.label}</span>
                ))}
              </div>
            </div>
            {/* Card */}
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Card</div>
              <div className="bg-white rounded-2xl border border-black/[0.07] p-5 flex items-center justify-between max-w-md hover:border-[#C8FF00] transition-all cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 bg-[#C8FF00]/10 rounded-xl flex items-center justify-center font-bold">N</div>
                  <div>
                    <div className="font-bold text-sm mb-0.5">Nike x Creator Deal</div>
                    <div className="text-xs text-gray-400">Nike · 2 days ago</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-sm">$8,500</span>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-green-50 text-green-600">SIGNED</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="text-center py-8 border-t border-black/[0.06]">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-[#C8FF00] flex items-center justify-center text-sm">🐦</div>
            <span className="font-extrabold">DealBird</span>
          </div>
          <p className="text-xs text-gray-400">Brand Guidelines · Internal use · 2025</p>
          <p className="text-xs text-gray-400 mt-1">
            Questions? <a href="mailto:hello@dealbird.ai" className="underline hover:text-black">hello@dealbird.ai</a>
          </p>
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-xs font-bold uppercase tracking-widest text-[#C8FF00] bg-black inline-block px-2.5 py-1 rounded-md mb-3">
      {children}
    </div>
  );
}
