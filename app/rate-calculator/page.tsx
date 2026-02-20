"use client";

import SiteLayout from "@/components/SiteLayout";
import { useState } from "react";

export default function RateCalculatorPage() {
    const [followers, setFollowers] = useState(50000);
    const [platform, setPlatform] = useState("tiktok");
    const [engagement, setEngagement] = useState(5);

    // simple mock calculation formula
    const baseRate = followers * (platform === 'youtube' ? 0.05 : platform === 'instagram' ? 0.02 : 0.01);
    const engagementMultiplier = 1 + (engagement / 10);
    const finalRate = baseRate * engagementMultiplier;

    return (
        <SiteLayout>
            <section className="sec pt-20">
                <div className="wrap">
                    <div className="tag">Rate Calculator</div>
                    <h1 className="h2" style={{ marginTop: '0.5rem' }}>
                        What should you charge?
                    </h1>
                    <p className="sub" style={{ marginBottom: '4rem' }}>
                        Use our baseline rate calculator to figure out your minimum starting price for a single dedicated post based on industry averages.
                    </p>

                    <div style={{ display: 'flex', gap: '4rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                        {/* Controls */}
                        <div style={{ flex: '1 1 400px', background: '#fff', padding: '2.5rem', borderRadius: '1.5rem', border: '1px solid #eee', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>

                            <div style={{ marginBottom: '2rem' }}>
                                <label style={{ display: 'block', fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>Platform</label>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    {['tiktok', 'instagram', 'youtube'].map(p => (
                                        <button
                                            key={p}
                                            onClick={() => setPlatform(p)}
                                            style={{
                                                flex: 1, padding: '0.75rem', borderRadius: '0.5rem', textTransform: 'capitalize', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                                                border: platform === p ? '2px solid #111' : '1px solid #ddd',
                                                background: platform === p ? '#111' : '#fff',
                                                color: platform === p ? '#fff' : '#666'
                                            }}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div style={{ marginBottom: '2rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                    <label style={{ fontSize: '1rem', fontWeight: 600 }}>Follower / Subscriber Count</label>
                                    <span style={{ fontWeight: 600, color: '#00C853' }}>{followers.toLocaleString()}</span>
                                </div>
                                <input
                                    type="range"
                                    min="1000"
                                    max="1000000"
                                    step="1000"
                                    value={followers}
                                    onChange={(e) => setFollowers(parseInt(e.target.value))}
                                    style={{ width: '100%', accentColor: '#111' }}
                                />
                            </div>

                            <div style={{ marginBottom: '2rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                    <label style={{ fontSize: '1rem', fontWeight: 600 }}>Average Engagement Rate (%)</label>
                                    <span style={{ fontWeight: 600, color: '#00C853' }}>{engagement}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0.5"
                                    max="20"
                                    step="0.1"
                                    value={engagement}
                                    onChange={(e) => setEngagement(parseFloat(e.target.value))}
                                    style={{ width: '100%', accentColor: '#111' }}
                                />
                            </div>
                        </div>

                        {/* Results */}
                        <div style={{ flex: '1 1 300px', background: '#111', color: 'white', padding: '3rem', borderRadius: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <div style={{ fontSize: '0.9rem', color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>Estimated Baseline Rate</div>
                            <div style={{ fontSize: '4rem', fontWeight: 700, lineHeight: 1, marginBottom: '2rem', color: '#D4FF00' }}>
                                ${Math.round(finalRate).toLocaleString()}
                            </div>
                            <p style={{ color: '#ccc', lineHeight: 1.6, fontSize: '0.9rem' }}>
                                This is a starting point. Always charge extra for:
                                <ul style={{ paddingLeft: '1.25rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                    <li>Usage rights (whitelisting/ads)</li>
                                    <li>Exclusivity clauses</li>
                                    <li>Fast turnaround times</li>
                                    <li>Link in bio real estate</li>
                                </ul>
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </SiteLayout>
    );
}
