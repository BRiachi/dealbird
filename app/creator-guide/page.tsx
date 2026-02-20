import SiteLayout from "@/components/SiteLayout";
import Link from "next/link";

export default function CreatorGuidePage() {
    const guides = [
        { title: "How to Build a Pitch That Converts", readTime: "5 min read", category: "Pitching" },
        { title: "The Perfect Follow-Up Sequence", readTime: "4 min read", category: "Communication" },
        { title: "Pricing Your Usage Rights", readTime: "7 min read", category: "Pricing" },
        { title: "What to Do When a Brand Says 'Too Expensive'", readTime: "6 min read", category: "Negotiation" },
    ];

    return (
        <SiteLayout>
            <section className="sec pt-20">
                <div className="wrap">
                    <div className="tag">Creator Guide</div>
                    <h1 className="h2" style={{ marginTop: '0.5rem', textAlign: 'left' }}>
                        The playbook for landing brand deals.
                    </h1>
                    <p className="sub" style={{ marginBottom: '4rem', textAlign: 'left' }}>
                        Expert advice, templates, and strategies to help you pitch better, negotiate higher rates, and close deals faster.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                        {guides.map((g) => (
                            <div key={g.title} style={{ background: '#fff', borderRadius: '1rem', border: '1px solid #eee', padding: '2rem', display: 'flex', flexDirection: 'column', transition: 'all 0.2s' }} className="hover:shadow-lg hover:-translate-y-1 cursor-pointer">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#666', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{g.category}</span>
                                    <span style={{ fontSize: '0.8rem', color: '#999' }}>{g.readTime}</span>
                                </div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', color: '#111', lineHeight: 1.4 }}>{g.title}</h3>
                                <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', fontSize: '0.9rem', fontWeight: 600, color: '#000' }}>
                                    Read Guide <span style={{ marginLeft: '0.5rem' }}>→</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ marginTop: '6rem', background: '#F4F4F5', padding: '4rem', borderRadius: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                        <h2 style={{ fontSize: '2rem', marginBottom: '1rem', fontWeight: 600 }}>Get the free 5-day email course</h2>
                        <p style={{ color: '#666', marginBottom: '2rem', maxWidth: '600px' }}>Learn our step-by-step system for going from $0 to consistently landing $5k+ brand deals.</p>
                        <div style={{ display: 'flex', gap: '1rem', width: '100%', maxWidth: '400px' }}>
                            <input type="email" placeholder="Your email address" style={{ flex: 1, padding: '1rem', borderRadius: '0.5rem', border: '1px solid #ddd', fontSize: '1rem' }} />
                            <button className="btn btn-dark">Subscribe</button>
                        </div>
                    </div>
                </div>
            </section>
        </SiteLayout>
    );
}
