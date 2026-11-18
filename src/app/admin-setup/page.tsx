"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Eye, EyeOff, ShieldCheck } from "lucide-react";
import type { AdminSetupInput } from "@/lib/validations";

const inputClass =
  "w-full rounded-lg border border-[#E2DDD8] bg-[#F7F5F2] px-4 py-3 text-sm text-[#111] placeholder:text-[#C4BFB9] focus:border-[#203A2B] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#203A2B]/10";

export default function AdminSetupPage() {
  const [form, setForm] = useState<AdminSetupInput>({
    displayName: "",
    email: "",
    password: "",
    setupKey: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [complete, setComplete] = useState(false);

  const updateField = (field: keyof AdminSetupInput, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin-setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Admin setup failed.");
      setForm((current) => ({ ...current, password: "", setupKey: "" }));
      setComplete(true);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Admin setup failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FAFAF7] px-5 py-12">
      <section className="w-full max-w-md rounded-2xl border border-[#E9E7E2] bg-white p-7 shadow-sm sm:p-9">
        <Link href="/" className="mb-8 inline-flex">
          <Image src="/Horizontal_Logo.png" alt="AR Books" width={150} height={42} priority />
        </Link>

        <div className="mb-7 flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#203A2B]/8 text-[#203A2B]">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold text-[#0D1F17]">Initial admin setup</h1>
            <p className="mt-1 text-sm leading-relaxed text-[#777]">
              This can only be completed once. Your password is stored by Firebase Authentication, not as plain text.
            </p>
          </div>
        </div>

        {complete ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="font-body text-sm font-semibold text-emerald-900">Admin account created.</p>
            <p className="mt-1 font-body text-sm text-emerald-800">
              Remove <code>ADMIN_SETUP_SECRET</code> from your server environment, then sign in to continue.
            </p>
            <Link
              href="/login?next=/admin/dashboard"
              className="mt-4 inline-flex items-center gap-2 font-body text-sm font-semibold text-[#203A2B] hover:underline"
            >
              Go to sign in <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <div>
              <label htmlFor="admin-name" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#6B6B6B]">
                Name
              </label>
              <input
                id="admin-name"
                required
                autoComplete="name"
                value={form.displayName}
                onChange={(event) => updateField("displayName", event.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="admin-email" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#6B6B6B]">
                Admin email
              </label>
              <input
                id="admin-email"
                type="email"
                required
                autoComplete="email"
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="admin-password" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#6B6B6B]">
                Password
              </label>
              <div className="relative">
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  value={form.password}
                  onChange={(event) => updateField("password", event.target.value)}
                  className={`${inputClass} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888]"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <p className="mt-1.5 text-xs text-[#888]">
                Use at least 8 characters with uppercase, lowercase, a number, and a symbol.
              </p>
            </div>

            <div>
              <label htmlFor="admin-setup-key" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#6B6B6B]">
                One-time setup key
              </label>
              <input
                id="admin-setup-key"
                type="password"
                required
                autoComplete="off"
                value={form.setupKey}
                onChange={(event) => updateField("setupKey", event.target.value)}
                className={inputClass}
              />
              <p className="mt-1.5 text-xs text-[#888]">
                Enter the server-only <code>ADMIN_SETUP_SECRET</code> configured by the site owner.
              </p>
            </div>

            {error && (
              <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0D1F17] py-3.5 text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-[#203A2B] disabled:opacity-50"
            >
              {loading ? "Creating account…" : <>Create admin account <ArrowRight size={15} /></>}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-xs text-[#999]">
          Already set up? <Link href="/login" className="font-semibold text-[#203A2B] hover:underline">Sign in</Link>
        </p>
      </section>
    </main>
  );
}
