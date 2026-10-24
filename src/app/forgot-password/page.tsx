"use client";

import { useState } from "react";
import Link from "next/link";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { CheckCircle } from "lucide-react";

const inputCls = "w-full border border-[#E9E7E2] bg-[#FAF9F6] px-4 py-3 text-sm font-body focus:outline-none focus:border-[#789185] focus:ring-2 focus:ring-[#789185]/10 transition-colors";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      await sendPasswordResetEmail(auth, email);
      setSent(true);
    } catch { setError("Could not send reset email. Please check the address and try again."); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Brand */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <p className="font-heading text-3xl font-bold text-[#080808] tracking-widest">AR BOOKS</p>
          </Link>
          <p className="font-body text-[#777777] text-sm mt-1">Reset your password</p>
        </div>

        {/* Card */}
        <div className="bg-white border border-[#E9E7E2] p-7 sm:p-9">
          {sent ? (
            <div className="flex flex-col items-center text-center gap-4 py-4">
              <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                <CheckCircle size={28} className="text-emerald-500" />
              </div>
              <div>
                <h2 className="font-heading text-xl font-bold text-[#080808] mb-2">Check your inbox</h2>
                <p className="font-body text-sm text-[#777777]">
                  We sent a reset link to <span className="font-medium text-[#080808]">{email}</span>
                </p>
              </div>
              <Link href="/login" className="mt-2 inline-flex items-center gap-2 bg-[#080808] text-white font-body text-xs font-bold uppercase tracking-widest px-6 py-3 hover:bg-[#789185] transition-colors">
                Back to Sign In
              </Link>
            </div>
          ) : (
            <>
              <h1 className="font-heading text-2xl font-bold text-[#080808] mb-2">Reset Password</h1>
              <p className="font-body text-sm text-[#777777] mb-6">
                Enter your email and we&apos;ll send you a reset link.
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-body uppercase tracking-wider text-[#777777] mb-1.5">Email</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="your@email.com" className={inputCls} />
                </div>

                {error && <div className="bg-[#FFF0F0] border border-[#F12F43]/30 text-[#F12F43] text-xs font-body p-3">{error}</div>}

                <button type="submit" disabled={loading} className="w-full bg-[#080808] text-white font-body text-xs font-bold uppercase tracking-widest py-3.5 hover:bg-[#789185] transition-colors disabled:opacity-60 mt-1">
                  {loading ? "Sending…" : "Send Reset Link"}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-sm font-body text-[#777777] mt-5">
          Remember your password?{" "}
          <Link href="/login" className="text-[#080808] font-semibold hover:text-[#789185] transition-colors">Sign in</Link>
        </p>

      </div>
    </div>
  );
}
