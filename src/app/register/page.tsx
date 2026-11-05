"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup, GoogleAuthProvider, getIdToken, sendEmailVerification } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { registerSchema, type RegisterInput } from "@/lib/validations";
import { Eye, EyeOff, ArrowRight, Gift } from "lucide-react";
import PasswordRules from "@/components/auth/PasswordRules";

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
    <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
  </svg>
);

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

const perks = [
  { emoji: "📚", text: "Instant access to all purchased eBooks" },
  { emoji: "⬇️", text: "Download & read anywhere, anytime" },
  { emoji: "🎁", text: "Earn rewards by referring friends" },
  { emoji: "🔔", text: "Early access to new releases" },
];

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPw, setShowPw] = useState(false);
  const [pwValue, setPwValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [refCode, setRefCode] = useState<string | null>(null);

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) setRefCode(ref.toUpperCase());
  }, [searchParams]);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  const createSession = async (idToken: string) => {
    await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ idToken }) });
  };

  const sendWelcome = async (idToken: string, ref: string | null) => {
    await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ idToken, referralCode: ref }) })
      .catch(() => {});
  };

  const onSubmit = async (data: RegisterInput) => {
    setLoading(true); setError(null);
    try {
      const cred = await createUserWithEmailAndPassword(auth, data.email, data.password);
      await updateProfile(cred.user, { displayName: data.displayName });
      await sendEmailVerification(cred.user);
      const idToken = await getIdToken(cred.user);
      await createSession(idToken);
      await sendWelcome(idToken, refCode);
      router.push("/account/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error && err.message.includes("email-already-in-use")
        ? "An account with this email already exists."
        : "Registration failed. Please try again.");
    } finally { setLoading(false); }
  };

  const handleGoogle = async () => {
    setLoading(true); setError(null);
    try {
      const ref = searchParams.get("ref")?.toUpperCase() ?? null;
      const cred = await signInWithPopup(auth, new GoogleAuthProvider());
      const idToken = await getIdToken(cred.user);
      await createSession(idToken);
      await sendWelcome(idToken, ref);
      router.push("/account/dashboard");
    } catch { setError("Google sign-in failed. Please try again."); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex bg-[#FAFAF7]">

      {/* ── Left panel ─────────────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[44%] xl:w-[42%] bg-[#0D1F17] flex-col relative overflow-hidden">
        <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(ellipse at 15% 85%, rgba(120,145,133,0.20) 0%, transparent 55%), radial-gradient(ellipse at 90% 10%, rgba(255,201,40,0.12) 0%, transparent 50%)" }} />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "48px 48px" }} />

        <div className="relative z-10 flex flex-col h-full px-12 py-10">
          <Link href="/" className="shrink-0">
            <Image src="/Horizontal_Logo.png" alt="AR Books" width={160} height={44} className="brightness-0 invert opacity-90" priority />
          </Link>

          <div className="flex-1 flex flex-col justify-center gap-10">
            <div>
              <h2 className="font-heading text-3xl font-bold text-white leading-snug">
                Start your<br />reading journey.
              </h2>
              <p className="font-body text-[#7A9A8A] text-sm leading-relaxed mt-3 max-w-[260px]">
                Join thousands of readers. Create your free account and build your digital library today.
              </p>
            </div>

            {/* Perks list */}
            <div className="flex flex-col gap-3">
              {perks.map(({ emoji, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <span className="w-8 h-8 bg-white/[0.06] rounded-lg flex items-center justify-center text-base shrink-0">{emoji}</span>
                  <span className="font-body text-[13px] text-white/60">{text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-white/[0.07] pt-6">
            <p className="font-body text-[13px] text-white/30 italic leading-relaxed">
              &ldquo;Not all those who wander are lost.&rdquo;
            </p>
            <p className="font-body text-[11px] text-white/20 mt-1.5 tracking-wide">— J.R.R. Tolkien</p>
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
          <div className="mb-6">
            <h1 className="font-heading text-[28px] font-bold text-[#0D1F17] leading-tight">Create your account</h1>
            <p className="font-body text-[14px] text-[#888] mt-1.5">Free to join — start reading instantly</p>
          </div>

          {/* Referral banner */}
          {refCode && (
            <div className="bg-[#FFFBEB] border border-[#FFC928]/40 rounded-xl px-4 py-3 mb-5 flex items-center gap-3">
              <Gift size={16} className="text-[#D4A017] shrink-0" />
              <p className="font-body text-[13px] text-[#111]">
                You were referred by a friend! Sign up to give them a reward.
              </p>
            </div>
          )}

          {/* Google */}
          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white border border-[#E2DDD8] text-[#111] font-body text-[13px] font-semibold py-3 rounded-xl hover:bg-[#F7F5F2] hover:border-[#C4BFB9] transition-all disabled:opacity-50 shadow-sm mb-5"
          >
            <GoogleIcon /> Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-[#E8E4DF]" />
            <span className="text-[11px] font-body text-[#C4BFB9] uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-[#E8E4DF]" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <Field id="register-name" label="Full Name" error={errors.displayName?.message}>
              <input id="register-name" {...register("displayName")} placeholder="Your full name" className={inputBase} />
            </Field>

            <Field id="register-email" label="Email" error={errors.email?.message}>
              <input id="register-email" {...register("email")} type="email" autoComplete="email" placeholder="you@example.com" className={inputBase} />
            </Field>

            <Field id="register-password" label="Password" error={errors.password?.message}>
              <div className="relative">
                <input
                  id="register-password"
                  {...register("password", { onChange: (e) => setPwValue(e.target.value) })}
                  type={showPw ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Min. 8 characters"
                  className={`${inputBase} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#C4BFB9] hover:text-[#555] transition-colors"
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              <PasswordRules value={pwValue} />
            </Field>

            <label className="flex items-start gap-3 cursor-pointer mt-1">
              <input type="checkbox" {...register("acceptTerms")} className="mt-0.5 shrink-0 w-4 h-4 accent-[#203A2B] rounded" />
              <span className="text-[12px] font-body text-[#888] leading-relaxed">
                I accept the{" "}
                <Link href="/terms" target="_blank" className="text-[#203A2B] underline underline-offset-2 hover:text-[#789185]">Terms & Conditions</Link>
                {" "}and{" "}
                <Link href="/privacy" target="_blank" className="text-[#203A2B] underline underline-offset-2 hover:text-[#789185]">Privacy Policy</Link>
              </span>
            </label>
            {errors.acceptTerms && <p className="text-[11px] text-[#E53935] font-body -mt-2">{errors.acceptTerms.message}</p>}

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
              {loading ? "Creating account…" : <><span>Create Account</span><ArrowRight size={14} /></>}
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
