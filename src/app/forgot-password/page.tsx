"use client";

import { useState } from "react";
import Link from "next/link";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email);
      setSent(true);
    } catch {
      setError("Could not send reset email. Please check the address and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <h1 className="font-heading text-4xl font-bold text-[#080808] mb-2">Reset Password</h1>
        <p className="font-body text-[#777777] text-sm mb-8">
          Enter your email and we&apos;ll send you a reset link.
        </p>

        {sent ? (
          <div className="bg-white border border-[#E9E7E2] p-6 text-center">
            <p className="font-body text-[#080808] mb-4">
              Reset link sent to <strong>{email}</strong>. Check your inbox.
            </p>
            <Link href="/login" className="text-sm font-body underline text-[#789185]">
              Back to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-body uppercase tracking-wider text-[#777777] mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border border-[#E9E7E2] bg-white px-4 py-3 text-sm font-body focus:outline-none focus:border-[#789185]"
                placeholder="your@email.com"
              />
            </div>
            {error && (
              <div className="bg-[#FFF0F0] border border-[#F12F43] text-[#F12F43] text-sm font-body p-3">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="bg-[#080808] text-white font-body text-xs font-bold uppercase tracking-widest px-6 py-4 hover:bg-[#789185] transition-colors disabled:opacity-60"
            >
              {loading ? "Sending…" : "Send Reset Link"}
            </button>
            <Link href="/login" className="text-center text-sm font-body text-[#777777] hover:text-[#080808]">
              Back to Sign In
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
