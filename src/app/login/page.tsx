"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, getIdToken } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { loginSchema, type LoginInput } from "@/lib/validations";
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

export default function LoginPage() {
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const createSession = async (idToken: string) => {
    await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ idToken }) });
  };

  const redirectAfterLogin = async () => {
    const params = new URLSearchParams(window.location.search);
    const next = params.get("next");
    const me = await fetch("/api/auth/me").then(r => r.json());
    if (next && next.startsWith("/") && !next.startsWith("//")) {
      window.location.href = next;
    } else {
      window.location.href = me.role === "admin" ? "/admin/dashboard" : "/account/dashboard";
    }
  };

  const onSubmit = async (data: LoginInput) => {
    setLoading(true); setError(null);
    try {
      const cred = await signInWithEmailAndPassword(auth, data.email, data.password);
      await createSession(await getIdToken(cred.user));
      await redirectAfterLogin();
    } catch { setError("Invalid email or password. Please try again."); }
    finally { setLoading(false); }
  };

  const handleGoogle = async () => {
    setLoading(true); setError(null);
    try {
      const cred = await signInWithPopup(auth, new GoogleAuthProvider());
      await createSession(await getIdToken(cred.user));
      await redirectAfterLogin();
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
          <div className="w-12 h-px bg-[#789185]" />
          <p className="font-body text-[#aaa] text-sm leading-relaxed max-w-xs">
            Discover stories that move you. Sign in to access your library and continue reading.
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
            <h1 className="font-heading text-2xl font-bold text-[#080808]">Welcome back</h1>
            <p className="font-body text-sm text-[#777777] mt-1">Sign in to your account to continue</p>
          </div>

          <div className="bg-white border border-[#E9E7E2] p-7 sm:p-8 rounded-sm shadow-sm">
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-body uppercase tracking-wider text-[#777777] mb-1.5">Email</label>
                <input {...register("email")} type="email" autoComplete="email" placeholder="your@email.com" className={inputCls} />
                {errors.email && <p className="text-xs text-[#F12F43] mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-body uppercase tracking-wider text-[#777777]">Password</label>
                  <Link href="/forgot-password" className="text-xs font-body text-[#789185] hover:text-[#080808] transition-colors">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input {...register("password")} type={showPw ? "text" : "password"} autoComplete="current-password" placeholder="••••••••" className={`${inputCls} pr-10`} />
                  <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#aaa] hover:text-[#555] transition-colors" aria-label="Toggle password">
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-[#F12F43] mt-1">{errors.password.message}</p>}
              </div>

              {error && <div className="bg-[#FFF0F0] border border-[#F12F43]/30 text-[#F12F43] text-xs font-body p-3 rounded-sm">{error}</div>}

              <button type="submit" disabled={loading} className="w-full bg-[#080808] text-white font-body text-xs font-bold uppercase tracking-widest py-3.5 hover:bg-[#789185] transition-colors disabled:opacity-60 mt-1 rounded-sm">
                {loading ? "Signing in…" : "Sign In"}
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
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-[#080808] font-semibold hover:text-[#789185] transition-colors">Create one</Link>
          </p>

        </div>
      </div>
    </div>
  );
}
