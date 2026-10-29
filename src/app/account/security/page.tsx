"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  updatePassword,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  EmailAuthProvider,
  GoogleAuthProvider,
  deleteUser,
} from "firebase/auth";
import {
  Eye, EyeOff, Trash2, Shield, CheckCircle2,
  XCircle, Lock, X, Check, Loader2,
} from "lucide-react";

export default function SecurityPage() {
  const { user } = useAuth();

  // ── Change password ──────────────────────────────────────────────────────
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw]         = useState("");
  const [showPw, setShowPw]       = useState(false);
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwError, setPwError]     = useState<string | null>(null);
  const [pwLoading, setPwLoading] = useState(false);

  // ── Email verification ───────────────────────────────────────────────────
  const [verifyMsg, setVerifyMsg] = useState<string | null>(null);

  // ── Delete account ───────────────────────────────────────────────────────
  const [showDeleteModal, setShowDeleteModal]   = useState(false);
  const [deletePassword, setDeletePassword]     = useState("");
  const [deleteEmail, setDeleteEmail]           = useState("");
  const [showDeletePw, setShowDeletePw]         = useState(false);
  const [deleteError, setDeleteError]           = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading]       = useState(false);

  // Detect whether the current user signed in with Google
  const isGoogleUser = user?.providerData.some((p) => p.providerId === "google.com") ?? false;

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email) return;
    setPwLoading(true);
    setPwError(null);
    setPwSuccess(false);
    try {
      const cred = EmailAuthProvider.credential(user.email, currentPw);
      await reauthenticateWithCredential(user, cred);
      await updatePassword(user, newPw);
      setPwSuccess(true);
      setCurrentPw("");
      setNewPw("");
      setTimeout(() => setPwSuccess(false), 4000);
    } catch {
      setPwError("Failed to change password. Check your current password and try again.");
    } finally {
      setPwLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      const res = await fetch("/api/auth/send-verification", { method: "POST" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? "Unknown error");
      }
      setVerifyMsg("Verification email sent. Check your inbox.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setVerifyMsg(msg.includes("already verified")
        ? "Your email is already verified."
        : "Could not send verification email. Try again later.");
    }
  };

  const closeDeleteModal = () => {
    if (deleteLoading) return;
    setShowDeleteModal(false);
    setDeletePassword("");
    setDeleteEmail("");
    setDeleteError(null);
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email) return;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      if (isGoogleUser) {
        // Confirm the user typed their own email address
        if (deleteEmail.trim().toLowerCase() !== user.email.toLowerCase()) {
          setDeleteError("Email address doesn't match. Please try again.");
          setDeleteLoading(false);
          return;
        }
        // Re-authenticate with Google popup (Firebase requires recent auth before deletion)
        await reauthenticateWithPopup(user, new GoogleAuthProvider());
      } else {
        const cred = EmailAuthProvider.credential(user.email, deletePassword);
        await reauthenticateWithCredential(user, cred);
      }

      const res = await fetch("/api/account/delete", { method: "DELETE" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? "Server error");
      }
      try { await deleteUser(user); } catch { /* already deleted server-side */ }
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/?account=deleted";
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("auth/wrong-password") || msg.includes("auth/invalid-credential")) {
        setDeleteError("Incorrect password. Please try again.");
      } else if (msg.includes("auth/too-many-requests")) {
        setDeleteError("Too many attempts. Please wait a few minutes and try again.");
      } else if (msg.includes("auth/popup-closed-by-user") || msg.includes("auth/cancelled-popup-request")) {
        setDeleteError("Sign-in popup was closed. Please try again.");
      } else {
        setDeleteError(msg || "Failed to delete account. Please try again.");
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  /* ── Shared field style ──────────────────────────────────────────────── */
  const inputCls = "w-full border border-[#E6DFD5] px-4 py-3 text-sm font-body focus:outline-none focus:border-[#789185] bg-white transition-colors";

  return (
    <div className="flex flex-col gap-7">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div>
        <p className="text-[10px] font-body uppercase tracking-[0.25em] text-[#A8B5A0] mb-1">Account</p>
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-[#080808] leading-none">Security</h1>
      </div>

      {/* ── Email verification ──────────────────────────────────────────── */}
      <div className="bg-white border border-[#E6DFD5] max-w-lg">
        <div className="px-5 py-4 border-b border-[#E6DFD5] flex items-center gap-2">
          <Shield size={14} className="text-[#203A2B]" strokeWidth={2} />
          <h2 className="font-heading text-base font-semibold text-[#080808]">Email Verification</h2>
        </div>
        <div className="px-5 py-5 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            {user?.emailVerified ? (
              <>
                <CheckCircle2 size={18} className="text-emerald-500 shrink-0" strokeWidth={2} />
                <div>
                  <p className="text-[13px] font-body font-semibold text-[#080808]">Email verified</p>
                  <p className="text-[11px] font-body text-[#A8B5A0]">{user.email}</p>
                </div>
              </>
            ) : (
              <>
                <XCircle size={18} className="text-[#F12F43] shrink-0" strokeWidth={2} />
                <div>
                  <p className="text-[13px] font-body font-semibold text-[#080808]">Email not verified</p>
                  <p className="text-[11px] font-body text-[#A8B5A0]">Please verify your email address.</p>
                </div>
              </>
            )}
          </div>
          {!user?.emailVerified && (
            <button
              onClick={handleResendVerification}
              className="w-fit text-[11px] font-body font-bold uppercase tracking-[0.12em] border border-[#203A2B] text-[#203A2B] px-5 py-2.5 hover:bg-[#203A2B] hover:text-[#FFFCF7] transition-colors"
            >
              Resend Verification Email
            </button>
          )}
          {verifyMsg && (
            <p className="text-[12px] font-body text-[#777777] flex items-center gap-1.5">
              <Check size={12} className="text-emerald-500" /> {verifyMsg}
            </p>
          )}
        </div>
      </div>

      {/* ── Change password ──────────────────────────────────────────────── */}
      <form onSubmit={handleChangePassword} className="bg-white border border-[#E6DFD5] max-w-lg">
        <div className="px-5 py-4 border-b border-[#E6DFD5] flex items-center gap-2">
          <Lock size={14} className="text-[#203A2B]" strokeWidth={2} />
          <h2 className="font-heading text-base font-semibold text-[#080808]">Change Password</h2>
        </div>
        <div className="px-5 py-5 flex flex-col gap-4">
          <div>
            <label className="block text-[10px] font-body uppercase tracking-[0.18em] text-[#A8B5A0] mb-1.5">
              Current Password
            </label>
            <input
              type="password"
              value={currentPw}
              onChange={(e) => setCurrentPw(e.target.value)}
              required
              className={inputCls}
              placeholder="Your current password"
            />
          </div>
          <div>
            <label className="block text-[10px] font-body uppercase tracking-[0.18em] text-[#A8B5A0] mb-1.5">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                required
                minLength={8}
                className={`${inputCls} pr-10`}
                placeholder="At least 8 characters"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#A8B5A0] hover:text-[#555] transition-colors"
                tabIndex={-1}
              >
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {pwSuccess && (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-4 py-2.5">
              <Check size={13} className="text-emerald-600 shrink-0" strokeWidth={2.5} />
              <p className="text-[12px] font-body text-emerald-700">Password changed successfully.</p>
            </div>
          )}
          {pwError && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 px-4 py-2.5">
              <X size={13} className="text-[#F12F43] shrink-0" />
              <p className="text-[12px] font-body text-[#F12F43]">{pwError}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={pwLoading}
            className="flex items-center gap-2 bg-[#203A2B] text-[#FFFCF7] font-body text-[11px] font-bold uppercase tracking-[0.12em] px-6 py-3 hover:bg-[#315B55] transition-colors disabled:opacity-50 w-fit"
          >
            {pwLoading && <Loader2 size={13} className="animate-spin" />}
            {pwLoading ? "Updating…" : "Update Password"}
          </button>
        </div>
      </form>

      {/* ── Delete account ───────────────────────────────────────────────── */}
      <div className="bg-white border border-[#E6DFD5] max-w-lg">
        <div className="px-5 py-4 border-b border-[#E6DFD5] flex items-center gap-2">
          <Trash2 size={14} className="text-[#F12F43]" strokeWidth={2} />
          <h2 className="font-heading text-base font-semibold text-[#080808]">Delete Account</h2>
        </div>
        <div className="px-5 py-5 flex flex-col gap-4">
          <p className="text-[13px] font-body text-[#777777] leading-relaxed">
            Permanently delete your account and all associated data — including orders, downloads, and your library.
            <strong className="text-[#F12F43] font-semibold"> This cannot be undone.</strong>
          </p>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-2 text-[11px] font-body font-bold uppercase tracking-[0.12em] border border-[#F12F43] text-[#F12F43] px-5 py-2.5 hover:bg-[#F12F43] hover:text-white transition-colors w-fit"
          >
            <Trash2 size={13} /> Delete My Account
          </button>
        </div>
      </div>

      {/* ── Delete modal ─────────────────────────────────────────────────── */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) closeDeleteModal(); }}
        >
          <div className="bg-white w-full max-w-md shadow-2xl">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E6DFD5]">
              <div className="flex items-center gap-2">
                <Trash2 size={16} className="text-[#F12F43]" strokeWidth={2} />
                <h3 className="font-heading text-base font-bold text-[#080808]">Delete Account</h3>
              </div>
              <button onClick={closeDeleteModal} className="text-[#A8B5A0] hover:text-[#080808] transition-colors">
                <X size={16} />
              </button>
            </div>

            {/* Modal body */}
            <form onSubmit={handleDeleteAccount} className="px-6 py-5 flex flex-col gap-4">
              <p className="text-[13px] font-body text-[#777777] leading-relaxed">
                This will permanently erase your profile, orders, download history, and all data. You will lose access to any books you purchased.
                <strong className="text-[#F12F43] font-semibold"> This cannot be undone.</strong>
              </p>

              {isGoogleUser ? (
                /* ── Google user: confirm by typing email ── */
                <div>
                  <label className="block text-[10px] font-body uppercase tracking-[0.18em] text-[#A8B5A0] mb-1.5">
                    Type your email to confirm
                  </label>
                  <input
                    type="email"
                    value={deleteEmail}
                    onChange={(e) => setDeleteEmail(e.target.value)}
                    required
                    autoComplete="email"
                    placeholder={user?.email ?? "your@email.com"}
                    className={inputCls}
                  />
                  <p className="text-[11px] font-body text-[#A8B5A0] mt-1.5">
                    You&apos;ll be asked to sign in with Google to confirm.
                  </p>
                </div>
              ) : (
                /* ── Email/password user: confirm by password ── */
                <div>
                  <label className="block text-[10px] font-body uppercase tracking-[0.18em] text-[#A8B5A0] mb-1.5">
                    Confirm your password
                  </label>
                  <div className="relative">
                    <input
                      type={showDeletePw ? "text" : "password"}
                      value={deletePassword}
                      onChange={(e) => setDeletePassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      className={`${inputCls} pr-10`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowDeletePw((v) => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#A8B5A0]"
                      tabIndex={-1}
                    >
                      {showDeletePw ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              )}

              {deleteError && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 px-4 py-2.5">
                  <X size={13} className="text-[#F12F43] shrink-0" />
                  <p className="text-[12px] font-body text-[#F12F43]">{deleteError}</p>
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  disabled={deleteLoading}
                  onClick={closeDeleteModal}
                  className="flex-1 border border-[#E6DFD5] text-[11px] font-body font-bold uppercase tracking-[0.1em] text-[#555] px-5 py-3 hover:bg-[#FAF9F6] transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={deleteLoading || (isGoogleUser ? !deleteEmail : !deletePassword)}
                  className="flex-1 bg-[#F12F43] text-white text-[11px] font-body font-bold uppercase tracking-[0.1em] px-5 py-3 hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {deleteLoading && <Loader2 size={12} className="animate-spin" />}
                  {deleteLoading ? "Deleting…" : "Delete Forever"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
