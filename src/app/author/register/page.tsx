"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";

// ─── This page is only reached when the owner has already created the account
// ─── via the admin dashboard. It is kept as a fallback / legacy route that
// ─── redirects authors to /login with a helpful message.
// ─── The token-based flow is preserved in case it was ever used before.

function Spinner() {
  return <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin shrink-0" aria-hidden />;
}

const inputBase =
  "w-full bg-[#F7F5F2] border border-[#E2DDD8] px-4 py-3 text-[14px] font-body text-[#111] placeholder:text-[#C4BFB9] focus:outline-none focus:border-[#203A2B] focus:bg-white focus:ring-2 focus:ring-[#203A2B]/8 transition-all rounded-lg";

function RegisterForm() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const token = searchParams.get("token") ?? "";
  const id    = searchParams.get("id")    ?? "";

  const [invitationData, setInvitationData] = useState<{ name: string; email: string; institution?: string } | null>(null);
  const [validating, setValidating]         = useState(!!token);
  const [inviteError, setInviteError]       = useState<string | null>(null);
  const [showPw, setShowPw]                 = useState(false);
  const [submitting, setSubmitting]         = useState(false);
  const [success, setSuccess]               = useState(false);
  const [formError, setFormError]           = useState<string | null>(null);

  const [displayName, setDisplayName] = useState("");
  const [password, setPassword]       = useState("");

  // Validate the token (legacy path)
  useEffect(() => {
    if (!token || !id) {
      // No token — this is the owner-creates-account flow; just redirect to login
      setInviteError(null);
      setValidating(false);
      return;
    }
    fetch(`/api/author/register?token=${encodeURIComponent(token)}&id=${encodeURIComponent(id)}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) { setInvitationData(json.data); setDisplayName(json.data.name); }
        else setInviteError(json.error ?? "Invalid invitation");
      })
      .catch(() => setInviteError("Could not validate the invitation link. Please try again."))
      .finally(() => setValidating(false));
  }, [token, id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invitationData) return;
    setSubmitting(true); setFormError(null);
    try {
      const { signInWithEmailAndPassword } = await import("firebase/auth");
      const { getClientAuth }              = await import("@/lib/firebase/client");

      const res  = await fetch("/api/author/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, invitationId: id, displayName, password }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Registration failed");

      const cred    = await signInWithEmailAndPassword(getClientAuth(), invitationData.email, password);
      const idToken = await cred.user.getIdToken();
      await fetch("/api/auth/login", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      setSuccess(true);
      setTimeout(() => router.push("/author/dashboard"), 2000);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Registration failed. Please try again.");
    } finally { setSubmitting(false); }
  };

  // ── No token: owner has already created their account ─────────────────────
  if (!token && !validating) {
    return (
      <div className="min-h-screen flex bg-[#FAFAF7]">
        {/* Left panel */}
        <div className="hidden lg:flex lg:w-[44%] xl:w-[42%] bg-[#0D1F17] flex-col relative overflow-hidden">
          <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(ellipse at 20% 80%, rgba(120,145,133,0.18) 0%, transparent 55%), radial-gradient(ellipse at 85% 15%, rgba(255,201,40,0.10) 0%, transparent 50%)" }} />
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
          <div className="relative z-10 flex flex-col h-full px-12 py-10">
            <Link href="/"><Image src="/Horizontal_Logo.png" alt="AR Books" width={160} height={44} className="brightness-0 invert opacity-90" priority /></Link>
            <div className="flex-1 flex flex-col justify-center gap-8">
              <div className="flex flex-col gap-2.5 w-fit">
                {[{ w: "w-52", color: "bg-[#FFC928]", label: "Authors" }, { w: "w-44", color: "bg-[#789185]", label: "Create" }, { w: "w-36", color: "bg-[#203A2B]", label: "Publish" }].map(({ w, color, label }) => (
                  <div key={label} className={`${w} h-10 ${color} flex items-center px-4 rounded-sm`}>
                    <span className="text-[11px] font-body font-bold uppercase tracking-[0.15em] text-[#0D1F17] opacity-70">{label}</span>
                  </div>
                ))}
              </div>
              <div>
                <h2 className="font-heading text-3xl font-bold text-white leading-snug">Your author<br />account is ready.</h2>
                <p className="font-body text-[#7A9A8A] text-sm leading-relaxed mt-3 max-w-[260px]">The owner has created your account. Use the credentials provided to sign in.</p>
              </div>
            </div>
            <div className="border-t border-white/[0.07] pt-6">
              <p className="font-body text-[13px] text-white/30 italic leading-relaxed">&ldquo;Every writer has something important to say.&rdquo;</p>
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
          <div className="w-full max-w-[400px]">
            <div className="flex justify-center mb-10 lg:hidden">
              <Link href="/"><Image src="/Horizontal_Logo.png" alt="AR Books" width={160} height={44} priority /></Link>
            </div>
            <div className="mb-8">
              <h1 className="font-heading text-[28px] font-bold text-[#0D1F17] leading-tight">Author Account</h1>
              <p className="font-body text-[14px] text-[#888] mt-1.5">Your account has been set up by the owner. Sign in with the email and password provided to you.</p>
            </div>
            <Link
              href="/login"
              className="w-full flex items-center justify-center gap-2 bg-[#0D1F17] text-white font-body text-[13px] font-bold uppercase tracking-[0.1em] py-3.5 rounded-xl hover:bg-[#203A2B] transition-colors"
            >
              Sign In <ArrowRight size={14} />
            </Link>
            <p className="text-center text-[12px] font-body text-[#aaa] mt-5">
              Didn&apos;t receive your credentials? Contact the platform owner.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Loading state ──────────────────────────────────────────────────────────
  if (validating) {
    return (
      <div className="min-h-screen bg-[#FAFAF7] flex items-center justify-center">
        <div className="flex items-center gap-3 text-[#888] font-body text-[14px]">
          <span className="w-4 h-4 rounded-full border-2 border-[#aaa]/30 border-t-[#aaa] animate-spin" />
          Validating invitation…
        </div>
      </div>
    );
  }

  // ── Invalid / expired token ────────────────────────────────────────────────
  if (inviteError) {
    return (
      <div className="min-h-screen bg-[#FAFAF7] flex items-center justify-center px-6">
        <div className="w-full max-w-[400px] text-center">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={24} className="text-red-500" />
          </div>
          <h1 className="font-heading text-[22px] font-bold text-[#0a0a0a]">Invitation Invalid</h1>
          <p className="font-body text-[14px] text-[#777] mt-2 leading-relaxed">{inviteError}</p>
          <Link href="/" className="mt-6 inline-flex items-center gap-1.5 text-[13px] font-body text-[#789185] hover:text-[#0a0a0a] transition-colors">
            <ArrowRight size={12} className="rotate-180" /> Go to homepage
          </Link>
        </div>
      </div>
    );
  }

  // ── Success state ──────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen bg-[#FAFAF7] flex items-center justify-center px-6">
        <div className="w-full max-w-[400px] text-center">
          <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={24} className="text-emerald-500" />
          </div>
          <h1 className="font-heading text-[22px] font-bold text-[#0a0a0a]">Account Ready!</h1>
          <p className="font-body text-[14px] text-[#777] mt-2">Signing you in and redirecting to your dashboard…</p>
        </div>
      </div>
    );
  }

  // ── Legacy token-based registration form ───────────────────────────────────
  return (
    <div className="min-h-screen flex bg-[#FAFAF7]">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[44%] xl:w-[42%] bg-[#0D1F17] flex-col relative overflow-hidden">
        <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(ellipse at 20% 80%, rgba(120,145,133,0.18) 0%, transparent 55%), radial-gradient(ellipse at 85% 15%, rgba(255,201,40,0.10) 0%, transparent 50%)" }} />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
        <div className="relative z-10 flex flex-col h-full px-12 py-10">
          <Link href="/"><Image src="/Horizontal_Logo.png" alt="AR Books" width={160} height={44} className="brightness-0 invert opacity-90" priority /></Link>
          <div className="flex-1 flex flex-col justify-center gap-8">
            <div className="flex flex-col gap-2.5 w-fit">
              {[{ w: "w-52", color: "bg-[#FFC928]", label: "Authors" }, { w: "w-44", color: "bg-[#789185]", label: "Create" }, { w: "w-36", color: "bg-[#203A2B]", label: "Publish" }].map(({ w, color, label }) => (
                <div key={label} className={`${w} h-10 ${color} flex items-center px-4 rounded-sm`}>
                  <span className="text-[11px] font-body font-bold uppercase tracking-[0.15em] text-[#0D1F17] opacity-70">{label}</span>
                </div>
              ))}
            </div>
            <div>
              <h2 className="font-heading text-3xl font-bold text-white leading-snug">Welcome to<br />AR Books.</h2>
              <p className="font-body text-[#7A9A8A] text-sm leading-relaxed mt-3 max-w-[260px]">You&apos;ve been invited to publish your work on AR Books. Set up your account below.</p>
            </div>
          </div>
          <div className="border-t border-white/[0.07] pt-6">
            <p className="font-body text-[13px] text-white/30 italic leading-relaxed">&ldquo;Every writer has something important to say.&rdquo;</p>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 overflow-y-auto">
        <div className="w-full max-w-[400px]">
          <div className="flex justify-center mb-10 lg:hidden">
            <Link href="/"><Image src="/Horizontal_Logo.png" alt="AR Books" width={160} height={44} priority /></Link>
          </div>

          <div className="mb-8">
            <h1 className="font-heading text-[28px] font-bold text-[#0D1F17] leading-tight">Set up your account</h1>
            <p className="font-body text-[14px] text-[#888] mt-1.5">You were invited as an author on AR Books.</p>
          </div>

          {/* Invitation info */}
          {invitationData && (
            <div className="bg-[#F7F5F2] border border-[#E2DDD8] rounded-xl p-4 mb-6 space-y-1">
              <p className="text-[12px] font-body text-[#777]">
                Name: <span className="font-semibold text-[#0a0a0a]">{invitationData.name}</span>
              </p>
              <p className="text-[12px] font-body text-[#777]">
                Email: <span className="font-semibold text-[#0a0a0a]">{invitationData.email}</span>
                <span className="text-[#C4BFB9] ml-1">(cannot be changed)</span>
              </p>
              {invitationData.institution && (
                <p className="text-[12px] font-body text-[#777]">
                  Institution: <span className="font-semibold text-[#0a0a0a]">{invitationData.institution}</span>
                </p>
              )}
            </div>
          )}

          {formError && (
            <div className="bg-[#FFF0F0] border border-red-200/80 rounded-xl px-4 py-3 mb-5 text-[13px] font-body text-red-600 flex items-start gap-2">
              <AlertCircle size={14} className="shrink-0 mt-0.5" />
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-body font-semibold uppercase tracking-[0.1em] text-[#6B6B6B]">Your Name</label>
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Full name"
                className={inputBase}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-body font-semibold uppercase tracking-[0.1em] text-[#6B6B6B]">Password</label>
              <div className="relative">
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPw ? "text" : "password"}
                  placeholder="Create a strong password"
                  className={`${inputBase} pr-11`}
                  required
                />
                <button type="button" onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#C4BFB9] hover:text-[#555] transition-colors">
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              <p className="text-[11px] font-body text-[#C4BFB9]">Min 8 characters with uppercase, lowercase, number and special character.</p>
            </div>

            <button
              type="submit"
              disabled={submitting || !displayName || !password}
              className="w-full flex items-center justify-center gap-2 bg-[#0D1F17] text-white font-body text-[13px] font-bold uppercase tracking-[0.1em] py-3.5 rounded-xl hover:bg-[#203A2B] transition-colors disabled:opacity-50 mt-1"
            >
              {submitting ? <Spinner /> : null}
              {submitting ? "Creating account…" : <><span>Create Author Account</span><ArrowRight size={14} /></>}
            </button>
          </form>

          <p className="text-center text-[13px] font-body text-[#999] mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-[#203A2B] font-semibold hover:text-[#789185] transition-colors">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AuthorRegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
