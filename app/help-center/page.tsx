import SiteLayout from "@/components/SiteLayout";
import Link from "next/link";

export default function HelpCenterPage() {
    const categories = [
        { title: "Getting Started", count: "12 articles" },
        { title: "Proposals & Signatures", count: "8 articles" },
        { title: "Invoicing & Payments", count: "15 articles" },
        { title: "Account & Billing", count: "6 articles" },
    ];

    return (
        <SiteLayout>
            <section className="sec pt-20">
                <div className="wrap">
                    <div className="tag">Help Center</div>
                    <h1 className="h2" style={{ marginTop: '0.5rem', textAlign: 'center' }}>
                        How can we help?
                    </h1>

                    <div style={{ maxWidth: '600px', margin: '2rem auto 4rem', display: 'flex' }}>
                        <input type="text" placeholder="Search for articles..." style={{ flex: 1, padding: '1.25rem', borderRadius: '0.5rem', border: '1px solid #ddd', fontSize: '1.1rem', outline: 'none' }} />
                        <button className="btn btn-dark" style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0, marginLeft: '-1rem' }}>Search</button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
                        {categories.map((c) => (
                            <div key={c.title} style={{ background: '#fff', borderRadius: '1rem', border: '1px solid #eee', padding: '2rem', textAlign: 'center', transition: 'all 0.2s', cursor: 'pointer' }} className="hover:shadow-md hover:-translate-y-1">
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem', color: '#111' }}>{c.title}</h3>
                                <p style={{ color: '#666', fontSize: '0.95rem' }}>{c.count}</p>
                            </div>
                        ))}
                    </div>

                    <div style={{ textAlign: 'center', marginTop: '5rem', background: '#F4F4F5', padding: '4rem 2rem', borderRadius: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', fontWeight: 600 }}>Still need help?</h2>
                        <p style={{ color: '#666', marginBottom: '2rem' }}>We&apos;re here Monday through Friday, 9am to 6pm EST.</p>
                        <Link href="/contact" className="btn btn-outline" style={{ background: 'white' }}>Contact Support</Link>
                    </div>
                </div>
            </section>
        </SiteLayout>
    );
}
