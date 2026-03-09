import SiteLayout from "@/components/SiteLayout";

export default function PrivacyPage() {
    const sectionTitle = { fontSize: '1.5rem', fontWeight: 600, color: '#111', marginTop: '1.5rem', marginBottom: '0.5rem' } as const;

    return (
        <SiteLayout>
            <section className="sec pt-20">
                <div className="wrap" style={{ maxWidth: '800px' }}>
                    <h1 className="h2" style={{ marginTop: '0.5rem', textAlign: 'left', marginBottom: '1rem' }}>
                        Privacy Policy
                    </h1>
                    <p style={{ color: '#666', marginBottom: '3rem' }}>Last updated: March 9, 2026</p>

                    <div style={{ color: '#444', lineHeight: 1.7, fontSize: '1.05rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <p>At DealBird, we take your privacy seriously. We want you to feel confident that your data, and the data of the brands you work with, is safe.</p>

                        <h2 style={sectionTitle}>1. Information We Collect</h2>
                        <p><strong>Account Information:</strong> When you create an account via Google sign-in, we collect your name, email address, and profile picture.</p>
                        <p><strong>Financial Information:</strong> For processing payments through Stripe, we collect your bank details securely. We do not store full credit card numbers.</p>
                        <p><strong>Proposal Data:</strong> We store the content of your proposals, including deliverables, pricing, and the names/emails of brand contacts you share pitches with.</p>

                        <h2 style={sectionTitle}>2. Gmail Integration & Google User Data</h2>
                        <p>DealBird offers an optional Gmail integration for outreach campaigns. When you choose to connect your Gmail account, we request the following permissions:</p>
                        <ul style={{ paddingLeft: '1.5rem', listStyleType: 'disc' }}>
                            <li><strong>Send emails on your behalf</strong> (gmail.send) — Used exclusively to send outreach emails that you create and approve through DealBird campaigns.</li>
                            <li><strong>Read email metadata</strong> (gmail.readonly) — Used solely to detect replies to outreach emails you sent through DealBird. We only check the &ldquo;From&rdquo; header of messages within Gmail threads initiated by DealBird. We do not read, scan, index, or store the content of your personal emails.</li>
                            <li><strong>View your email address</strong> (userinfo.email) — Used to identify which Gmail account is being connected.</li>
                        </ul>
                        <p><strong>What we store:</strong> We store your Gmail OAuth access token and refresh token (encrypted) to send emails and check for replies on your behalf. We also store the Gmail thread ID and message ID of emails sent through DealBird for reply tracking purposes.</p>
                        <p><strong>What we do NOT do with your Gmail data:</strong></p>
                        <ul style={{ paddingLeft: '1.5rem', listStyleType: 'disc' }}>
                            <li>We do not read, scan, or store the content of your personal emails</li>
                            <li>We do not use Gmail data for advertising purposes</li>
                            <li>We do not use Gmail data to train machine learning or AI models</li>
                            <li>We do not sell, rent, or share your Gmail data with third parties</li>
                            <li>We do not use Gmail data for any purpose other than sending your outreach emails and detecting replies</li>
                        </ul>
                        <p><strong>Disconnecting Gmail:</strong> You can disconnect your Gmail account at any time from the Settings page. When disconnected, we delete your stored OAuth tokens. Previously sent email records (subject, recipient, status) are retained as part of your campaign history.</p>

                        <h2 style={sectionTitle}>3. How We Use Your Information</h2>
                        <p>We use the data we collect solely to provide the DealBird service to you. This includes generating documents, sending email reminders to brands, sending outreach emails via your connected Gmail, detecting replies to outreach, processing payments, and providing customer support.</p>
                        <p>We do not, and will never, sell your client list or pricing data to third parties. Your deals are your business.</p>

                        <h2 style={sectionTitle}>4. Data Tracking & Analytics</h2>
                        <p>We track user behavior within DealBird to improve our product. As a feature, we track IP addresses and timestamps when brands open your proposals or outreach emails to provide you with read receipts and analytics.</p>

                        <h2 style={sectionTitle}>5. Data Sharing</h2>
                        <p>We do not sell your personal information. We share data only with the following service providers as necessary to operate DealBird:</p>
                        <ul style={{ paddingLeft: '1.5rem', listStyleType: 'disc' }}>
                            <li><strong>Stripe</strong> — payment processing</li>
                            <li><strong>Google</strong> — authentication and Gmail integration (using your authorized OAuth tokens)</li>
                            <li><strong>Resend</strong> — transactional email delivery (invoice reminders, proposal notifications)</li>
                            <li><strong>Vercel</strong> — application hosting</li>
                            <li><strong>Neon</strong> — database hosting</li>
                        </ul>

                        <h2 style={sectionTitle}>6. Security</h2>
                        <p>We implement industry-standard security measures including HTTPS encryption, secure OAuth token storage, HMAC-signed authentication parameters, and timing-safe comparisons to protect your personal information and documents.</p>

                        <h2 style={sectionTitle}>7. Data Retention</h2>
                        <p>Your account data is retained as long as your account is active. Gmail OAuth tokens are stored until you disconnect your Gmail account. Upon account deletion, all associated data is permanently removed within 30 days.</p>

                        <h2 style={sectionTitle}>8. Google API Services User Data Policy</h2>
                        <p>DealBird&apos;s use and transfer of information received from Google APIs adheres to the{" "}
                            <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer" style={{ color: '#2563EB', textDecoration: 'underline' }}>
                                Google API Services User Data Policy
                            </a>
                            , including the Limited Use requirements. Specifically:
                        </p>
                        <ul style={{ paddingLeft: '1.5rem', listStyleType: 'disc' }}>
                            <li>We only use Gmail data to provide and improve user-facing features that are visible and apparent to you.</li>
                            <li>We do not transfer Gmail data to third parties except as necessary to provide the service, comply with applicable laws, or as part of a merger/acquisition with prior notice to users.</li>
                            <li>We do not use Gmail data for serving advertisements.</li>
                            <li>We do not allow humans to read your Gmail data unless you provide affirmative consent, it is necessary for security purposes, to comply with applicable law, or the data is aggregated and anonymized for internal operations.</li>
                        </ul>

                        <h2 style={sectionTitle}>9. Your Rights</h2>
                        <p>You have the right to:</p>
                        <ul style={{ paddingLeft: '1.5rem', listStyleType: 'disc' }}>
                            <li>Access your personal data</li>
                            <li>Correct inaccurate data</li>
                            <li>Delete your account and all associated data</li>
                            <li>Disconnect Gmail and revoke access at any time</li>
                            <li>Export your data</li>
                        </ul>

                        <h2 style={sectionTitle}>10. Children&apos;s Privacy</h2>
                        <p>DealBird is not intended for use by individuals under 18 years of age. We do not knowingly collect personal information from children.</p>

                        <h2 style={sectionTitle}>11. Changes to This Policy</h2>
                        <p>We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the &ldquo;Last updated&rdquo; date.</p>

                        <p style={{ marginTop: '2rem' }}>If you have any questions about this Privacy Policy, please contact us at privacy@dealbird.ai.</p>
                    </div>
                </div>
            </section>
        </SiteLayout>
    );
}
