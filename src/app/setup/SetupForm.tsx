"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ShieldCheck, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

const inputCls =
  "w-full bg-[#161B22] border border-[#30363D] text-white text-sm font-body px-4 py-3 rounded-sm " +
  "placeholder:text-[#484F58] focus:outline-none focus:border-[#FFC928] focus:ring-2 focus:ring-[#FFC928]/10 transition-colors";

export function SetupForm() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  // ── Password strength ───────────────────────────────────────────────────────
  const pwChecks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };
  const pwStrength = Object.values(pwChecks).filter(Boolean).length;
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][pwStrength];
  const strengthColor = ["", "text-red-500", "text-orange-400", "text-amber-400", "text-emerald-400"][pwStrength];
  const strengthBar = ["", "w-1/4 bg-red-500", "w-2/4 bg-orange-400", "w-3/4 bg-amber-400", "w-full bg-emerald-400"][pwStrength];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || name.trim().length < 2) {
      setError("Name must be at least 2 characters."); return;
    }
    if (!email.trim() || !email.includes("@")) {
      setError("Enter a valid email address."); return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters."); return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim().toLowerCase(), password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Setup failed. Please try again.");
        return;
      }

      setDone(true);
      // Redirect to login after a brief success screen
      setTimeout(() => router.push("/login"), 2500);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Success screen ────────────────────────────────────────────────────────
  if (done) {
    return (
      <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-8 flex flex-col items-center gap-4 text-center">
        <div className="w-14 h-14 bg-emerald-500/20 rounded-full flex items-center justify-center">
          <CheckCircle2 size={28} className="text-emerald-400" />
        </div>
        <h2 className="font-heading text-xl font-bold text-white">Admin account created!</h2>
        <p className="text-[#9CA3AF] text-sm font-body leading-relaxed">
          Your admin account is ready. This setup page is now permanently disabled.
          <br />Redirecting to login…
        </p>
        <div className="flex gap-1 mt-1">
          {[0, 1, 2].map((i) => (
            <span key={i} className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    );
  }

  // ── Form ──────────────────────────────────────────────────────────────────
  return (
    <div className="bg-[#161B22] border border-[#30363D] rounded-xl overflow-hidden shadow-2xl">
      {/* Warning banner */}
      <div className="bg-[#FFC928]/10 border-b border-[#FFC928]/20 px-5 py-3 flex items-start gap-2.5">
        <ShieldCheck size={15} className="text-[#FFC928] shrink-0 mt-0.5" />
        <p className="text-[11px] font-body text-[#FFC928] leading-relaxed">
          This creates the <strong>superadmin</strong> account with full access to the dashboard.
          Keep these credentials safe — they cannot be recovered from this page.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
        {/* Name */}
        <div>
          <label className="block text-[11px] font-body font-semibold uppercase tracking-[0.12em] text-[#9CA3AF] mb-2">
            Full Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Asmit Rajaramkar"
            autoComplete="name"
            className={inputCls}
            disabled={loading}
            required
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-[11px] font-body font-semibold uppercase tracking-[0.12em] text-[#9CA3AF] mb-2">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@arbooks.in"
            autoComplete="email"
            className={inputCls}
            disabled={loading}
            required
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-[11px] font-body font-semibold uppercase tracking-[0.12em] text-[#9CA3AF] mb-2">
            Password
          </label>
          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
              autoComplete="new-password"
              className={`${inputCls} pr-11`}
              disabled={loading}
              required
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#484F58] hover:text-[#9CA3AF] transition-colors"
              tabIndex={-1}
            >
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {/* Strength bar */}
          {password.length > 0 && (
            <div className="mt-2.5">
              <div className="h-1 w-full bg-[#30363D] rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-300 ${strengthBar}`} />
              </div>
              <div className="flex items-center justify-between mt-1.5">
                <div className="flex flex-wrap gap-x-3 gap-y-1">
                  {Object.entries(pwChecks).map(([key, ok]) => (
                    <span key={key} className={`text-[10px] font-body flex items-center gap-1 ${ok ? "text-emerald-400" : "text-[#484F58]"}`}>
                      <span className={`w-1 h-1 rounded-full ${ok ? "bg-emerald-400" : "bg-[#484F58]"}`} />
                      {key === "length" ? "8+ chars" : key === "uppercase" ? "Uppercase" : key === "number" ? "Number" : "Special"}
                    </span>
                  ))}
                </div>
                {pwStrength > 0 && (
                  <span className={`text-[10px] font-body font-semibold ${strengthColor}`}>
                    {strengthLabel}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/30 px-4 py-3 rounded-sm">
            <AlertCircle size={14} className="text-red-400 shrink-0 mt-0.5" />
            <p className="text-[12px] font-body text-red-400">{error}</p>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#FFC928] text-[#080808] font-body text-[12px] font-bold uppercase tracking-[0.15em] py-3.5 rounded-sm hover:bg-[#F2B916] transition-colors disabled:opacity-60 flex items-center justify-center gap-2 mt-1"
        >
          {loading ? (
            <>
              <Loader2 size={15} className="animate-spin" /> Creating Admin…
            </>
          ) : (
            <>
              <ShieldCheck size={15} /> Create Admin Account
            </>
          )}
        </button>
      </form>
    </div>
  );
}
