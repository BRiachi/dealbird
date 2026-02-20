import SiteLayout from "@/components/SiteLayout";
import Link from "next/link";

export default function BlogPage() {
    const posts = [
        { title: "How to negotiate usage rights without losing the deal", date: "August 12, 2026", excerpt: "Usage rights are where creators leave the most money on the table. Here's how to price them correctly." },
        { title: "The 3 biggest red flags in brand contracts", date: "July 28, 2026", excerpt: "Perpetual royalty-free rights? Beware. What to look out for before you sign on the dotted line." },
        { title: "UGC vs Influencer Marketing: What brands expect", date: "July 10, 2026", excerpt: "Understanding the difference in deliverables, pricing, and expectations when pitching pure UGC." },
        { title: "Why you should never share your median views", date: "June 22, 2026", excerpt: "Brands ask for it, but here is why giving them your median view count hurts your negotiating power." },
    ];

    return (
        <SiteLayout>
            <section className="sec pt-20">
                <div className="wrap">
                    <div className="tag">Blog</div>
                    <h1 className="h2" style={{ marginTop: '0.5rem', textAlign: 'left' }}>
                        Latest from DealBird
                    </h1>
                    <p className="sub" style={{ marginBottom: '4rem', textAlign: 'left' }}>
                        Thoughts, stories, and ideas about the creator economy and taking your business seriously.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                        {posts.map((p) => (
                            <div key={p.title} style={{ display: 'grid', gridTemplateColumns: '25% 75%', gap: '2rem', alignItems: 'baseline', borderBottom: '1px solid #eee', paddingBottom: '3rem' }}>
                                <div style={{ color: '#666', fontSize: '0.95rem' }}>{p.date}</div>
                                <div>
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#111', marginBottom: '1rem' }}>
                                        <Link href="#" style={{ color: 'inherit', textDecoration: 'none' }} className="hover:underline">{p.title}</Link>
                                    </h3>
                                    <p style={{ color: '#555', lineHeight: 1.6, fontSize: '1.1rem' }}>{p.excerpt}</p>
                                    <Link href="#" style={{ display: 'inline-block', marginTop: '1rem', fontWeight: 600, color: '#000' }}>Read Post →</Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </SiteLayout>
    );
}
