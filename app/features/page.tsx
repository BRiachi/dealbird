import SiteLayout from "@/components/SiteLayout";
import Link from "next/link";

export default function FeaturesPage() {
    return (
        <SiteLayout>
            <section className="sec pt-20">
                <div className="wrap">
                    <div className="tag">Features</div>
                    <h1 className="h2" style={{ marginTop: '0.5rem' }}>
                        Everything you need.<br /><em>Nothing you don&apos;t.</em>
                    </h1>
                    <p className="sub" style={{ marginBottom: '4rem' }}>
                        DealBird is built specifically for creators dealing with brands. No complex agency software or generic invoicing tools. Just what you need to look professional and get paid.
                    </p>

                    <div className="feats" style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
                        {/* Feature 1 */}
                        <div className="feat wide" style={{ textAlign: 'left', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'center' }}>
                            <div>
                                <div className="fi">✍️</div>
                                <h3 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>E-Signatures Built In</h3>
                                <p style={{ fontSize: '1.1rem', color: '#666', lineHeight: 1.6 }}>
                                    Brands sign directly on the proposal page. There are no downloads, no third-party apps, no friction. The signature is legally binding and timestamped, so you always have a paper trail.
                                </p>
                            </div>
                            <div style={{ background: '#F4F4F5', borderRadius: '1rem', padding: '2rem', border: '1px solid #E4E4E5' }}>
                                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                                    <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>Signature</div>
                                    <div style={{ fontFamily: 'cursive', fontSize: '2rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Sarah Jenkins</div>
                                    <div style={{ fontSize: '0.8rem', color: '#999' }}>Signed Aug 14, 2025 • 2:14 PM IP: 192.168.1.1</div>
                                </div>
                            </div>
                        </div>

                        {/* Feature 2 */}
                        <div className="feat wide" style={{ textAlign: 'left', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'center' }}>
                            <div style={{ order: 2 }}>
                                <div className="fi">💰</div>
                                <h3 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>One-Click Invoicing</h3>
                                <p style={{ fontSize: '1.1rem', color: '#666', lineHeight: 1.6 }}>
                                    Generate an invoice instantly from any signed proposal. All details are pre-filled — deliverables, amounts, and payment terms. Send the link, track the status, and get paid via bank transfer or credit card.
                                </p>
                            </div>
                            <div className="inv-mock" style={{ order: 1, margin: 0 }}>
                                <div className="inv-r"><span className="l">Invoice #</span><span className="v">DB-2025-0042</span></div>
                                <div className="inv-r"><span className="l">Campaign</span><span className="v">Summer Launch</span></div>
                                <div className="inv-d" />
                                <div className="inv-r"><span className="l">TikTok Videos (x3)</span><span className="v">$2,400</span></div>
                                <div className="inv-r"><span className="l">IG Stories (x5)</span><span className="v">$800</span></div>
                                <div className="inv-d" />
                                <div className="inv-r inv-total"><span className="l">Total Due</span><span className="v">$3,200</span></div>
                                <div className="inv-status"><span className="inv-dot" />Payment Pending — Due in 14 Days</div>
                            </div>
                        </div>

                        {/* Feature 3 */}
                        <div className="feat wide" style={{ textAlign: 'left', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'center' }}>
                            <div>
                                <div className="fi">📊</div>
                                <h3 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>View Analytics</h3>
                                <p style={{ fontSize: '1.1rem', color: '#666', lineHeight: 1.6 }}>
                                    Know exactly when a brand opens your proposal, how long they spend on it, and if they shared it internally. Stop guessing whether they saw your pitch or if it got lost in spam.
                                </p>
                                <span className="ftag pro">Pro</span>
                            </div>
                            <div style={{ background: '#F4F4F5', borderRadius: '1rem', padding: '2rem', border: '1px solid #E4E4E5' }}>
                                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                        <span style={{ fontWeight: 600 }}>Proposal Activity</span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem' }}><span style={{ color: '#00C853' }}>●</span><span>Opened by Brand 10 mins ago</span></div>
                                        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem' }}><span style={{ color: '#2962FF' }}>●</span><span>Viewed for 4m 12s</span></div>
                                        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem' }}><span style={{ color: '#FF6D00' }}>●</span><span>Link forwarded to 2 people</span></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ textAlign: 'center', marginTop: '5rem' }}>
                        <h2 style={{ fontSize: '2rem', marginBottom: '1rem', fontWeight: 600 }}>Ready to close more deals?</h2>
                        <Link href="/login" className="btn btn-lime btn-lg">Start for Free Today</Link>
                    </div>
                </div>
            </section>
        </SiteLayout>
    );
}
