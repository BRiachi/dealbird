import SiteLayout from "@/components/SiteLayout";
import Link from "next/link";

export default function CreatorGuidePage() {
    return (
        <SiteLayout>
            <section className="sec pt-20">
                <div className="wrap" style={{ maxWidth: '800px' }}>
                    <div className="tag">Creator Guide</div>
                    <h1 className="h2" style={{ marginTop: '0.5rem', textAlign: 'left', marginBottom: '2rem' }}>
                        The Ultimate Guide to Pitching Brands & Getting Paid
                    </h1>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '4rem', paddingBottom: '2rem', borderBottom: '1px solid #eee' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#111', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>DB</div>
                        <div>
                            <div style={{ fontWeight: 600, color: '#111' }}>The DealBird Team</div>
                            <div style={{ fontSize: '0.9rem', color: '#666' }}>12 min read</div>
                        </div>
                    </div>

                    <div className="content-body" style={{ color: '#444', lineHeight: 1.8, fontSize: '1.1rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <p className="lead" style={{ fontSize: '1.3rem', color: '#111', fontWeight: 500, lineHeight: 1.6 }}>
                            You have an audience. You know how to make great content. But when it comes to turning that attention into a sustainable business, the playbook is incredibly murky. How much do you charge? What should your pitch email look like? How do you make sure you actually get paid?
                        </p>

                        <p>We've analyzed over 14,000 successful brand deal contracts processed through DealBird. In this guide, we're sharing the exact mechanics of how professional creators land five-figure deals.</p>

                        <h2 style={{ fontSize: '1.8rem', fontWeight: 600, color: '#111', marginTop: '2rem', marginBottom: '0.5rem' }}>Step 1: The Pitch That Converts</h2>
                        <p>Most creators send pitches that look like this:</p>
                        <div style={{ background: '#FFF0F0', borderLeft: '4px solid #FF5252', padding: '1.5rem', borderRadius: '0 0.5rem 0.5rem 0', color: '#B71C1C', fontSize: '1rem' }}>
                            "Hi [Brand], I love your products! I have 50k followers on TikTok. Want to collaborate?"
                        </div>
                        <p style={{ marginTop: '1rem' }}>This fails because it puts the work on the brand. You are asking them to figure out how to use you. A professional pitch does the thinking for them.</p>

                        <h3 style={{ fontSize: '1.3rem', fontWeight: 600, color: '#111', marginTop: '1rem' }}>The Anatomy of a Perfect Pitch:</h3>
                        <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <li><strong>The Hook:</strong> A specific, genuine insight about their current marketing.</li>
                            <li><strong>The Value:</strong> Why your specific audience demographics perfectly align with their target customer (use data, not just "vibes").</li>
                            <li><strong>The Concept:</strong> 2-3 concrete video ideas that would work perfectly on your page while highlighting their product.</li>
                            <li><strong>The Call to Action:</strong> A link to a professional DealBird proposal outlining pricing and deliverables.</li>
                        </ul>

                        <h2 style={{ fontSize: '1.8rem', fontWeight: 600, color: '#111', marginTop: '2rem', marginBottom: '0.5rem' }}>Step 2: Pricing Your Content</h2>
                        <p>Follower count is only 20% of the equation. Your rate should be calculated based on the following stack:</p>

                        <div style={{ background: '#F4F4F5', padding: '2rem', borderRadius: '1rem', marginTop: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #ccc', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
                                <span style={{ fontWeight: 600 }}>Base Deliverable (e.g., 1 TikTok)</span>
                                <span>$X</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #ccc', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
                                <span style={{ fontWeight: 600 }}>+ Exclusivity (competitor lockout)</span>
                                <span>+ 50%</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #ccc', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
                                <span style={{ fontWeight: 600 }}>+ Usage Rights (for paid ads)</span>
                                <span>+ 100% to 300%</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.5rem' }}>
                                <span style={{ fontWeight: 700, color: '#111' }}>Total Package Rate</span>
                                <span style={{ fontWeight: 700, color: '#00C853' }}>$X,XXX</span>
                            </div>
                        </div>

                        <p><strong>Never give away Usage Rights for free.</strong> If a brand wants to put spend behind your face to run ads, they are extracting immense value from your likeness. Charge 30-50% of your base rate <em>per month</em> of usage, or a flat buyout fee (typically 3x your base rate).</p>

                        <h2 style={{ fontSize: '1.8rem', fontWeight: 600, color: '#111', marginTop: '2rem', marginBottom: '0.5rem' }}>Step 3: The Contract & E-Signature</h2>
                        <p>Once they agree on a price, you need a signature. Sending an invoice without a signed SOW (Statement of Work) is how you end up doing 4 rounds of free revisions and getting paid net-90.</p>
                        <p>With DealBird, your proposal <em>is</em> the contract. The brand opens the link, reviews the exact deliverables, usage terms, and price, and signs directly on the page. It's legally binding and creates a concrete paper trail.</p>

                        <h2 style={{ fontSize: '1.8rem', fontWeight: 600, color: '#111', marginTop: '2rem', marginBottom: '0.5rem' }}>Step 4: Ensuring You Get Paid</h2>
                        <p>The campaign is live. The views are rolling in. Now it's time to collect.</p>
                        <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <li><strong>Send the invoice immediately.</strong> Do not wait to the end of the month. As soon as the deliverables are met, send the invoice link.</li>
                            <li><strong>Set clear terms.</strong> Net-30 (payment due in 30 days) is standard for large brands. Never accept Net-60 or Net-90 if you can negotiate it down.</li>
                            <li><strong>Automate your follow-ups.</strong> Turn on DealBird's automatic payment reminders. Let the software be the "bad guy" reminding the brand to pay, preserving your creative relationship with your contact.</li>
                        </ul>

                        <div style={{ background: '#111', color: 'white', padding: '3rem', borderRadius: '1.5rem', marginTop: '3rem', textAlign: 'center' }}>
                            <h3 style={{ fontSize: '1.8rem', fontWeight: 600, marginBottom: '1rem' }}>Stop leaving money on the table</h3>
                            <p style={{ color: '#ccc', marginBottom: '2rem', fontSize: '1.1rem' }}>Get the tools you need to look professional, charge more, and get paid on time.</p>
                            <Link href="/login" className="btn btn-lime btn-lg">Start Using DealBird For Free</Link>
                        </div>
                    </div>
                </div>
            </section>
        </SiteLayout>
    );
}
