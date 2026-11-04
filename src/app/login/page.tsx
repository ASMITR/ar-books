"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  getIdToken,
} from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { loginSchema, type LoginInput } from "@/lib/validations";
import { Eye, EyeOff, Lock, AlertTriangle, ArrowRight } from "lucide-react";

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
    <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
  </svg>
);

function useCountdown(targetMs: number | null) {
  const [remaining, setRemaining] = useState(0);
  useEffect(() => {
    if (!targetMs || targetMs <= 0) { setRemaining(0); return; }
    const calc = () => Math.max(0, targetMs - Date.now());
    setRemaining(calc());
    const id = setInterval(() => {
      const left = calc();
      setRemaining(left);
      if (left === 0) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [targetMs]);
  const h = Math.floor(remaining / 3_600_000);
  const m = Math.floor((remaining % 3_600_000) / 60_000);
  const s = Math.floor((remaining % 60_000) / 1_000);
  const formatted =
    remaining === 0 ? "" :
    h > 0 ? `${h}h ${String(m).padStart(2,"0")}m ${String(s).padStart(2,"0")}s` :
    m > 0 ? `${m}m ${String(s).padStart(2,"0")}s` : `${s}s`;
  return { remaining, formatted, expired: remaining === 0 };
}

const Field = ({
  id, label, error, children,
}: {
  id: string; label: string; error?: string; children: React.ReactNode;
}) => (
  <div className="flex flex-col gap-1.5">
    <label htmlFor={id} className="text-[11px] font-body font-semibold uppercase tracking-[0.1em] text-[#6B6B6B]">
      {label}
    </label>
    {children}
    {error && <p className="text-[11px] text-[#E53935] font-body">{error}</p>}
  </div>
);

const inputBase = "w-full bg-[#F7F5F2] border border-[#E2DDD8] px-4 py-3 text-[14px] font-body text-[#111] placeholder:text-[#C4BFB9] focus:outline-none focus:border-[#203A2B] focus:bg-white focus:ring-2 focus:ring-[#203A2B]/8 transition-all rounded-lg";

export default function LoginPage() {
  const [showPw, setShowPw]   = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [lockoutPermanent, setLockoutPermanent] = useState(false);
  const [lockoutUntilMs, setLockoutUntilMs]     = useState<number | null>(null);
  const [failedAttempts, setFailedAttempts]      = useState(0);
  const [lockedEmail, setLockedEmail]            = useState("");
  const countdown = useCountdown(lockoutUntilMs);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  useEffect(() => {
    if (lockoutUntilMs && countdown.expired) { setLockoutUntilMs(null); setError(null); }
  }, [countdown.expired, lockoutUntilMs]);

  const redirectAfterLogin = async () => {
    const params = new URLSearchParams(window.location.search);
    const next = params.get("next");
    const me = await fetch("/api/auth/me").then((r) => r.json());
    if (next && next.startsWith("/") && !next.startsWith("//")) window.location.href = next;
    else window.location.href = me.role === "admin" ? "/admin/dashboard" : "/account/dashboard";
  };

  const applyLockout = (
    status: { blocked: boolean; permanent: boolean; lockedUntil: string | null; attempts: number; remainingMs: number },
    email: string,
  ) => {
    setFailedAttempts(status.attempts);
    setLockedEmail(email);
    if (status.permanent) { setLockoutPermanent(true); setLockoutUntilMs(null); }
    else if (status.lockedUntil && status.remainingMs > 0) { setLockoutPermanent(false); setLockoutUntilMs(Date.now() + status.remainingMs); }
  };

  const onSubmit = async (data: LoginInput) => {
    const lockRes = await fetch("/api/auth/check-lockout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: data.email }) });
    const lockStatus = await lockRes.json();
    if (lockStatus.blocked) { applyLockout(lockStatus, data.email); return; }

    setLoading(true); setError(null);
    try {
      const cred = await signInWithEmailAndPassword(auth, data.email, data.password);
      const idToken = await getIdToken(cred.user);
      await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ idToken }) });
      await fetch("/api/auth/record-success", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: data.email }) });
      setFailedAttempts(0); setLockoutUntilMs(null); setLockoutPermanent(false);
      await redirectAfterLogin();
    } catch {
      const failRes = await fetch("/api/auth/record-failed-attempt", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: data.email }) });
      const failStatus = await failRes.json();
      applyLockout(failStatus, data.email);
      if (!failStatus.blocked) {
        const left = 5 - failStatus.attempts;
        setError(failStatus.attempts === 2
          ? "Incorrect password. 1 attempt left before a 24-hour lockout."
          : `Invalid email or password. ${left} attempt${left !== 1 ? "s" : ""} left.`);
      }
    } finally { setLoading(false); }
  };

  const handleGoogle = async () => {
    setLoading(true); setError(null);
    try {
      const cred = await signInWithPopup(auth, new GoogleAuthProvider());
      const email = cred.user.email ?? "";
      const lockRes = await fetch("/api/auth/check-lockout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      const lockStatus = await lockRes.json();
      if (lockStatus.blocked) { applyLockout(lockStatus, email); return; }
      const idToken = await getIdToken(cred.user);
      await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ idToken }) });
      await redirectAfterLogin();
    } catch { setError("Google sign-in failed. Please try again."); }
    finally { setLoading(false); }
  };

  const isLocked = lockoutPermanent || (lockoutUntilMs !== null && !countdown.expired);

  return (
    <div className="min-h-screen flex bg-[#FAFAF7]">

      {/* ── Left panel ─────────────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[44%] xl:w-[42%] bg-[#0D1F17] flex-col relative overflow-hidden">
        {/* Texture */}
        <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(ellipse at 20% 80%, rgba(120,145,133,0.18) 0%, transparent 55%), radial-gradient(ellipse at 85% 15%, rgba(255,201,40,0.10) 0%, transparent 50%)" }} />
        {/* Grid lines */}
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "48px 48px" }} />

        <div className="relative z-10 flex flex-col h-full px-12 py-10">
          {/* Logo */}
          <Link href="/" className="shrink-0">
            <Image src="/Horizontal_Logo.png" alt="AR Books" width={160} height={44} className="brightness-0 invert opacity-90" priority />
          </Link>

          {/* Center content */}
          <div className="flex-1 flex flex-col justify-center gap-10">
            {/* Decorative book stack */}
            <div className="flex flex-col gap-2.5 w-fit">
              {[
                { w: "w-52", color: "bg-[#FFC928]", label: "Stories" },
                { w: "w-44", color: "bg-[#789185]", label: "Knowledge" },
                { w: "w-36", color: "bg-[#203A2B]", label: "Inspiration" },
              ].map(({ w, color, label }) => (
                <div key={label} className={`${w} h-10 ${color} flex items-center px-4 rounded-sm`}>
                  <span className="text-[11px] font-body font-bold uppercase tracking-[0.15em] text-[#0D1F17] opacity-70">{label}</span>
                </div>
              ))}
            </div>

            <div>
              <h2 className="font-heading text-3xl font-bold text-white leading-snug">
                Your library<br />awaits you.
              </h2>
              <p className="font-body text-[#7A9A8A] text-sm leading-relaxed mt-3 max-w-[260px]">
                Sign in to access your purchased books, download history, and exclusive content.
              </p>
            </div>
          </div>

          {/* Bottom quote */}
          <div className="border-t border-white/[0.07] pt-6">
            <p className="font-body text-[13px] text-white/30 italic leading-relaxed">
              &ldquo;A reader lives a thousand lives before he dies.&rdquo;
            </p>
            <p className="font-body text-[11px] text-white/20 mt-1.5 tracking-wide">— George R.R. Martin</p>
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

          {/* Heading */}
          <div className="mb-8">
            <h1 className="font-heading text-[28px] font-bold text-[#0D1F17] leading-tight">Welcome back</h1>
            <p className="font-body text-[14px] text-[#888] mt-1.5">Sign in to continue to your account</p>
          </div>

          {/* Permanent block */}
          {lockoutPermanent && (
            <div className="bg-[#FFF0F0] border border-[#E53935]/25 rounded-xl p-4 mb-6 flex gap-3 items-start">
              <Lock size={16} className="text-[#E53935] shrink-0 mt-0.5" />
              <div>
                <p className="text-[13px] font-body font-semibold text-[#E53935]">Account blocked</p>
                <p className="text-[12px] font-body text-[#888] mt-0.5 leading-relaxed">Too many failed attempts. Contact support to regain access.</p>
              </div>
            </div>
          )}

          {/* Timed lockout */}
          {!lockoutPermanent && lockoutUntilMs !== null && !countdown.expired && (
            <div className="bg-[#FFFBEB] border border-[#FFC928]/40 rounded-xl p-4 mb-6 flex gap-3 items-start">
              <AlertTriangle size={16} className="text-[#D4A017] shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-body font-semibold text-[#111]">Account temporarily locked</p>
                <p className="text-[12px] font-body text-[#888] mt-0.5">Try again in <span className="font-bold text-[#111] tabular-nums">{countdown.formatted}</span></p>
                <p className="text-[11px] font-body text-[#bbb] mt-1">{lockedEmail} · {failedAttempts}/5 attempts</p>
              </div>
            </div>
          )}

          {/* Google */}
          {!isLocked && (
            <button
              onClick={handleGoogle}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-white border border-[#E2DDD8] text-[#111] font-body text-[13px] font-semibold py-3 rounded-xl hover:bg-[#F7F5F2] hover:border-[#C4BFB9] transition-all disabled:opacity-50 shadow-sm mb-5"
            >
              <GoogleIcon /> Continue with Google
            </button>
          )}

          {!isLocked && (
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-[#E8E4DF]" />
              <span className="text-[11px] font-body text-[#C4BFB9] uppercase tracking-wider">or</span>
              <div className="flex-1 h-px bg-[#E8E4DF]" />
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <Field id="login-email" label="Email" error={errors.email?.message}>
              <input
                id="login-email"
                {...register("email")}
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                disabled={isLocked}
                className={`${inputBase} disabled:opacity-50 disabled:cursor-not-allowed`}
              />
            </Field>

            <Field id="login-password" label="Password" error={errors.password?.message}>
              <div className="relative">
                <input
                  id="login-password"
                  {...register("password")}
                  type={showPw ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  disabled={isLocked}
                  className={`${inputBase} pr-11 disabled:opacity-50 disabled:cursor-not-allowed`}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  disabled={isLocked}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#C4BFB9] hover:text-[#555] transition-colors disabled:opacity-40"
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </Field>

            <div className="flex justify-end -mt-1">
              <Link href="/forgot-password" className="text-[12px] font-body text-[#789185] hover:text-[#203A2B] transition-colors">
                Forgot password?
              </Link>
            </div>

            {error && !isLocked && (
              <div className="bg-[#FFF0F0] border border-[#E53935]/20 text-[#E53935] text-[12px] font-body px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {failedAttempts > 0 && !isLocked && (
              <div className="flex items-center gap-1.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i < failedAttempts ? "bg-[#E53935]" : "bg-[#E8E4DF]"}`} />
                ))}
                <span className="text-[11px] font-body text-[#bbb] ml-1 shrink-0">{failedAttempts}/5</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || isLocked}
              className="w-full bg-[#0D1F17] text-white font-body text-[13px] font-bold uppercase tracking-[0.1em] py-3.5 rounded-xl hover:bg-[#203A2B] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-1"
            >
              {loading ? "Signing in…" : isLocked ? "Account Locked" : <><span>Sign In</span><ArrowRight size={14} /></>}
            </button>
          </form>

          <p className="text-center text-[13px] font-body text-[#999] mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-[#203A2B] font-semibold hover:text-[#789185] transition-colors">Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
