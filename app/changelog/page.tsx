import SiteLayout from "@/components/SiteLayout";

export default function ChangelogPage() {
    const updates = [
        { version: "v1.2 - Pro Analytics", date: "August 10, 2025", type: "Feature", content: "Added detailed view tracking for Pro users. Now you can see exactly when a brand opens your proposal, how long they look at it, and if they share it." },
        { version: "v1.1.4 - Invoice Exports", date: "July 22, 2025", type: "Improvement", content: "You can now export all your paid invoices as a CSV file for your accountant. Perfect for tax season." },
        { version: "v1.1 - Custom Branding", date: "June 15, 2025", type: "Feature", content: "Pro users can now remove the 'Powered by DealBird' badge from their proposals and invoices, adding their own custom hex color." },
        { version: "v1.0 - The Launch", date: "May 1, 2025", type: "Release", content: "DealBird is officially out of beta! Bringing proposals, e-signatures, and one-click invoicing to creators everywhere." },
    ];

    return (
        <SiteLayout>
            <section className="sec pt-20">
                <div className="wrap" style={{ maxWidth: '800px' }}>
                    <div className="tag">Changelog</div>
                    <h1 className="h2" style={{ marginTop: '0.5rem', textAlign: 'left' }}>
                        What&apos;s new in DealBird
                    </h1>
                    <p className="sub" style={{ marginBottom: '4rem', textAlign: 'left', margin: '0' }}>
                        New features, essential fixes, and exciting updates.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem', marginTop: '4rem' }}>
                        {updates.map((u) => (
                            <div key={u.version} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', borderLeft: '2px solid #eee', paddingLeft: '2rem', position: 'relative' }}>
                                <div style={{ position: 'absolute', left: '-7px', top: '5px', width: '12px', height: '12px', borderRadius: '50%', background: u.type === 'Feature' ? '#E1F5FE' : u.type === 'Release' ? '#E8F5E9' : '#F3E5F5', border: `2px solid ${u.type === 'Feature' ? '#03A9F4' : u.type === 'Release' ? '#4CAF50' : '#9C27B0'}` }}></div>
                                <div style={{ color: '#666', fontSize: '0.9rem', fontWeight: 500 }}>{u.date}</div>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#111', margin: '0.5rem 0' }}>{u.version}</h3>
                                <span style={{ display: 'inline-block', background: '#F4F4F5', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 600, width: 'fit-content', marginBottom: '1rem', color: '#555' }}>{u.type}</span>
                                <p style={{ color: '#444', lineHeight: 1.6, fontSize: '1.05rem' }}>{u.content}</p>
                            </div>
                        ))}
                    </div>

                </div>
            </section>
        </SiteLayout>
    );
}
