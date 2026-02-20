import SiteLayout from "@/components/SiteLayout";

export default function PrivacyPage() {
    return (
        <SiteLayout>
            <section className="sec pt-20">
                <div className="wrap" style={{ maxWidth: '800px' }}>
                    <h1 className="h2" style={{ marginTop: '0.5rem', textAlign: 'left', marginBottom: '1rem' }}>
                        Privacy Policy
                    </h1>
                    <p style={{ color: '#666', marginBottom: '3rem' }}>Last updated: February 20, 2026</p>

                    <div style={{ color: '#444', lineHeight: 1.7, fontSize: '1.05rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <p>At DealBird, we take your privacy seriously. We want you to feel confident that your data, and the data of the brands you work with, is safe.</p>

                        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#111', marginTop: '1.5rem', marginBottom: '0.5rem' }}>1. Information We Collect</h2>
                        <p><strong>Account Information:</strong> When you create an account, we collect your name, email address, password, and social media handles.</p>
                        <p><strong>Financial Information:</strong> For processing payments through Stripe, we collect your bank details securely. We do not store full credit card numbers.</p>
                        <p><strong>Proposal Data:</strong> We store the content of your proposals, including deliverables, pricing, and the names/emails of brand contacts you share pitches with.</p>

                        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#111', marginTop: '1.5rem', marginBottom: '0.5rem' }}>2. How We Use Your Information</h2>
                        <p>We use the data we collect solely to provide the DealBird service to you. This includes generating documents, sending email reminders to brands, processing payments, and providing customer support.</p>
                        <p>We do not, and will never, sell your client list or pricing data to third parties. Your deals are your business.</p>

                        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#111', marginTop: '1.5rem', marginBottom: '0.5rem' }}>3. Data Tracking & Analytics</h2>
                        <p>We track user behavior within DealBird to improve our product. Also, as a feature of the Pro plan, we track IP addresses and timestamps when brands open your proposals to provide you with read receipts and analytics. Brands are notified of this tracking when viewing a document.</p>

                        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#111', marginTop: '1.5rem', marginBottom: '0.5rem' }}>4. Security</h2>
                        <p>We implement industry-standard security measures (including SSL encryption) to protect your personal information and documents.</p>

                        <p style={{ marginTop: '2rem' }}>If you have any questions about this Privacy Policy, please contact us at privacy@dealbird.ai.</p>
                    </div>
                </div>
            </section>
        </SiteLayout>
    );
}
