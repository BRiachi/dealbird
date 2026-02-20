"use client";

import SiteLayout from "@/components/SiteLayout";
import Link from "next/link";
import { useState } from "react";

export default function HelpCenterPage() {
    const [openQ, setOpenQ] = useState<number | null>(0);

    const faqs = [
        {
            q: "How do e-signatures work on DealBird?",
            a: "When you send a proposal link to a brand, they can review the deliverables and pricing on any device. At the bottom of the proposal, they type or draw their signature and click 'Approve'. This generates a legally binding signature with a cryptographic timestamp and IP address log, complying with the U.S. ESIGN Act."
        },
        {
            q: "Does the brand need a DealBird account to sign or pay?",
            a: "No! The magic of DealBird is entirely frictionless for the brand. They just open the link you send them. They do not need to create an account, log in, or download any apps to view, sign, or pay your invoice."
        },
        {
            q: "How do I get paid?",
            a: "DealBird integrates directly with Stripe. When a brand pays your invoice via Credit Card, ACH, or Apple Pay, the funds are deposited directly into your connected Stripe account and routed to your bank. DealBird takes 0% commission on your deals—you only pay standard Stripe processing fees."
        },
        {
            q: "Can I customize the proposal with my own branding?",
            a: "Yes! On the Pro plan, you can set a custom brand color, upload your logo, and remove the 'Powered by DealBird' watermark from all your proposals and invoices. Your brand, your rules."
        },
        {
            q: "What if a brand ignores my invoice?",
            a: "DealBird's Pro plan includes automated payment reminders. If an invoice hits its due date and remains unpaid, DealBird will automatically format and send a polite follow-up email to the brand on your behalf (e.g., at 3 days late, 7 days late, and 14 days late) so you don't have to chase them in DMs."
        },
        {
            q: "Is there a limit to how many proposals I can send on the Free plan?",
            a: "The Free plan allows you to send up to 3 proposals per month. A proposal counts against your limit when you generate the shareable link. If you need to send more pitches, the Pro plan offers unlimited proposals."
        }
    ];

    return (
        <SiteLayout>
            <section className="sec pt-20">
                <div className="wrap" style={{ maxWidth: '800px' }}>
                    <div className="tag">Help Center</div>
                    <h1 className="h2" style={{ marginTop: '0.5rem', textAlign: 'left', marginBottom: '1rem' }}>
                        Frequently Asked Questions
                    </h1>
                    <p className="sub" style={{ marginBottom: '4rem', textAlign: 'left' }}>
                        Everything you need to know about using DealBird to run your business.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {faqs.map((faq, i) => (
                            <div key={i} style={{ border: '1px solid #eee', borderRadius: '1rem', background: '#fff', overflow: 'hidden' }}>
                                <button
                                    onClick={() => setOpenQ(openQ === i ? null : i)}
                                    style={{ width: '100%', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: '1.1rem', fontWeight: 600, color: '#111' }}
                                >
                                    {faq.q}
                                    <span style={{ fontSize: '1.5rem', fontWeight: 300, color: '#999', transform: openQ === i ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s' }}>+</span>
                                </button>
                                {openQ === i && (
                                    <div style={{ padding: '0 1.5rem 1.5rem', color: '#555', lineHeight: 1.6, fontSize: '1.05rem' }}>
                                        {faq.a}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div style={{ textAlign: 'center', marginTop: '5rem', background: '#F4F4F5', padding: '4rem 2rem', borderRadius: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', fontWeight: 600 }}>Still need help?</h2>
                        <p style={{ color: '#666', marginBottom: '2rem' }}>We're here Monday through Friday, 9am to 6pm EST.</p>
                        <Link href="/contact" className="btn btn-outline" style={{ background: 'white' }}>Contact Support</Link>
                    </div>
                </div>
            </section>
        </SiteLayout>
    );
}
