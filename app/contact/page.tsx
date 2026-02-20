import SiteLayout from "@/components/SiteLayout";

export default function ContactPage() {
    return (
        <SiteLayout>
            <section className="sec pt-20">
                <div className="wrap">
                    <div className="tag">Contact</div>
                    <h1 className="h2" style={{ marginTop: '0.5rem', textAlign: 'center' }}>
                        Get in touch
                    </h1>
                    <p className="sub" style={{ marginBottom: '4rem', textAlign: 'center' }}>
                        Have a question about the product, pricing, or an enterprise plan? Drop us a note.
                    </p>

                    <div style={{ maxWidth: '600px', margin: '0 auto', background: '#fff', padding: '3rem', borderRadius: '1.5rem', border: '1px solid #eee', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
                        <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div style={{ display: 'flex', gap: '1.5rem' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem', color: '#111' }}>First Name</label>
                                    <input type="text" style={{ width: '100%', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #ddd', fontSize: '1rem', outline: 'none' }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem', color: '#111' }}>Last Name</label>
                                    <input type="text" style={{ width: '100%', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #ddd', fontSize: '1rem', outline: 'none' }} />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem', color: '#111' }}>Email Address</label>
                                <input type="email" style={{ width: '100%', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #ddd', fontSize: '1rem', outline: 'none' }} />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem', color: '#111' }}>How can we help?</label>
                                <select style={{ width: '100%', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #ddd', fontSize: '1rem', outline: 'none', background: 'white' }}>
                                    <option>General Support Question</option>
                                    <option>Sales & Agency Plans</option>
                                    <option>Billing Issue</option>
                                    <option>Feature Request</option>
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem', color: '#111' }}>Message</label>
                                <textarea rows={5} style={{ width: '100%', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #ddd', fontSize: '1rem', outline: 'none', resize: 'vertical' }}></textarea>
                            </div>

                            <button type="button" className="btn btn-dark btn-lg" style={{ width: '100%', justifyContent: 'center' }}>Send Message</button>
                        </form>
                    </div>
                </div>
            </section>
        </SiteLayout>
    );
}
