import SiteLayout from "@/components/SiteLayout";

export default function TermsPage() {
    return (
        <SiteLayout>
            <section className="sec pt-20">
                <div className="wrap" style={{ maxWidth: '800px' }}>
                    <h1 className="h2" style={{ marginTop: '0.5rem', textAlign: 'left', marginBottom: '1rem' }}>
                        Terms of Service
                    </h1>
                    <p style={{ color: '#666', marginBottom: '3rem' }}>Last updated: February 20, 2026</p>

                    <div style={{ color: '#444', lineHeight: 1.7, fontSize: '1.05rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <p>Please read these Terms of Service carefully before using DealBird operated by DealBird Inc.</p>

                        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#111', marginTop: '1.5rem', marginBottom: '0.5rem' }}>1. Acceptance of Terms</h2>
                        <p>By registering for and/or using the Service in any manner, including but not limited to visiting or browsing the Site, you agree to these Terms of Service.</p>

                        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#111', marginTop: '1.5rem', marginBottom: '0.5rem' }}>2. Description of Service</h2>
                        <p>DealBird provides software for creators to create proposals, capture electronic signatures, and process invoices. DealBird is a software provider, not a legal firm, and does not provide legal advice. Our proposal templates should not be construed as legal counsel.</p>

                        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#111', marginTop: '1.5rem', marginBottom: '0.5rem' }}>3. E-Signatures</h2>
                        <p>E-signatures captured via DealBird are legally binding under the U.S. Electronic Signatures in Global and National Commerce Act (ESIGN) and the Uniform Electronic Transactions Act (UETA). By using the service, you consent to doing business electronically.</p>

                        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#111', marginTop: '1.5rem', marginBottom: '0.5rem' }}>4. Payments and Subscriptions</h2>
                        <p>Paid subscriptions (Pro, Agency) are billed in advance on a monthly or annual cycle. Subscriptions will automatically renew unless canceled before the renewal date. All fees are non-refundable, except as required by law or as explicitly stated in our 14-day money-back guarantee.</p>

                        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#111', marginTop: '1.5rem', marginBottom: '0.5rem' }}>5. User Conduct</h2>
                        <p>You agree not to use DealBird for any unlawful purpose. You may not use DealBird to process payments for restricted businesses as outlined by our payment provider, Stripe.</p>

                        <p style={{ marginTop: '2rem' }}>For legal inquiries, contact legal@dealbird.ai.</p>
                    </div>
                </div>
            </section>
        </SiteLayout>
    );
}
