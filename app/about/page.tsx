import SiteLayout from "@/components/SiteLayout";
import Link from "next/link";

export default function AboutPage() {
    return (
        <SiteLayout>
            <section className="sec pt-20">
                <div className="wrap border-b border-gray-200 pb-16">
                    <div className="tag">About Us</div>
                    <h1 className="h2" style={{ marginTop: '0.5rem', textAlign: 'left' }}>
                        Built for creators, by creators.
                    </h1>
                    <p className="sub" style={{ marginBottom: '4rem', textAlign: 'left', maxWidth: '800px' }}>
                        We started DealBird because we were tired of chasing down unpaid invoices, getting ghosted after sending over our rates in Instagram DMs, and paying 3% fees to PayPal.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center', marginBottom: '6rem' }}>
                        <div>
                            <h2 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '1.5rem' }}>Our Mission</h2>
                            <p style={{ color: '#555', fontSize: '1.1rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                                We believe the creator middle class is the future of media. But while tools exist to help creators film, edit, and post, the business side is entirely broken.
                            </p>
                            <p style={{ color: '#555', fontSize: '1.1rem', lineHeight: 1.6 }}>
                                DealBird gives every creator the software infrastructure of a professional media agency. When your pitch is presented professionally, brands treat you professionally. And most importantly, they pay you on time.
                            </p>
                        </div>
                        <div style={{ background: '#F4F4F5', padding: '3rem', borderRadius: '1.5rem', textAlign: 'center' }}>
                            <div style={{ fontSize: '4rem', fontWeight: 700, color: '#111', lineHeight: 1 }}>$12M+</div>
                            <div style={{ color: '#666', fontSize: '1.1rem', marginTop: '0.5rem' }}>Processed in creator payments</div>
                            <div style={{ height: '1px', background: '#e0e0e0', margin: '2rem 0' }}></div>
                            <div style={{ fontSize: '4rem', fontWeight: 700, color: '#111', lineHeight: 1 }}>14,000</div>
                            <div style={{ color: '#666', fontSize: '1.1rem', marginTop: '0.5rem' }}>Contracts e-signed seamlessly</div>
                        </div>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                        <h2 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '2rem' }}>Ready to take your business seriously?</h2>
                        <Link href="/login" className="btn btn-lime btn-lg">Join DealBird Today</Link>
                    </div>
                </div>
            </section>
        </SiteLayout>
    );
}
