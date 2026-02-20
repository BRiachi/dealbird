import SiteLayout from "@/components/SiteLayout";
import Link from "next/link";

export default function PricingPage() {
    return (
        <SiteLayout>
            <section className="sec pt-20" id="pricing">
                <div className="wrap">
                    <div className="tag">Pricing</div>
                    <h1 className="h2" style={{ marginTop: '0.5rem' }}>
                        Start free.<br /><em>Upgrade when you&apos;re ready.</em>
                    </h1>
                    <p className="sub" style={{ marginBottom: '4rem' }}>
                        Less than a coffee a week for unlimited proposals. Cancel anytime. No hidden fees.
                    </p>

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
                                {["Everything in Pro", "10+ creator accounts", "Team dashboard & pipeline", "Bulk invoicing", "Revenue reporting", "Custom branding"].map((f) => (
                                    <div key={f} className="pf2"><span className="pf2-chk">✓</span>{f}</div>
                                ))}
                            </div>
                            <Link href="/contact" className="pc2-btn pc2-btn-outline">Contact Sales</Link>
                        </div>
                    </div>
                    <div className="guarantee" style={{ marginTop: '2rem' }}>🔒 No credit card required · Cancel anytime · 14-day money-back guarantee</div>

                    <div style={{ marginTop: '6rem', maxWidth: '800px', margin: '6rem auto 0', textAlign: 'left' }}>
                        <h2 style={{ fontSize: '2rem', textAlign: 'center', marginBottom: '3rem', fontWeight: 600 }}>Frequently Asked Questions</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            <div>
                                <h4 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem' }}>What counts as a &quot;proposal&quot; on the free plan?</h4>
                                <p style={{ color: '#666', lineHeight: 1.6 }}>Any pitch you send via link counts as one proposal. If you send 3 proposals in a month and none are signed, you hit your limit. If all 3 are signed, you hit your limit. Limits reset every calendar month.</p>
                            </div>
                            <div>
                                <h4 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem' }}>Do you take a percentage of my brand deals?</h4>
                                <p style={{ color: '#666', lineHeight: 1.6 }}>Absolutely not. We charge a flat monthly fee for the software. Your brand deal money is 100% yours.</p>
                            </div>
                            <div>
                                <h4 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem' }}>Can I cancel my Pro subscription anytime?</h4>
                                <p style={{ color: '#666', lineHeight: 1.6 }}>Yes. If you downgrade, your account reverts to the Free tier at the end of your billing cycle. You won&apos;t lose any data, but you will be restricted to 3 active proposals per month.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </SiteLayout>
    );
}
