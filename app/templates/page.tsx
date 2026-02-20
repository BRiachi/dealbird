import SiteLayout from "@/components/SiteLayout";
import Link from "next/link";

export default function TemplatesPage() {
    const templates = [
        {
            name: "TikTok Creator Package",
            desc: "For selling 1-3 TikTok videos with 30 days of usage rights. The most common pitch format.",
            items: [
                { label: "TikTok Video (x1)", price: "$1,500" },
                { label: "Usage Rights (30 Days)", price: "$500" },
                { label: "Link in Bio (7 Days)", price: "$200" }
            ],
            total: "$2,200"
        },
        {
            name: "Instagram Campaigns",
            desc: "Perfect for a mix of feed posts and 24h stories, plus a link sticker.",
            items: [
                { label: "IG Reel (x1)", price: "$1,800" },
                { label: "IG Stories (x3)", price: "$600" },
                { label: "Usage Rights (90 Days)", price: "$1,200" }
            ],
            total: "$3,600"
        },
        {
            name: "UGC Portfolio Pitch",
            desc: "Selling raw assets to brands without posting to your own audience.",
            items: [
                { label: "Raw Video Asset (x3)", price: "$900" },
                { label: "Hook Variations (x2)", price: "$300" },
                { label: "Perpetual Usage Buyout", price: "$1,500" }
            ],
            total: "$2,700"
        },
        {
            name: "YouTube Integration",
            desc: "For 60-90s dedicated segments within longer content.",
            items: [
                { label: "60s Integrated Sponsor Read", price: "$4,500" },
                { label: "Top Line Description Link", price: "$500" },
                { label: "Usage Rights (In-Video Only)", price: "$0" }
            ],
            total: "$5,000"
        },
    ];

    return (
        <SiteLayout>
            <section className="sec pt-20">
                <div className="wrap">
                    <div className="tag">Templates</div>
                    <h1 className="h2" style={{ marginTop: '0.5rem', textAlign: 'left', marginBottom: '1rem' }}>
                        Don't start from scratch.
                    </h1>
                    <p className="sub" style={{ marginBottom: '4rem', textAlign: 'left' }}>
                        Use our pre-built proposal templates for every platform. We've pre-filled the industry-standard deliverables and line items so you don't forget to charge for usage rights.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem' }}>
                        {templates.map((t) => (
                            <div key={t.name} style={{ background: '#fff', borderRadius: '1.5rem', border: '1px solid #eee', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
                                <div style={{ padding: '2rem 2rem 1.5rem', borderBottom: '1px solid #eee', background: '#FAFAFA' }}>
                                    <h3 style={{ fontSize: '1.35rem', fontWeight: 600, color: '#111', marginBottom: '0.5rem' }}>{t.name}</h3>
                                    <p style={{ color: '#666', fontSize: '1rem', lineHeight: 1.5 }}>{t.desc}</p>
                                </div>

                                <div style={{ padding: '1.5rem 2rem', flex: 1 }}>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#999', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>Included Line Items</div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        {t.items.map(item => (
                                            <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ color: '#444', fontSize: '1.05rem' }}>{item.label}</span>
                                                <span style={{ fontWeight: 500, color: '#111' }}>{item.price}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div style={{ padding: '1.5rem 2rem', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ fontSize: '0.85rem', color: '#666' }}>Example Total</span>
                                        <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#00C853' }}>{t.total}</span>
                                    </div>
                                    <Link href="/login" className="btn btn-dark" style={{ padding: '0.75rem 1.5rem' }}>
                                        Use Template
                                    </Link>
                                </div>
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
