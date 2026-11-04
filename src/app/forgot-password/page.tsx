"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { CheckCircle, ArrowLeft, ArrowRight, Mail } from "lucide-react";

const inputBase = "w-full bg-[#F7F5F2] border border-[#E2DDD8] px-4 py-3 text-[14px] font-body text-[#111] placeholder:text-[#C4BFB9] focus:outline-none focus:border-[#203A2B] focus:bg-white focus:ring-2 focus:ring-[#203A2B]/8 transition-all rounded-lg";

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
    <div className="min-h-screen flex bg-[#FAF9F6]">

      {/* ── Left panel ─────────────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[44%] xl:w-[42%] bg-[#0D1F17] flex-col relative overflow-hidden">
        <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(ellipse at 25% 75%, rgba(120,145,133,0.18) 0%, transparent 55%), radial-gradient(ellipse at 80% 20%, rgba(255,201,40,0.10) 0%, transparent 50%)" }} />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "48px 48px" }} />

        <div className="relative z-10 flex flex-col h-full px-12 py-10">
          <Link href="/" className="shrink-0">
            <Image src="/Horizontal_Logo.png" alt="AR Books" width={160} height={44} className="brightness-0 invert opacity-90" priority />
          </Link>

          <div className="flex-1 flex flex-col justify-center gap-8">
            {/* Icon */}
            <div className="w-16 h-16 bg-[#FFC928]/10 border border-[#FFC928]/20 rounded-2xl flex items-center justify-center">
              <Mail size={28} className="text-[#FFC928]" strokeWidth={1.5} />
            </div>

            <div>
              <h2 className="font-heading text-3xl font-bold text-white leading-snug">
                Forgot your<br />password?
              </h2>
              <p className="font-body text-[#7A9A8A] text-sm leading-relaxed mt-3 max-w-[260px]">
                No worries — it happens to everyone. Enter your email and we&apos;ll send you a reset link right away.
              </p>
            </div>

            {/* Steps */}
            <div className="flex flex-col gap-4">
              {[
                { step: "1", text: "Enter your email address" },
                { step: "2", text: "Check your inbox for the link" },
                { step: "3", text: "Set a new password" },
              ].map(({ step, text }) => (
                <div key={step} className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-white/[0.07] border border-white/[0.10] flex items-center justify-center text-[11px] font-bold text-white/40 shrink-0">{step}</span>
                  <span className="font-body text-[13px] text-white/50">{text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-white/[0.07] pt-6">
            <p className="font-body text-[13px] text-white/30 italic leading-relaxed">
              &ldquo;The secret of getting ahead is getting started.&rdquo;
            </p>
            <p className="font-body text-[11px] text-white/20 mt-1.5 tracking-wide">— Mark Twain</p>
          </div>
        </div>
      </div>

      {/* ── Right panel ────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 overflow-y-auto">
        <div className="w-full max-w-[400px]">

          {/* Mobile logo */}
          <div className="flex justify-center mb-10 lg:hidden">
            <Link href="/"><Image src="/Horizontal_Logo.png" alt="AR Books" width={160} height={44} priority /></Link>
          </div>

          {sent ? (
            /* ── Success state ── */
            <div className="flex flex-col items-center text-center gap-6">
              <div className="w-20 h-20 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                <CheckCircle size={36} className="text-emerald-500" strokeWidth={1.5} />
              </div>
              <div>
                <h1 className="font-heading text-[26px] font-bold text-[#0D1F17]">Check your inbox</h1>
                <p className="font-body text-[14px] text-[#888] mt-2 leading-relaxed">
                  We sent a password reset link to<br />
                  <span className="font-semibold text-[#111]">{email}</span>
                </p>
                <p className="font-body text-[12px] text-[#bbb] mt-2">Didn&apos;t receive it? Check your spam folder.</p>
              </div>
              <div className="flex flex-col gap-3 w-full">
                <Link
                  href="/login"
                  className="w-full bg-[#0D1F17] text-white font-body text-[13px] font-bold uppercase tracking-[0.1em] py-3.5 rounded-xl hover:bg-[#203A2B] transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowLeft size={14} /> Back to Sign In
                </Link>
                <button
                  onClick={() => { setSent(false); setEmail(""); }}
                  className="w-full bg-transparent text-[#888] font-body text-[13px] py-2 hover:text-[#111] transition-colors"
                >
                  Try a different email
                </button>
              </div>
            </div>
          ) : (
            /* ── Form state ── */
            <>
              <div className="mb-8">
                <h1 className="font-heading text-[28px] font-bold text-[#0D1F17] leading-tight">Reset password</h1>
                <p className="font-body text-[14px] text-[#888] mt-1.5">Enter your email and we&apos;ll send you a reset link</p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="reset-email" className="text-[11px] font-body font-semibold uppercase tracking-[0.1em] text-[#6B6B6B]">
                    Email Address
                  </label>
                  <input
                    id="reset-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                    className={inputBase}
                  />
                </div>

                {error && (
                  <div className="bg-[#FFF0F0] border border-[#E53935]/20 text-[#E53935] text-[12px] font-body px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#0D1F17] text-white font-body text-[13px] font-bold uppercase tracking-[0.1em] py-3.5 rounded-xl hover:bg-[#203A2B] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-1"
                >
                  {loading ? "Sending…" : <><span>Send Reset Link</span><ArrowRight size={14} /></>}
                </button>
              </form>

              <p className="text-center text-[13px] font-body text-[#999] mt-6">
                Remember your password?{" "}
                <Link href="/login" className="text-[#203A2B] font-semibold hover:text-[#789185] transition-colors">Sign in</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
