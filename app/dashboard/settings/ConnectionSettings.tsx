"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

interface EmailAccountInfo {
  id: string;
  provider: string;
  email: string;
  isDefault: boolean;
  dailySendLimit: number;
  sentToday: number;
}

export function ConnectionSettings() {
  const [accounts, setAccounts] = useState<EmailAccountInfo[]>([]);
  const [loading, setLoading] = useState("");
  const [showSmtp, setShowSmtp] = useState(false);
  const [smtp, setSmtp] = useState({ email: "", smtpHost: "", smtpPort: "587", smtpUser: "", smtpPass: "" });
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    fetchAccounts();
  }, []);

  useEffect(() => {
    const gmail = searchParams.get("gmail");
    if (gmail === "success") {
      fetchAccounts();
      router.replace("/dashboard/settings");
    } else if (gmail === "error") {
      alert("Gmail connection failed. Please try again.");
      router.replace("/dashboard/settings");
    }
  }, [searchParams]);

  const fetchAccounts = async () => {
    try {
      const res = await fetch("/api/email-accounts");
      const data = await res.json();
      setAccounts(data);
    } catch {
      setAccounts([]);
    }
  };

  const connectGmail = async () => {
    setLoading("gmail");
    try {
      const res = await fetch("/api/auth/gmail", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Failed to start Gmail connection.");
      }
    } catch {
      alert("Network error.");
    } finally {
      setLoading("");
    }
  };

  const addSmtp = async () => {
    setLoading("smtp");
    try {
      const res = await fetch("/api/email-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(smtp),
      });
      if (res.ok) {
        setShowSmtp(false);
        setSmtp({ email: "", smtpHost: "", smtpPort: "587", smtpUser: "", smtpPass: "" });
        fetchAccounts();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to add SMTP account.");
      }
    } finally {
      setLoading("");
    }
  };

  const removeAccount = async (id: string) => {
    if (!confirm("Remove this email account?")) return;
    await fetch(`/api/email-accounts?id=${id}`, { method: "DELETE" });
    fetchAccounts();
  };

  return (
    <div className="bg-white rounded-2xl border border-black/[0.07] p-6">
      <h3 className="font-bold mb-1">Connections</h3>
      <p className="text-sm text-gray-400 mb-6">
        Connect email accounts and domains for outreach campaigns.
      </p>

      <div className="flex flex-col gap-4">
        {/* ── Connected Accounts ── */}
        {accounts.map((account) => (
          <div key={account.id} className="p-4 border border-black/[0.07] rounded-xl">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                account.provider === "gmail" ? "bg-red-50" : "bg-blue-50"
              }`}>
                {account.provider === "gmail" ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M22 6l-10 7L2 6V4l10 7 10-7v2z" fill="#EA4335"/>
                    <rect x="2" y="4" width="20" height="16" rx="2" stroke="#EA4335" strokeWidth="1.5" fill="none"/>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#3B82F6">
                    <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                  </svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm flex items-center gap-2">
                  {account.email}
                  {account.isDefault && (
                    <span className="text-[10px] font-bold bg-[#C8FF00] text-black px-1.5 py-0.5 rounded">DEFAULT</span>
                  )}
                </div>
                <div className="text-xs text-gray-400">
                  {account.provider === "gmail" ? "Gmail" : "Custom SMTP"} &middot;{" "}
                  {account.sentToday}/{account.dailySendLimit} sent today
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full">Connected</span>
                <button
                  onClick={() => removeAccount(account.id)}
                  className="px-2 py-1 text-xs font-bold text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>

            {/* Send limit bar */}
            <div className="mt-3">
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#C8FF00] rounded-full transition-all"
                  style={{ width: `${Math.min((account.sentToday / account.dailySendLimit) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        ))}

        {/* ── Add Buttons ── */}
        <div className="flex gap-2">
          <button
            onClick={connectGmail}
            disabled={!!loading}
            className="flex-1 py-2.5 bg-white border-2 border-gray-200 font-bold text-sm rounded-xl hover:border-black transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M22 6l-10 7L2 6V4l10 7 10-7v2z" fill="#EA4335"/>
              <rect x="2" y="4" width="20" height="16" rx="2" stroke="#EA4335" strokeWidth="1.5" fill="none"/>
            </svg>
            {loading === "gmail" ? "Connecting..." : "+ Connect Gmail"}
          </button>
          <button
            onClick={() => setShowSmtp(!showSmtp)}
            className="flex-1 py-2.5 bg-white border-2 border-gray-200 font-bold text-sm rounded-xl hover:border-black transition-all flex items-center justify-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#3B82F6">
              <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
            </svg>
            + Custom SMTP
          </button>
        </div>

        {/* ── SMTP Form ── */}
        {showSmtp && (
          <div className="p-4 border border-blue-200 rounded-xl bg-blue-50/30 space-y-3">
            <div className="text-sm font-bold">Add Custom SMTP</div>
            <input
              type="email"
              placeholder="you@yourdomain.com"
              value={smtp.email}
              onChange={(e) => setSmtp({ ...smtp, email: e.target.value })}
              className="w-full px-3 py-2 border border-black/[0.08] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="SMTP Host"
                value={smtp.smtpHost}
                onChange={(e) => setSmtp({ ...smtp, smtpHost: e.target.value })}
                className="px-3 py-2 border border-black/[0.08] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
              />
              <input
                type="number"
                placeholder="Port (587)"
                value={smtp.smtpPort}
                onChange={(e) => setSmtp({ ...smtp, smtpPort: e.target.value })}
                className="px-3 py-2 border border-black/[0.08] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
              />
            </div>
            <input
              type="text"
              placeholder="SMTP Username"
              value={smtp.smtpUser}
              onChange={(e) => setSmtp({ ...smtp, smtpUser: e.target.value })}
              className="w-full px-3 py-2 border border-black/[0.08] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
            />
            <input
              type="password"
              placeholder="SMTP Password"
              value={smtp.smtpPass}
              onChange={(e) => setSmtp({ ...smtp, smtpPass: e.target.value })}
              className="w-full px-3 py-2 border border-black/[0.08] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
            />
            <div className="flex gap-2">
              <button
                onClick={addSmtp}
                disabled={!!loading}
                className="px-4 py-2 bg-black text-white font-bold text-sm rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {loading === "smtp" ? "Adding..." : "Add Account"}
              </button>
              <button
                onClick={() => setShowSmtp(false)}
                className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-black transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* ── LinkedIn (Coming Soon) ── */}
        <div className="p-4 border border-black/[0.07] rounded-xl opacity-60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#0A66C2]/10 rounded-lg flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#0A66C2">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </div>
            <div className="flex-1">
              <div className="font-bold text-sm">LinkedIn</div>
              <div className="text-xs text-gray-400">Connect via Chrome extension &middot; 12 requests/day</div>
            </div>
            <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">Coming Soon</span>
          </div>
        </div>

        <p className="text-xs text-gray-400 text-center">
          Each mailbox can send up to 25 emails/day. Connect multiple accounts to increase daily volume.
        </p>
      </div>
    </div>
  );
}
