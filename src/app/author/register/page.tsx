"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authorRegistrationSchema, type AuthorRegistrationInput } from "@/lib/validations";
import { signInWithEmailAndPassword } from "firebase/auth";
import { getClientAuth } from "@/lib/firebase/client";
import { Loader2, Eye, EyeOff, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

function RegisterForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";
  const id = searchParams.get("id") ?? "";

  const [invitationData, setInvitationData] = useState<{ name: string; email: string; institution?: string } | null>(null);
  const [validating, setValidating] = useState(true);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<AuthorRegistrationInput>({
    resolver: zodResolver(authorRegistrationSchema),
    defaultValues: { token },
  });

  useEffect(() => {
    if (!token || !id) {
      setInviteError("Invalid invitation link. Please use the full link from your invitation email.");
      setValidating(false);
      return;
    }
    fetch(`/api/author/register?token=${encodeURIComponent(token)}&id=${encodeURIComponent(id)}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setInvitationData(json.data);
        else setInviteError(json.error ?? "Invalid invitation");
      })
      .catch(() => setInviteError("Could not validate invitation. Please try again."))
      .finally(() => setValidating(false));
  }, [token, id]);

  const onSubmit = async (data: AuthorRegistrationInput) => {
    setSubmitting(true);
    setFormError(null);
    try {
      const res = await fetch("/api/author/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, invitationId: id }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Registration failed");

      // Auto sign in and get session cookie
      const auth = getClientAuth();
      const credential = await signInWithEmailAndPassword(auth, invitationData!.email, data.password);
      const idToken = await credential.user.getIdToken();
      await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      setSuccess(true);
      setTimeout(() => router.push("/author/dashboard"), 2000);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Registration failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FFC928] flex items-center justify-center">
              <Sparkles size={18} className="text-[#080808]" strokeWidth={2.5} />
            </div>
            <div>
              <p className="font-heading text-lg font-bold text-[#080808] leading-none">AR Books</p>
              <p className="text-[9px] text-[#999] uppercase tracking-widest mt-0.5">Author Invitation</p>
            </div>
          </Link>
        </div>

        <div className="bg-white border border-[#E6E3DD] rounded-2xl shadow-sm overflow-hidden">
          {/* Header */}
          <div className="bg-[#080808] px-6 py-5">
            <h1 className="text-white font-heading font-bold text-lg">Accept Your Invitation</h1>
            <p className="text-white/50 text-xs mt-1">Create your author account on AR Books</p>
          </div>

          <div className="p-6">
            {validating && (
              <div className="flex items-center justify-center py-8 gap-3 text-[#888]">
                <Loader2 size={18} className="animate-spin" />
                <span className="text-sm">Validating invitation…</span>
              </div>
            )}

            {!validating && inviteError && (
              <div className="text-center py-6">
                <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-3">
                  <AlertCircle size={22} className="text-red-500" />
                </div>
                <p className="font-semibold text-[#080808]">Invitation Invalid</p>
                <p className="text-sm text-[#888] mt-1">{inviteError}</p>
                <Link href="/" className="mt-4 inline-block text-sm text-[#789185] hover:underline">Go to homepage</Link>
              </div>
            )}

            {!validating && success && (
              <div className="text-center py-6">
                <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 size={22} className="text-green-500" />
                </div>
                <p className="font-semibold text-[#080808]">Account Created!</p>
                <p className="text-sm text-[#888] mt-1">Redirecting to your author dashboard…</p>
              </div>
            )}

            {!validating && invitationData && !success && (
              <>
                {/* Invitation info */}
                <div className="mb-5 p-3 bg-[#F4F2EE] rounded-xl">
                  <p className="text-xs text-[#666]">
                    You were invited as <span className="font-semibold text-[#080808]">{invitationData.name}</span>
                  </p>
                  <p className="text-xs text-[#666] mt-0.5">
                    Email: <span className="font-semibold text-[#080808]">{invitationData.email}</span> (cannot be changed)
                  </p>
                  {invitationData.institution && (
                    <p className="text-xs text-[#666] mt-0.5">
                      Institution: <span className="font-semibold text-[#080808]">{invitationData.institution}</span>
                    </p>
                  )}
                </div>

                {formError && (
                  <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">{formError}</div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <input type="hidden" {...register("token")} value={token} />

                  <div>
                    <label className="block text-xs font-medium text-[#555] mb-1.5">Your Name *</label>
                    <input
                      {...register("displayName")}
                      defaultValue={invitationData.name}
                      className="w-full px-3 py-2.5 border border-[#E6E3DD] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FFC928]/30 focus:border-[#FFC928]"
                      placeholder="Your full name"
                    />
                    {errors.displayName && <p className="text-xs text-red-500 mt-1">{errors.displayName.message}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#555] mb-1.5">Password *</label>
                    <div className="relative">
                      <input
                        {...register("password")}
                        type={showPassword ? "text" : "password"}
                        className="w-full px-3 py-2.5 pr-10 border border-[#E6E3DD] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FFC928]/30 focus:border-[#FFC928]"
                        placeholder="Create a strong password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#999] hover:text-[#555]"
                      >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                    {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
                    <p className="text-xs text-[#999] mt-1.5">Min 8 characters with uppercase, lowercase, number and special character.</p>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full flex items-center justify-center gap-2 bg-[#FFC928] text-[#080808] font-bold py-3 rounded-xl text-sm hover:bg-yellow-400 disabled:opacity-60 transition-colors"
                  >
                    {submitting ? <Loader2 size={15} className="animate-spin" /> : null}
                    {submitting ? "Creating account…" : "Create Author Account"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-[#999] mt-5">
          Already have an account? <Link href="/login" className="text-[#789185] hover:underline">Sign in</Link>
        </p>
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
