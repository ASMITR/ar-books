"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { CheckCircle, ArrowLeft } from "lucide-react";

const inputCls = "w-full border border-[#E9E7E2] bg-[#FAF9F6] px-4 py-3 text-sm font-body focus:outline-none focus:border-[#789185] focus:ring-2 focus:ring-[#789185]/10 transition-colors rounded-sm";

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
    <div className="min-h-screen flex">
      {/* Left panel — brand */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-1/2 bg-[#080808] flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(circle at 30% 70%, #789185 0%, transparent 60%), radial-gradient(circle at 80% 20%, #FFC928 0%, transparent 50%)" }} />
        <div className="relative z-10 flex flex-col items-center gap-8 text-center">
          <Link href="/">
            <Image src="/Horizontal_Logo.png" alt="AR Books" width={220} height={60} className="brightness-0 invert" priority />
          </Link>
          <div className="w-12 h-px bg-[#789185]" />
          <p className="font-body text-[#aaa] text-sm leading-relaxed max-w-xs">
            No worries — it happens to everyone. We&apos;ll get you back into your account in no time.
          </p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 bg-[#FAF9F6] flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="flex flex-col items-center mb-8 lg:hidden">
            <Link href="/">
              <Image src="/Horizontal_Logo.png" alt="AR Books" width={180} height={48} priority />
            </Link>
          </div>

          {!sent && (
            <div className="mb-7">
              <h1 className="font-heading text-2xl font-bold text-[#080808]">Reset your password</h1>
              <p className="font-body text-sm text-[#777777] mt-1">Enter your email and we&apos;ll send you a reset link</p>
            </div>
          )}

          <div className="bg-white border border-[#E9E7E2] p-7 sm:p-8 rounded-sm shadow-sm">
            {sent ? (
              <div className="flex flex-col items-center text-center gap-5 py-4">
                <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                  <CheckCircle size={30} className="text-emerald-500" />
                </div>
                <div>
                  <h2 className="font-heading text-xl font-bold text-[#080808] mb-2">Check your inbox</h2>
                  <p className="font-body text-sm text-[#777777]">
                    We sent a reset link to{" "}
                    <span className="font-medium text-[#080808]">{email}</span>
                  </p>
                  <p className="font-body text-xs text-[#aaa] mt-2">Didn&apos;t receive it? Check your spam folder.</p>
                </div>
                <Link href="/login" className="inline-flex items-center gap-2 bg-[#080808] text-white font-body text-xs font-bold uppercase tracking-widest px-6 py-3 hover:bg-[#789185] transition-colors rounded-sm mt-1">
                  <ArrowLeft size={14} /> Back to Sign In
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-body uppercase tracking-wider text-[#777777] mb-1.5">Email Address</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="your@email.com" className={inputCls} />
                </div>

                {error && <div className="bg-[#FFF0F0] border border-[#F12F43]/30 text-[#F12F43] text-xs font-body p-3 rounded-sm">{error}</div>}

                <button type="submit" disabled={loading} className="w-full bg-[#080808] text-white font-body text-xs font-bold uppercase tracking-widest py-3.5 hover:bg-[#789185] transition-colors disabled:opacity-60 mt-1 rounded-sm">
                  {loading ? "Sending…" : "Send Reset Link"}
                </button>
              </form>
            )}
          </div>

          <p className="text-center text-sm font-body text-[#777777] mt-5">
            Remember your password?{" "}
            <Link href="/login" className="text-[#080808] font-semibold hover:text-[#789185] transition-colors">Sign in</Link>
          </p>

        </div>
      </div>
    </div>
  );
}
