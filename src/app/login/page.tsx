"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const createSession = async (idToken: string) => {
    await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });
  };

  const redirectAfterLogin = async () => {
    const meRes = await fetch("/api/auth/me");
    const me = await meRes.json();
    window.location.href = me.role === "admin" ? "/admin/dashboard" : "/account/dashboard";
  };

  const onSubmit = async (data: LoginInput) => {
    setLoading(true);
    setError(null);
    try {
      const cred = await signInWithEmailAndPassword(auth, data.email, data.password);
      const idToken = await getIdToken(cred.user);
      await createSession(idToken);
      await redirectAfterLogin();
    } catch {
      setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    setError(null);
    try {
      const cred = await signInWithPopup(auth, new GoogleAuthProvider());
      const idToken = await getIdToken(cred.user);
      await createSession(idToken);
      await redirectAfterLogin();
    } catch {
      setError("Google sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex">
      {/* Decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#789185] flex-col items-center justify-center p-12">
        <p className="font-heading text-5xl font-bold text-white tracking-widest mb-4">AR BOOKS</p>
        <p className="font-body text-white/70 text-center max-w-xs">
          Sign in to access your personal library and purchased eBooks.
        </p>
      </div>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <h1 className="font-heading text-4xl font-bold text-[#080808] mb-2">Welcome Back</h1>
          <p className="font-body text-[#777777] text-sm mb-8">Sign in to your account</p>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-body uppercase tracking-wider text-[#777777] mb-1">Email</label>
              <input
                {...register("email")}
                type="email"
                autoComplete="email"
                className="w-full border border-[#E9E7E2] bg-white px-4 py-3 text-sm font-body focus:outline-none focus:border-[#789185]"
                placeholder="your@email.com"
              />
              {errors.email && <p className="text-xs text-[#F12F43] mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-body uppercase tracking-wider text-[#777777] mb-1">Password</label>
              <div className="relative">
                <input
                  {...register("password")}
                  type={showPw ? "text" : "password"}
                  autoComplete="current-password"
                  className="w-full border border-[#E9E7E2] bg-white px-4 py-3 pr-10 text-sm font-body focus:outline-none focus:border-[#789185]"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#777777]"
                  aria-label="Toggle password visibility"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-[#F12F43] mt-1">{errors.password.message}</p>}
            </div>

            <div className="flex justify-end">
              <Link href="/forgot-password" className="text-xs font-body text-[#777777] hover:text-[#080808] underline">
                Forgot password?
              </Link>
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
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-[#E9E7E2]" />
            <span className="text-xs text-[#777777] font-body">or</span>
            <div className="flex-1 h-px bg-[#E9E7E2]" />
          </div>

          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full border border-[#E9E7E2] bg-white text-[#080808] font-body text-sm font-medium px-6 py-3 hover:bg-[#FAF9F6] transition-colors flex items-center justify-center gap-3 disabled:opacity-60"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <p className="text-center text-sm font-body text-[#777777] mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-[#080808] font-medium underline">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
