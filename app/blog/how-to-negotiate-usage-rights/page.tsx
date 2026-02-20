import SiteLayout from "@/components/SiteLayout";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function BlogPost() {
    return (
        <SiteLayout>
            <section className="sec pt-20">
                <div className="wrap" style={{ maxWidth: '800px' }}>

                    <Link href="/blog" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#666', marginBottom: '2rem', fontSize: '0.9rem', fontWeight: 500, textDecoration: 'none' }} className="hover:text-black">
                        <ArrowLeft size={16} /> Back to Blog
                    </Link>

                    <div style={{ color: '#666', fontSize: '0.95rem', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Pricing & Negotation</div>
                    <h1 className="h2" style={{ marginTop: '0', textAlign: 'left', marginBottom: '1.5rem', lineHeight: 1.2 }}>
                        How to negotiate usage rights without losing the deal
                    </h1>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '3rem', paddingBottom: '2rem', borderBottom: '1px solid #eee' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#E65100', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>JM</div>
                        <div>
                            <div style={{ fontWeight: 600, color: '#111' }}>Jessica Martinez</div>
                            <div style={{ fontSize: '0.9rem', color: '#666' }}>August 12, 2025 • 6 min read</div>
                        </div>
                    </div>

                    <div className="content-body" style={{ color: '#444', lineHeight: 1.8, fontSize: '1.1rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <p className="lead" style={{ fontSize: '1.25rem', color: '#111', fontWeight: 500, lineHeight: 1.6 }}>
                            Usage rights are where creators leave the most money on the table. When a brand asks for "perpetual, worldwide rights in all media," they are asking to use your face to run ads and make millions, forever, for free. Here is how to push back.
                        </p>

                        <h2 style={{ fontSize: '1.6rem', fontWeight: 600, color: '#111', marginTop: '1.5rem', marginBottom: '0.5rem' }}>What are Usage Rights?</h2>
                        <p>At a baseline, when you do a brand deal, you are charging for the <em>creation</em> and <em>distribution</em> of content to your audience organically. This is called Organic Usage.</p>
                        <p>If the brand wants to take that video, download it, and put marketing budget behind it as a TikTok Spark Ad, Instagram Meta Ad, or use it on their website, that is <em>Paid Usage</em>.</p>

                        <h2 style={{ fontSize: '1.6rem', fontWeight: 600, color: '#111', marginTop: '1.5rem', marginBottom: '0.5rem' }}>The Trap of the "All-In" Rate</h2>
                        <p>Brands will often email you asking for an "all-in" rate for 1 TikTok and 1 year of usage. Do not give them a single number. Break it down.</p>
                        <div style={{ background: '#F8F9FA', padding: '1.5rem', borderLeft: '4px solid #111', borderRadius: '0 0.5rem 0.5rem 0' }}>
                            <strong>Wrong:</strong> "My rate is $3,500 total."<br /><br />
                            <strong>Right:</strong> "My rate for 1 Organic TikTok is $1,500. For 12 months of Paid Social Ads usage, it is an additional $2,000, bringing the total to $3,500."
                        </div>
                        <p style={{ marginTop: '1rem' }}>Why? Because if they reply saying "$3,500 is over our budget, can we do $1,500?", you can reply, "Yes, we can do $1,500 for just the Organic post with NO paid usage."</p>

                        <h2 style={{ fontSize: '1.6rem', fontWeight: 600, color: '#111', marginTop: '1.5rem', marginBottom: '0.5rem' }}>Industry Standard Pricing</h2>
                        <p>While every niche is different, the starting benchmark for usage rights is typically <strong>20% to 30% of your base rate, per month</strong>.</p>
                        <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <li><strong>30 Days Usage:</strong> ~30% of base rate</li>
                            <li><strong>90 Days Usage:</strong> ~75% of base rate</li>
                            <li><strong>6 Months Usage:</strong> ~120% of base rate</li>
                            <li><strong>1 Year Usage:</strong> ~200% of base rate</li>
                            <li><strong>Full Buyout (Perpetual):</strong> Typically 300% to 500% of base rate</li>
                        </ul>

                        <h2 style={{ fontSize: '1.6rem', fontWeight: 600, color: '#111', marginTop: '1.5rem', marginBottom: '0.5rem' }}>How to Say No to Perpetual Rights</h2>
                        <p>Many brands use boilerplate contracts that stipulate perpetual rights. Do not sign these without redlining. Send them this exact email template:</p>
                        <div style={{ background: '#F4F4F5', padding: '1.5rem', borderRadius: '0.5rem', fontFamily: 'monospace', fontSize: '0.95rem', color: '#333' }}>
                            Hi [Name],<br /><br />
                            I reviewed the agreement. I noticed Section 4 lists perpetual, worldwide usage rights in perpetuity. My base rate of $X only covers Organic posting and 30 days of Paid Social usage.<br /><br />
                            I am happy to expand the usage rights to perpetual, however, the buyout fee for this is an additional $Y. Alternatively, we can amend the contract to state "30 Days Digital & Paid Social Usage" and move forward at the current rate.<br /><br />
                            Let me know which option works best!
                        </div>

                        <p style={{ marginTop: '2rem' }}>With <strong>DealBird</strong>, you don't even need to send that email. You can build out your proposal with Usage Rights as an add-on line item. The brand sees exactly what it costs to boost your content, and they sign off on the exact terms. No messy redlines required.</p>

                        <div style={{ textAlign: 'center', marginTop: '3rem', padding: '2rem 0', borderTop: '1px solid #eee' }}>
                            <Link href="/login" className="btn btn-dark">Create Your First Proposal Free</Link>
                        </div>
                    </div>
                </div>
            </section>
        </SiteLayout>
    );
}
