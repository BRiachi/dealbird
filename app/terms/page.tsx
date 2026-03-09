import SiteLayout from "@/components/SiteLayout";

export default function TermsPage() {
    const sectionTitle = { fontSize: '1.5rem', fontWeight: 600, color: '#111', marginTop: '1.5rem', marginBottom: '0.5rem' } as const;

    return (
        <SiteLayout>
            <section className="sec pt-20">
                <div className="wrap" style={{ maxWidth: '800px' }}>
                    <h1 className="h2" style={{ marginTop: '0.5rem', textAlign: 'left', marginBottom: '1rem' }}>
                        Terms of Service
                    </h1>
                    <p style={{ color: '#666', marginBottom: '3rem' }}>Last updated: March 9, 2026</p>

                    <div style={{ color: '#444', lineHeight: 1.7, fontSize: '1.05rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <p>Please read these Terms of Service carefully before using DealBird operated by DealBird Inc.</p>

                        <h2 style={sectionTitle}>1. Acceptance of Terms</h2>
                        <p>By registering for and/or using the Service in any manner, including but not limited to visiting or browsing the Site, you agree to these Terms of Service.</p>

                        <h2 style={sectionTitle}>2. Description of Service</h2>
                        <p>DealBird provides software for creators to create proposals, capture electronic signatures, process invoices, manage storefronts, and run outreach campaigns to brands. DealBird is a software provider, not a legal firm, and does not provide legal advice. Our proposal templates should not be construed as legal counsel.</p>

                        <h2 style={sectionTitle}>3. E-Signatures</h2>
                        <p>E-signatures captured via DealBird are legally binding under the U.S. Electronic Signatures in Global and National Commerce Act (ESIGN) and the Uniform Electronic Transactions Act (UETA). By using the service, you consent to doing business electronically.</p>

                        <h2 style={sectionTitle}>4. Gmail Integration & Outreach</h2>
                        <p>DealBird allows you to connect your Gmail account to send outreach emails to brands on your behalf. By connecting your Gmail account, you:</p>
                        <ul style={{ paddingLeft: '1.5rem', listStyleType: 'disc' }}>
                            <li>Authorize DealBird to send emails from your connected Gmail address as part of campaigns you create</li>
                            <li>Authorize DealBird to read email thread metadata (sender address only) to detect replies to your outreach</li>
                            <li>Acknowledge that you are solely responsible for the content of outreach emails you send</li>
                            <li>Agree to comply with applicable anti-spam laws (CAN-SPAM, GDPR) when using the outreach feature</li>
                        </ul>
                        <p>You may disconnect your Gmail account at any time from the Settings page, which will revoke DealBird&apos;s access to your Gmail.</p>

                        <h2 style={sectionTitle}>5. Acceptable Use of Outreach</h2>
                        <p>You agree to use the outreach feature only for legitimate business communication with brands. You may not use DealBird to:</p>
                        <ul style={{ paddingLeft: '1.5rem', listStyleType: 'disc' }}>
                            <li>Send unsolicited bulk email or spam</li>
                            <li>Send emails containing malware, phishing links, or deceptive content</li>
                            <li>Harass, threaten, or abuse recipients</li>
                            <li>Violate any applicable laws or regulations</li>
                        </ul>
                        <p>We reserve the right to suspend outreach features for accounts that violate these terms.</p>

                        <h2 style={sectionTitle}>6. Payments and Subscriptions</h2>
                        <p>Paid subscriptions (Pro, Agency) are billed in advance on a monthly or annual cycle. Subscriptions will automatically renew unless canceled before the renewal date. All fees are non-refundable, except as required by law or as explicitly stated in our 14-day money-back guarantee.</p>

                        <h2 style={sectionTitle}>7. User Conduct</h2>
                        <p>You agree not to use DealBird for any unlawful purpose. You may not use DealBird to process payments for restricted businesses as outlined by our payment provider, Stripe.</p>

                        <h2 style={sectionTitle}>8. Limitation of Liability</h2>
                        <p>DealBird shall not be liable for any emails sent through your connected Gmail account, including any consequences arising from outreach campaigns. You are solely responsible for ensuring your outreach complies with applicable laws and regulations.</p>

                        <h2 style={sectionTitle}>9. Termination</h2>
                        <p>We may terminate or suspend your account at any time for violation of these Terms. Upon termination, your right to use the Service will immediately cease. You may cancel your account at any time.</p>

                        <p style={{ marginTop: '2rem' }}>For legal inquiries, contact legal@dealbird.ai.</p>
                    </div>
                </div>
            </section>
        </SiteLayout>
    );
}
