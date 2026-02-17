"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [devLoading, setDevLoading] = useState(false);

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await signIn("email", { email, redirect: false });
    setSent(true);
    setLoading(false);
  };

  const handleDevLogin = async () => {
    setDevLoading(true);
    await signIn("dev-login", {
      email: "admin@dealbird.dev",
      callbackUrl: "/dashboard",
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-[#FAFAFA]">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 font-extrabold text-xl justify-center mb-10">
          <img src="/logo.png" alt="DealBird" className="w-9 h-9 rounded-lg -rotate-[5deg]" />
          DealBird
        </Link>

        <div className="bg-white rounded-2xl border border-black/5 p-8 shadow-sm">
          <h1 className="text-xl font-extrabold tracking-tight text-center mb-1">Welcome back</h1>
          <p className="text-sm text-gray-400 text-center mb-8">Sign in to manage your proposals and invoices</p>

          {/* Google */}
          <button
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            className="w-full flex items-center justify-center gap-3 bg-black text-white font-bold py-3 rounded-xl hover:bg-gray-800 transition-all mb-4"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400 font-medium">or</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {/* Email */}
          {!sent ? (
            <form onSubmit={handleEmail}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm mb-3"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#C8FF00] text-black font-bold py-3 rounded-xl hover:bg-[#9FCC00] transition-all disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send Magic Link"}
              </button>
            </form>
          ) : (
            <div className="text-center py-4">
              <div className="text-2xl mb-2">✉️</div>
              <p className="font-bold mb-1">Check your email</p>
              <p className="text-sm text-gray-400">
                We sent a sign-in link to <strong>{email}</strong>
              </p>
            </div>
          )}
        </div>

        {/* Dev Login — only shows in development */}
        {process.env.NODE_ENV !== "production" && (
          <button
            onClick={handleDevLogin}
            disabled={devLoading}
            className="w-full mt-4 bg-purple-600 text-white font-bold py-3 rounded-xl hover:bg-purple-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {devLoading ? "Logging in..." : "🔧 Dev Login as Admin"}
          </button>
        )}

        <p className="text-center text-xs text-gray-400 mt-6">
          By signing in, you agree to our{" "}
          <a href="#" className="underline">Terms</a> and{" "}
          <a href="#" className="underline">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
}

