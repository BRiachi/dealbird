import SiteLayout from "@/components/SiteLayout";
import Link from "next/link";

export default function TemplatesPage() {
    const templates = [
        { name: "TikTok Creator Package", desc: "For selling 1-3 TikTok videos with usage rights.", link: "/login" },
        { name: "Instagram Reels & Stories", desc: "Perfect for a mix of feed posts and 24h stories.", link: "/login" },
        { name: "UGC Portfolio Pitch", desc: "When selling raw assets to brands without posting to your audience.", link: "/login" },
        { name: "YouTube Integration", desc: "For 60-90s dedicated segments within longer content.", link: "/login" },
        { name: "Long-Term Brand Ambassador", desc: "Multi-month campaigns with recurring deliverables.", link: "/login" },
        { name: "Podcast Ad Read", desc: "Pre-roll, mid-roll, or post-roll audio sponsorships.", link: "/login" },
    ];

    return (
        <SiteLayout>
            <section className="sec pt-20">
                <div className="wrap border-b border-gray-200 pb-16">
                    <div className="tag">Templates</div>
                    <h1 className="h2" style={{ marginTop: '0.5rem' }}>
                        Don&apos;t start from scratch.
                    </h1>
                    <p className="sub" style={{ marginBottom: '4rem' }}>
                        Use our pre-built proposal templates for every major platform. Add your rates, tweak the deliverables, and send in minutes.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                        {templates.map((t) => (
                            <div key={t.name} style={{ background: '#fff', borderRadius: '1rem', border: '1px solid #eee', padding: '2rem', display: 'flex', flexDirection: 'column', transition: 'all 0.2s', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }} className="hover:shadow-lg hover:-translate-y-1 cursor-pointer group">
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem', color: '#111' }}>{t.name}</h3>
                                <p style={{ color: '#666', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '1.5rem', flex: 1 }}>{t.desc}</p>
                                <Link href={t.link} style={{ display: 'inline-flex', alignItems: 'center', fontSize: '0.9rem', fontWeight: 600, color: '#000', textDecoration: 'none' }}>
                                    Use Template <span style={{ marginLeft: '0.5rem', transition: 'transform 0.2s' }} className="group-hover:translate-x-1">→</span>
                                </Link>
                            </div>
                        ))}
                    </div>

                    <div style={{ textAlign: 'center', marginTop: '5rem', background: '#111', color: 'white', padding: '4rem 2rem', borderRadius: '1.5rem' }}>
                        <h2 style={{ fontSize: '2rem', marginBottom: '1rem', fontWeight: 600 }}>Need a custom template?</h2>
                        <p style={{ color: '#aaa', marginBottom: '2rem', maxWidth: '600px', margin: '0 auto 2rem' }}>With the Pro plan, you can save your own custom configurations as templates to reuse on future pitches.</p>
                        <Link href="/pricing" className="btn btn-lime">View Pro Plan</Link>
                    </div>
                </div>
            </section>
        </SiteLayout>
    );
}
