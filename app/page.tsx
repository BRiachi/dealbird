"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function HomePage() {
  useEffect(() => {
    // Scroll-based reveal animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("vis");
        });
      },
      { threshold: 0.12 }
    );
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

    // Nav scroll effect
    const nav = document.getElementById("nav");
    const onScroll = () => nav?.classList.toggle("scrolled", window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div className="landing">
      {/* Nav */}
      <nav id="nav">
        <Link href="/" className="nav-logo">
          <img src="/logo.png" alt="DealBird" className="logo-mark" />DealBird
        </Link>
        <ul className="nav-links">
          <li><a href="#how">How It Works</a></li>
          <li><a href="#features">Features</a></li>
          <li><a href="#pricing">Pricing</a></li>
        </ul>
        <div className="nav-right">
          <Link href="/login" className="btn btn-ghost">Log In</Link>
          <Link href="/login" className="btn btn-dark">Get Started Free</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-pill"><span className="pill-dot">✓</span> Free for your first 3 deals</div>
          <h1>Brand deals<br /><em>without</em> the <span className="hl">chaos</span></h1>
          <p className="hero-sub">
            Proposals, e-signatures, and invoices in one link. Send it to the brand.
            They sign. You get paid. No more DM negotiations and PayPal screenshots.
          </p>
          <div className="hero-actions">
            <Link href="/login" className="btn btn-lime btn-lg">Create Your First Proposal →</Link>
            <a href="#how" className="btn btn-outline btn-lg">See How It Works</a>
          </div>
          <div className="hero-proof">
            <img src="/creators.png" alt="Creator avatars" className="hero-proof-avatars" />
            <div className="hero-proof-rating">
              <div className="hero-proof-score">4.9/5 Excellent</div>
              <div className="hero-proof-stars">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="star-badge">★</span>
                ))}
              </div>
              <div className="hero-proof-count">2,400+ creators trust DealBird</div>
            </div>
          </div>
        </div>
        <div className="hero-visual">
          <div className="pc">
            <div className="pc-head">
              <div className="pc-who">
                <div className="pc-av">JM</div>
                <div><div className="pc-name">Jessica Martinez</div><div className="pc-handle">@jessicreates · 142K</div></div>
              </div>
              <span className="badge-signed">✓ Signed</span>
            </div>
            <div className="pc-title">Summer Campaign — 3 TikToks + Stories</div>
            <div className="pc-brand">Prepared for Glow Skincare Co.</div>
            <div className="pc-item"><div><div className="pc-item-name">TikTok Video (x3)</div><div className="pc-item-sub">30-60s · hook + CTA · 1 revision</div></div><div className="pc-item-price">$2,400</div></div>
            <div className="pc-item"><div><div className="pc-item-name">Instagram Stories (x5)</div><div className="pc-item-sub">Swipe-up link · 24hr window</div></div><div className="pc-item-price">$800</div></div>
            <div className="pc-item"><div><div className="pc-item-name">Usage Rights — 90 Days</div><div className="pc-item-sub">Organic repurpose · no paid ads</div></div><div className="pc-item-price">$600</div></div>
            <div className="pc-total"><div className="pc-total-label">Total</div><div className="pc-total-val">$3,800</div></div>
            <button className="pc-btn">✓ Approved &amp; Signed</button>
          </div>
          <div className="fb fb1"><div className="fb-label">Paid</div><div className="fb-val"><span className="g">$3,800</span> ✓</div></div>
          <div className="fb fb2"><div className="fb-label">Response Time</div><div className="fb-val">4.2 hrs</div></div>
        </div>
      </section>

      {/* Logos */}
      <section className="logos">
        <div className="logos-label">Trusted by creators working with</div>
        <div className="logos-row">
          {["Glossier", "Gymshark", "Adobe", "Notion", "Canva", "Squarespace"].map((b) => (
            <span key={b}>{b}</span>
          ))}
        </div>
      </section>

      {/* Metrics */}
      <section className="metrics-bar reveal">
        {[
          { num: "$1.2M+", label: "Deal value processed" },
          { num: "4.2 hrs", label: "Avg. time to signature" },
          { num: "89%", label: "Proposals get signed" },
          { num: "2,400+", label: "Creators onboarded" },
        ].map((m) => (
          <div key={m.num} className="m-item">
            <div className="m-num">{m.num}</div>
            <div className="m-label">{m.label}</div>
          </div>
        ))}
      </section>

      {/* How It Works */}
      <section className="sec reveal" id="how">
        <div className="wrap">
          <div className="tag">How It Works</div>
          <h2 className="h2">Pitch to paid.<br /><em>Three steps.</em></h2>
          <p className="sub">No more chasing payments in DMs. No more invoicing through PayPal notes. You look professional — they pay on time.</p>
          <div className="steps">
            {[
              { icon: "📝", title: "Build in 2 minutes", text: "Pick a template for TikTok, IG, YouTube, or UGC. Add deliverables, usage rights, and pricing. Done.", n: "1" },
              { icon: "✍️", title: "Send & get signed", text: "Share one link. The brand opens it, reviews everything, and e-signs — no account needed on their end.", n: "2" },
              { icon: "💰", title: "Invoice & get paid", text: "One click generates an invoice from the signed deal. Track payment status. Send automatic reminders.", n: "3" },
            ].map((s) => (
              <div key={s.n} className="step">
                <div className="step-icon">{s.icon}</div>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
                <div className="step-n">{s.n}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="sec features-sec reveal" id="features">
        <div className="wrap">
          <div className="tag">Features</div>
          <h2 className="h2">Everything you need.<br /><em>Nothing you don&apos;t.</em></h2>
          <p className="sub">Built for creator-brand deals specifically. Not freelancer tools with &quot;creator&quot; slapped on top.</p>
          <div className="feats">
            <div className="feat">
              <div className="fi"><img src="/logo.png" alt="" style={{ width: '24px', height: '24px', borderRadius: '6px' }} /></div>
              <h3>Proposal Templates</h3>
              <p>Pre-built for TikTok, Instagram, YouTube, and UGC. Add deliverables, usage rights, timeline, and pricing in seconds.</p>
            </div>
            <div className="feat">
              <div className="fi">✍️</div>
              <h3>E-Signatures Built In</h3>
              <p>Brands sign directly on the page. No downloads, no third-party apps, no friction. Legally binding and timestamped.</p>
            </div>
            <div className="feat wide">
              <div>
                <div className="fi">💰</div>
                <h3>One-Click Invoicing</h3>
                <p>Generate an invoice instantly from any signed proposal. All details pre-filled — deliverables, amounts, payment terms. Send the link, track the status.</p>
                <span className="ftag">Core Feature</span>
              </div>
              <div className="inv-mock">
                <div className="inv-r"><span className="l">Invoice #</span><span className="v">DB-2026-0042</span></div>
                <div className="inv-r"><span className="l">Campaign</span><span className="v">Summer Launch</span></div>
                <div className="inv-d" />
                <div className="inv-r"><span className="l">TikTok Videos (x3)</span><span className="v">$2,400</span></div>
                <div className="inv-r"><span className="l">IG Stories (x5)</span><span className="v">$800</span></div>
                <div className="inv-r"><span className="l">Usage Rights</span><span className="v">$600</span></div>
                <div className="inv-d" />
                <div className="inv-r inv-total"><span className="l">Total Due</span><span className="v">$3,800</span></div>
                <div className="inv-status"><span className="inv-dot" />Payment Pending — Due in 14 Days</div>
              </div>
            </div>
            <div className="feat">
              <div className="fi">📊</div>
              <h3>View Analytics</h3>
              <p>Know exactly when a brand opens your proposal, how long they spend on it, and if they shared it internally.</p>
              <span className="ftag pro">Pro</span>
            </div>
            <div className="feat">
              <div className="fi">🔔</div>
              <h3>Payment Reminders</h3>
              <p>Automatic email nudges when invoices go unpaid. Stop awkwardly chasing brands in DMs for your money.</p>
              <span className="ftag pro">Pro</span>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="sec reveal">
        <div className="wrap">
          <div className="tag">Creators Love It</div>
          <h2 className="h2">Don&apos;t take our <em>word</em> for it</h2>
          <p className="sub">Hear from creators who stopped chasing payments and started closing deals.</p>
          <div className="testi-grid">
            {[
              { text: "\"I sent my first proposal and the brand signed within 3 hours. They said it was the most professional pitch they'd ever received from a creator. I'm never going back to Google Docs.\"", name: "Jessica M.", handle: "@jessicreates · 142K", bg: "#FFE0B2", color: "#E65100", initials: "JM" },
              { text: "\"Used to lose $2-3K per month in unpaid invoices because I had no paper trail. One-click invoicing from signed proposals changed everything. Zero chasing since I switched.\"", name: "Alex K.", handle: "@alexkfilm · 89K", bg: "#BBDEFB", color: "#1565C0", initials: "AK" },
              { text: "\"My agency manages 12 creators and we were drowning in spreadsheets. Now every deal has a signed proposal and tracked invoice. Collections are up 40% since switching.\"", name: "Sarah R.", handle: "Bloom Talent Agency", bg: "#F3E5F5", color: "#7B1FA2", initials: "SR" },
            ].map((t) => (
              <div key={t.name} className="testi">
                <div className="testi-stars">★★★★★</div>
                <p className="testi-text">{t.text}</p>
                <div className="testi-who">
                  <div className="testi-av" style={{ background: t.bg, color: t.color }}>{t.initials}</div>
                  <div><div className="testi-name">{t.name}</div><div className="testi-handle">{t.handle}</div></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="sec reveal" id="pricing">
        <div className="wrap">
          <div className="tag">Pricing</div>
          <h2 className="h2">Start free.<br /><em>Upgrade when you&apos;re ready.</em></h2>
          <p className="sub">Less than a coffee a week for unlimited proposals. Cancel anytime.</p>
          <div className="pricing">
            <div className="pc2">
              <div className="pc2-tier">Free</div>
              <div className="pc2-price">$0 <span>/ forever</span></div>
              <p className="pc2-desc">Everything to start landing brand deals professionally.</p>
              <div className="pc2-feats">
                {["3 proposals per month", "E-signatures", "Invoice generation", "Shareable proposal links", "DealBird branding on docs"].map((f) => (
                  <div key={f} className="pf2"><span className="pf2-chk">✓</span>{f}</div>
                ))}
              </div>
              <Link href="/login" className="pc2-btn pc2-btn-dark">Get Started — Free</Link>
            </div>
            <div className="pc2 pop">
              <div className="pop-label">Most Popular</div>
              <div className="pc2-tier">Pro</div>
              <div className="pc2-price">$19 <span>/ month</span></div>
              <p className="pc2-desc">For creators closing deals every month and ready to level up.</p>
              <div className="pc2-feats">
                {["Unlimited proposals", "Remove DealBird branding", "View analytics & tracking", "Automatic payment reminders", "Contract templates", "Tax-ready income export"].map((f) => (
                  <div key={f} className="pf2"><span className="pf2-chk">✓</span>{f}</div>
                ))}
              </div>
              <Link href="/login" className="pc2-btn pc2-btn-lime">Start 14-Day Free Trial</Link>
            </div>
            <div className="pc2">
              <div className="pc2-tier">Agency</div>
              <div className="pc2-price">$149 <span>/ month</span></div>
              <p className="pc2-desc">Manage proposals and invoices across your entire roster.</p>
              <div className="pc2-feats">
                {["Everything in Pro", "10+ creator accounts", "Team dashboard & pipeline", "Bulk invoicing", "Revenue reporting"].map((f) => (
                  <div key={f} className="pf2"><span className="pf2-chk">✓</span>{f}</div>
                ))}
              </div>
              <Link href="/login" className="pc2-btn pc2-btn-outline">Contact Sales</Link>
            </div>
          </div>
          <div className="guarantee">🔒 No credit card required · Cancel anytime · 14-day money-back guarantee</div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-outer reveal">
        <div className="cta">
          <h2 className="cta-h2">Your next brand deal<br />deserves <em>better</em> than a DM</h2>
          <p className="cta-sub">Join 2,400+ creators who send professional proposals, get signed faster, and actually get paid on time.</p>
          <div className="cta-btns">
            <Link href="/login" className="btn btn-dark btn-xl">Create Your First Proposal — Free →</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="ft-inner">
          <div className="ft-top">
            <div className="ft-brand">
              <Link href="/" className="nav-logo"><img src="/logo.png" alt="DealBird" className="logo-mark" />DealBird</Link>
              <p>Professional proposals and invoices for creator brand deals. Look professional. Get paid.</p>
            </div>
            <div className="ft-cols">
              {[
                { title: "Product", links: ["Features", "Pricing", "Templates", "Changelog"] },
                { title: "Resources", links: ["Creator Guide", "Rate Calculator", "Blog", "Help Center"] },
                { title: "Company", links: ["About", "Privacy", "Terms", "Contact"] },
              ].map((g) => (
                <div key={g.title} className="ft-col">
                  <div className="ft-col-title">{g.title}</div>
                  {g.links.map((l) => (
                    <a key={l} href="#">{l}</a>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div className="ft-bottom">
            <span>© 2026 DealBird. All rights reserved.</span>
            <span>Built for creators, by creators.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
