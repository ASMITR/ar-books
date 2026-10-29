"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup, GoogleAuthProvider, getIdToken, sendEmailVerification } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { registerSchema, type RegisterInput } from "@/lib/validations";
import { Eye, EyeOff } from "lucide-react";

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
    <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
  </svg>
);

const inputCls = "w-full border border-[#E9E7E2] bg-[#FAF9F6] px-4 py-3 text-sm font-body focus:outline-none focus:border-[#789185] focus:ring-2 focus:ring-[#789185]/10 transition-colors rounded-sm";

export default function RegisterPage() {
  const router = useRouter();
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  const createSession = async (idToken: string) => {
    await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ idToken }) });
  };

  /** Fire-and-forget welcome email — does not block the registration flow. */
  const sendWelcome = (idToken: string) => {
    fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ idToken }) })
      .catch(() => { /* non-fatal */ });
  };

  const onSubmit = async (data: RegisterInput) => {
    setLoading(true); setError(null);
    try {
      const cred = await createUserWithEmailAndPassword(auth, data.email, data.password);
      await updateProfile(cred.user, { displayName: data.displayName });
      await sendEmailVerification(cred.user);
      const idToken = await getIdToken(cred.user);
      await createSession(idToken);
      sendWelcome(idToken);
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
      const cred = await signInWithPopup(auth, new GoogleAuthProvider());
      const idToken = await getIdToken(cred.user);
      await createSession(idToken);
      sendWelcome(idToken);
      router.push("/account/dashboard");
    } catch { setError("Google sign-in failed. Please try again."); }
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
          <div className="w-12 h-px bg-[#FFC928]" />
          <p className="font-body text-[#aaa] text-sm leading-relaxed max-w-xs">
            Join thousands of readers. Create your free account and start building your digital library today.
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

          <div className="mb-7">
            <h1 className="font-heading text-2xl font-bold text-[#080808]">Create your account</h1>
            <p className="font-body text-sm text-[#777777] mt-1">Free to join — start reading instantly</p>
          </div>

          <div className="bg-white border border-[#E9E7E2] p-7 sm:p-8 rounded-sm shadow-sm">
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <div>
                <label htmlFor="register-name" className="block text-xs font-body uppercase tracking-wider text-[#777777] mb-1.5">Full Name</label>
                <input id="register-name" {...register("displayName")} placeholder="Your full name" className={inputCls} />
                {errors.displayName && <p className="text-xs text-[#F12F43] mt-1">{errors.displayName.message}</p>}
              </div>

              <div>
                <label htmlFor="register-email" className="block text-xs font-body uppercase tracking-wider text-[#777777] mb-1.5">Email</label>
                <input id="register-email" {...register("email")} type="email" autoComplete="email" placeholder="your@email.com" className={inputCls} />
                {errors.email && <p className="text-xs text-[#F12F43] mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <label htmlFor="register-password" className="block text-xs font-body uppercase tracking-wider text-[#777777] mb-1.5">Password</label>
                <div className="relative">
                  <input id="register-password" {...register("password")} type={showPw ? "text" : "password"} autoComplete="new-password" placeholder="Min. 8 characters" className={`${inputCls} pr-10`} />
                  <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#aaa] hover:text-[#555] transition-colors" aria-label={showPw ? "Hide password" : "Show password"}>
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-[#F12F43] mt-1">{errors.password.message}</p>}
              </div>

              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" {...register("acceptTerms")} className="mt-0.5 shrink-0 accent-[#080808]" />
                <span className="text-xs font-body text-[#777777] leading-relaxed">
                  I accept the{" "}
                  <Link href="/terms" target="_blank" className="text-[#080808] underline underline-offset-2">Terms & Conditions</Link>{" "}
                  and{" "}
                  <Link href="/privacy" target="_blank" className="text-[#080808] underline underline-offset-2">Privacy Policy</Link>
                </span>
              </label>
              {errors.acceptTerms && <p className="text-xs text-[#F12F43]">{errors.acceptTerms.message}</p>}

              {error && <div className="bg-[#FFF0F0] border border-[#F12F43]/30 text-[#F12F43] text-xs font-body p-3 rounded-sm">{error}</div>}

              <button type="submit" disabled={loading} className="w-full bg-[#FFC928] text-[#080808] font-body text-xs font-bold uppercase tracking-widest py-3.5 hover:bg-[#F2B916] transition-colors disabled:opacity-60 mt-1 rounded-sm">
                {loading ? "Creating account…" : "Create Account"}
              </button>
            </form>

            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-[#E9E7E2]" />
              <span className="text-xs text-[#aaa] font-body">or</span>
              <div className="flex-1 h-px bg-[#E9E7E2]" />
            </div>

            <button onClick={handleGoogle} disabled={loading} className="w-full border border-[#E9E7E2] bg-white text-[#080808] font-body text-sm font-medium py-3 hover:bg-[#FAF9F6] transition-colors flex items-center justify-center gap-3 disabled:opacity-60 rounded-sm">
              <GoogleIcon /> Continue with Google
            </button>
          </div>

          <p className="text-center text-sm font-body text-[#777777] mt-5">
            Already have an account?{" "}
            <Link href="/login" className="text-[#080808] font-semibold hover:text-[#789185] transition-colors">Sign in</Link>
          </p>

        </div>
      </div>
    </div>
  );
}
