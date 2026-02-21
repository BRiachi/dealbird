"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function ShortsPage() {
  useEffect(() => {
    const nav = document.getElementById("nav");
    const onScroll = () => nav?.classList.toggle("scrolled", window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="landing">
      {/* Nav */}
      <nav id="nav">
        <Link href="/" className="nav-logo">
          <img src="/logo.png" alt="DealBird" className="logo-mark" />DealBird
        </Link>
        <ul className="nav-links">
          <li><Link href="/#how">How It Works</Link></li>
          <li><Link href="/#features">Features</Link></li>
          <li><Link href="/#pricing">Pricing</Link></li>
        </ul>
        <div className="nav-right">
          <Link href="/login" className="btn btn-ghost">Log In</Link>
          <Link href="/login" className="btn btn-dark">Get Started Free</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="sec" style={{ paddingTop: '120px' }}>
        <div className="wrap" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div className="tag">Quick Look</div>
          <h2 className="h2">DealBird in<br /><em>30 seconds</em></h2>
          <p className="sub">Proposals, e-signatures, and invoices — built for creators who close brand deals.</p>

          {/* Video */}
          <div style={{ maxWidth: '400px', margin: '48px auto 0' }}>
            <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid #e5e7eb', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)' }}>
              <video
                style={{ width: '100%', display: 'block', aspectRatio: '9/16' }}
                controls
                autoPlay
                muted
                playsInline
                loop
              >
                <source src="/videos/DealBirdShort.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>

          {/* CTA */}
          <div style={{ marginTop: '48px' }}>
            <Link href="/login" className="btn btn-lime btn-lg">Create Your First Proposal — Free →</Link>
            <p style={{ color: '#9ca3af', fontSize: '14px', marginTop: '16px' }}>No credit card required</p>
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
                {
                  title: "Product", links: [
                    { label: "Features", href: "/features" },
                    { label: "Pricing", href: "/pricing" },
                    { label: "Templates", href: "/templates" },
                    { label: "Changelog", href: "/changelog" }
                  ]
                },
                {
                  title: "Resources", links: [
                    { label: "Creator Guide", href: "/creator-guide" },
                    { label: "Rate Calculator", href: "/rate-calculator" },
                    { label: "Blog", href: "/blog" },
                    { label: "Help Center", href: "/help-center" }
                  ]
                },
                {
                  title: "Company", links: [
                    { label: "About", href: "/about" },
                    { label: "Privacy", href: "/privacy" },
                    { label: "Terms", href: "/terms" },
                    { label: "Contact", href: "/contact" }
                  ]
                },
              ].map((g) => (
                <div key={g.title} className="ft-col">
                  <div className="ft-col-title">{g.title}</div>
                  {g.links.map((l) => (
                    <Link key={l.label} href={l.href}>{l.label}</Link>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div className="ft-bottom">
            <span>&copy; 2026 DealBird. All rights reserved.</span>
            <span>Built for creators, by creators.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
