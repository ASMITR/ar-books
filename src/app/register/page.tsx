"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  getIdToken,
  sendEmailVerification,
} from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { registerSchema, type RegisterInput } from "@/lib/validations";
import { Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const createSession = async (idToken: string) => {
    await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });
  };

  const onSubmit = async (data: RegisterInput) => {
    setLoading(true);
    setError(null);
    try {
      const cred = await createUserWithEmailAndPassword(auth, data.email, data.password);
      await updateProfile(cred.user, { displayName: data.displayName });
      await sendEmailVerification(cred.user);
      const idToken = await getIdToken(cred.user);
      await createSession(idToken);
      router.push("/account/dashboard");
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes("email-already-in-use")) {
        setError("An account with this email already exists.");
      } else {
        setError("Registration failed. Please try again.");
      }
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
      router.push("/account/dashboard");
    } catch {
      setError("Google sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex">
      <div className="hidden lg:flex lg:w-1/2 bg-[#080808] flex-col items-center justify-center p-12">
        <p className="font-heading text-5xl font-bold text-white tracking-widest mb-4">AR BOOKS</p>
        <p className="font-body text-white/50 text-center max-w-xs">
          Create your account to purchase and download eBooks by Asmit Rajaramkar.
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <h1 className="font-heading text-4xl font-bold text-[#080808] mb-2">Create Account</h1>
          <p className="font-body text-[#777777] text-sm mb-8">Join to access your personal library</p>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-body uppercase tracking-wider text-[#777777] mb-1">Full Name</label>
              <input
                {...register("displayName")}
                className="w-full border border-[#E9E7E2] bg-white px-4 py-3 text-sm font-body focus:outline-none focus:border-[#789185]"
                placeholder="Your full name"
              />
              {errors.displayName && <p className="text-xs text-[#F12F43] mt-1">{errors.displayName.message}</p>}
            </div>

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
                  autoComplete="new-password"
                  className="w-full border border-[#E9E7E2] bg-white px-4 py-3 pr-10 text-sm font-body focus:outline-none focus:border-[#789185]"
                  placeholder="Min. 8 characters"
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

            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" {...register("acceptTerms")} className="mt-0.5" />
              <span className="text-sm font-body text-[#777777]">
                I accept the{" "}
                <Link href="/terms" target="_blank" className="underline text-[#080808]">Terms & Conditions</Link>{" "}
                and{" "}
                <Link href="/privacy" target="_blank" className="underline text-[#080808]">Privacy Policy</Link>
              </span>
            </label>
            {errors.acceptTerms && <p className="text-xs text-[#F12F43]">{errors.acceptTerms.message}</p>}

            {error && (
              <div className="bg-[#FFF0F0] border border-[#F12F43] text-[#F12F43] text-sm font-body p-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="bg-[#FFC928] text-[#080808] font-body text-xs font-bold uppercase tracking-widest px-6 py-4 hover:bg-[#F2B916] transition-colors disabled:opacity-60"
            >
              {loading ? "Creating account…" : "Create Account"}
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
            Already have an account?{" "}
            <Link href="/login" className="text-[#080808] font-medium underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
