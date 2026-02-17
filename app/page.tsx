import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-[72px] px-6 md:px-12 flex items-center justify-between bg-[#FAFAFA]/90 backdrop-blur-xl border-b border-black/5">
        <Link href="/" className="flex items-center gap-2.5 font-extrabold text-lg">
          <div className="w-8 h-8 bg-lime rounded-lg flex items-center justify-center text-sm -rotate-[5deg]">
            🐦
          </div>
          DealBird
        </Link>
        <div className="hidden md:flex items-center gap-9">
          <a href="#how" className="text-sm font-medium text-gray-500 hover:text-black">How It Works</a>
          <a href="#features" className="text-sm font-medium text-gray-500 hover:text-black">Features</a>
          <a href="#pricing" className="text-sm font-medium text-gray-500 hover:text-black">Pricing</a>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-semibold hover:opacity-70">Log In</Link>
          <Link href="/login" className="text-sm font-semibold bg-black text-white px-6 py-2.5 rounded-full hover:bg-gray-800">
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 md:pt-40 pb-20 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-lime px-4 py-1.5 rounded-full text-xs font-bold mb-8">
            <span className="w-5 h-5 bg-black rounded-full flex items-center justify-center text-lime text-[10px]">→</span>
            Now in Public Beta
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold leading-[0.95] tracking-tight mb-6">
            Stop Losing Money on{" "}
            <span className="relative inline-block">
              Brand Deals
              <span className="absolute bottom-1 left-0 right-0 h-3 bg-lime/50 rounded -z-10" />
            </span>
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed mb-10 max-w-xl">
            Professional proposals, e-signatures, and invoices built for creators.
            Send a link. Get signed. Get paid. Every document makes you look like
            you&apos;ve done this a thousand times.
          </p>
          <div className="flex flex-wrap gap-4 mb-16">
            <Link href="/login" className="bg-lime text-black font-bold px-8 py-4 rounded-xl text-base hover:bg-lime-dim hover:shadow-lg hover:shadow-lime/20 transition-all">
              Start Free →
            </Link>
            <a href="#how" className="border border-gray-200 font-bold px-8 py-4 rounded-xl text-base hover:border-black transition-all">
              See How It Works
            </a>
          </div>
          <div className="flex gap-10">
            {[
              { num: "3x", label: "Faster brand approvals" },
              { num: "$0", label: "To get started" },
              { num: "2min", label: "To send a proposal" },
            ].map((s) => (
              <div key={s.num} className="border-l-2 border-lime pl-4">
                <div className="text-2xl font-extrabold tracking-tight">{s.num}</div>
                <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Logos */}
      <section className="bg-brand-dark py-14 px-6">
        <p className="text-center text-gray-500 text-xs font-medium tracking-widest uppercase mb-8">
          Trusted by Creators Working With
        </p>
        <div className="flex items-center justify-center gap-12 flex-wrap opacity-40">
          {["Glossier", "Gymshark", "Adobe", "Notion", "Canva", "Squarespace"].map((b) => (
            <span key={b} className="text-white font-extrabold text-lg">{b}</span>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how" className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-5 flex items-center gap-2">
          <span className="w-6 h-0.5 bg-lime inline-block" />How It Works
        </p>
        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight mb-4">
          From Pitch to Paid.<br />Three Steps.
        </h2>
        <p className="text-gray-500 text-base mb-16 max-w-lg">
          No more chasing payments in DMs. No more invoicing through PayPal notes.
          Look professional, close faster, get paid on time.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: "📝", title: "Build Your Proposal", text: "Pick a template, add your deliverables and pricing, customize for the brand. Done in under 2 minutes.", num: "1" },
            { icon: "✍️", title: "Send & Get Signed", text: "Share a link. The brand reviews, negotiates inline, and e-signs. No accounts needed on their end.", num: "2" },
            { icon: "💰", title: "Invoice & Get Paid", text: "One click generates an invoice from the signed proposal. Track payment status and send reminders automatically.", num: "3" },
          ].map((step) => (
            <div key={step.num} className="relative bg-white border border-black/5 rounded-2xl p-8 hover:border-lime hover:-translate-y-1 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 bg-lime rounded-xl flex items-center justify-center text-xl mb-6">
                {step.icon}
              </div>
              <h3 className="text-lg font-bold mb-2">{step.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{step.text}</p>
              <span className="absolute bottom-4 right-6 font-mono text-5xl font-bold text-gray-100 group-hover:text-lime transition-colors">
                {step.num}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-brand-dark text-white py-24 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-5 flex items-center gap-2">
            <span className="w-6 h-0.5 bg-lime inline-block" />Features
          </p>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight mb-4">
            Everything You Need.<br />Nothing You Don&apos;t.
          </h2>
          <p className="text-gray-400 text-base mb-16 max-w-lg">
            Built specifically for creator-brand deals. Not repurposed freelancer tools
            with &quot;creator&quot; slapped on top.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { icon: "🐦", title: "Proposal Templates", text: "Pre-built for TikTok, Instagram, YouTube, and UGC deals. Add deliverables, usage rights, timeline, and pricing in seconds." },
              { icon: "✍️", title: "E-Signatures Built In", text: "Brands sign directly on the proposal page. No downloads, no third-party apps, no friction. Legally binding and timestamped." },
              { icon: "📊", title: "View Analytics", text: "Know exactly when a brand opens your proposal, how long they spend on it, and if they shared it with their team.", tag: "Pro" },
              { icon: "🔔", title: "Payment Reminders", text: "Automatic email nudges when invoices go unpaid. Stop awkwardly chasing brands in DMs for your money.", tag: "Pro" },
            ].map((f) => (
              <div key={f.title} className="bg-brand-card border border-white/5 rounded-2xl p-8 hover:border-lime/50 transition-all">
                <div className="w-11 h-11 bg-lime/10 border border-lime/20 rounded-xl flex items-center justify-center text-lg mb-5">
                  {f.icon}
                </div>
                <h3 className="text-lg font-bold mb-2">{f.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{f.text}</p>
                {f.tag && (
                  <span className="inline-block mt-4 text-[11px] font-bold uppercase tracking-wider text-lime bg-lime/10 px-3 py-1 rounded-full">
                    {f.tag}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-5 flex items-center gap-2">
          <span className="w-6 h-0.5 bg-lime inline-block" />Pricing
        </p>
        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight mb-4">
          Simple Pricing.<br />No Surprises.
        </h2>
        <p className="text-gray-500 text-base mb-16 max-w-lg">
          Start free. Upgrade when you&apos;re closing enough deals to justify a coffee a week.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
          {/* Free */}
          <div className="bg-white border border-black/5 rounded-2xl p-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">Free</p>
            <p className="text-4xl font-extrabold tracking-tight mb-1">$0 <span className="text-base font-medium text-gray-400">/ forever</span></p>
            <p className="text-sm text-gray-500 mb-8">Everything you need to start landing brand deals.</p>
            <div className="space-y-3 mb-8">
              {["3 proposals/month", "E-signatures", "Invoice generation", "Shareable links", "DealBird branding"].map((f) => (
                <div key={f} className="flex items-center gap-2.5 text-sm text-gray-600">
                  <span className="w-5 h-5 bg-lime/15 rounded-full flex items-center justify-center text-[10px]">✓</span>
                  {f}
                </div>
              ))}
            </div>
            <Link href="/login" className="block text-center bg-black text-white font-bold py-3.5 rounded-xl hover:bg-gray-800">
              Get Started
            </Link>
          </div>

          {/* Pro */}
          <div className="bg-black text-white border-2 border-lime rounded-2xl p-8 relative">
            <span className="absolute -top-3 right-6 bg-lime text-black text-[10px] font-bold uppercase tracking-wider px-4 py-1 rounded-full">
              Most Popular
            </span>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">Pro</p>
            <p className="text-4xl font-extrabold tracking-tight mb-1">$19 <span className="text-base font-medium text-gray-400">/ month</span></p>
            <p className="text-sm text-gray-400 mb-8">For creators closing deals regularly.</p>
            <div className="space-y-3 mb-8">
              {["Unlimited proposals", "Remove branding", "View analytics", "Payment reminders", "Contract templates", "Tax-ready export"].map((f) => (
                <div key={f} className="flex items-center gap-2.5 text-sm text-gray-400">
                  <span className="w-5 h-5 bg-lime/20 rounded-full flex items-center justify-center text-[10px] text-lime">✓</span>
                  {f}
                </div>
              ))}
            </div>
            <Link href="/login" className="block text-center bg-lime text-black font-bold py-3.5 rounded-xl hover:bg-lime-dim">
              Start Pro Trial
            </Link>
          </div>

          {/* Agency */}
          <div className="bg-white border border-black/5 rounded-2xl p-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">Agency</p>
            <p className="text-4xl font-extrabold tracking-tight mb-1">$149 <span className="text-base font-medium text-gray-400">/ month</span></p>
            <p className="text-sm text-gray-500 mb-8">Manage your entire creator roster.</p>
            <div className="space-y-3 mb-8">
              {["Everything in Pro", "10+ creator accounts", "Team dashboard", "Bulk invoicing", "Revenue reporting"].map((f) => (
                <div key={f} className="flex items-center gap-2.5 text-sm text-gray-600">
                  <span className="w-5 h-5 bg-lime/15 rounded-full flex items-center justify-center text-[10px]">✓</span>
                  {f}
                </div>
              ))}
            </div>
            <Link href="/login" className="block text-center border border-gray-200 font-bold py-3.5 rounded-xl hover:border-black">
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 md:px-12 pb-24 max-w-7xl mx-auto">
        <div className="bg-black rounded-3xl py-20 px-8 md:px-16 text-center relative overflow-hidden">
          <div className="absolute -top-48 -right-48 w-[500px] h-[500px] bg-lime/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-48 -left-48 w-[500px] h-[500px] bg-lime/5 rounded-full blur-3xl" />
          <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-4 relative">
            Your Next Brand Deal<br />Deserves Better Than a DM
          </h2>
          <p className="text-gray-400 text-base max-w-md mx-auto mb-10 relative">
            Join thousands of creators who send professional proposals, get signed faster,
            and actually get paid on time.
          </p>
          <div className="flex gap-4 justify-center relative">
            <Link href="/login" className="bg-lime text-black font-bold px-8 py-4 rounded-xl hover:bg-lime-dim">
              Get Started Free →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-brand-dark py-16 px-6 md:px-12 text-gray-400">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between gap-12 pb-10 border-b border-white/5 mb-8">
            <div>
              <Link href="/" className="flex items-center gap-2.5 font-extrabold text-lg text-white mb-3">
                <div className="w-8 h-8 bg-lime rounded-lg flex items-center justify-center text-sm -rotate-[5deg]">🐦</div>
                DealBird
              </Link>
              <p className="text-sm text-gray-600 max-w-[280px] leading-relaxed">
                Professional proposals and invoices for creator brand deals. Look professional. Get paid.
              </p>
            </div>
            <div className="flex gap-16">
              {[
                { title: "Product", links: ["Features", "Pricing", "Templates", "Changelog"] },
                { title: "Resources", links: ["Creator Guide", "Rate Calculator", "Blog", "Help"] },
                { title: "Company", links: ["About", "Privacy", "Terms", "Contact"] },
              ].map((g) => (
                <div key={g.title}>
                  <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4">{g.title}</p>
                  <div className="space-y-2.5">
                    {g.links.map((l) => (
                      <a key={l} href="#" className="block text-sm text-gray-600 hover:text-white">{l}</a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-between text-xs text-gray-600">
            <span>© 2026 DealBird. All rights reserved.</span>
            <span>Built for creators, by creators.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
