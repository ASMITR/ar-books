"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  updatePassword, reauthenticateWithCredential, reauthenticateWithPopup,
  EmailAuthProvider, GoogleAuthProvider, deleteUser,
} from "firebase/auth";
import { Eye, EyeOff, Trash2, Shield, CheckCircle2, XCircle, Lock, X, Check, Loader2 } from "lucide-react";

const inputCls = "w-full bg-[#F5F2EE] border border-black/[0.08] px-4 py-3 text-[13.5px] font-body text-[#111] placeholder:text-[#C0BBB3] focus:outline-none focus:border-[#203A2B] focus:bg-white focus:ring-2 focus:ring-[#203A2B]/8 transition-all rounded-xl";

function SectionCard({ icon: Icon, iconBg = "bg-[#F2EFE9]", iconColor = "text-[#203A2B]", title, children }: {
  icon: React.ElementType; iconBg?: string; iconColor?: string; title: string; children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-black/[0.06] rounded-2xl overflow-hidden w-full max-w-lg">
      <div className="px-5 sm:px-6 py-4 border-b border-black/[0.05] flex items-center gap-2.5">
        <div className={`w-7 h-7 ${iconBg} rounded-lg flex items-center justify-center shrink-0`}>
          <Icon size={13} className={iconColor} strokeWidth={2} />
        </div>
        <h2 className="font-heading text-[15px] font-semibold text-[#111]">{title}</h2>
      </div>
      <div className="px-5 sm:px-6 py-5">{children}</div>
    </div>
  );
}

export default function SecurityPage() {
  const { user } = useAuth();

  const [currentPw, setCurrentPw]   = useState("");
  const [newPw, setNewPw]           = useState("");
  const [showPw, setShowPw]         = useState(false);
  const [pwSuccess, setPwSuccess]   = useState(false);
  const [pwError, setPwError]       = useState<string | null>(null);
  const [pwLoading, setPwLoading]   = useState(false);
  const [verifyMsg, setVerifyMsg]   = useState<string | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword]   = useState("");
  const [deleteEmail, setDeleteEmail]         = useState("");
  const [showDeletePw, setShowDeletePw]       = useState(false);
  const [deleteError, setDeleteError]         = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading]     = useState(false);

  const isGoogleUser = user?.providerData.some((p) => p.providerId === "google.com") ?? false;

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email) return;
    setPwLoading(true); setPwError(null); setPwSuccess(false);
    try {
      const cred = EmailAuthProvider.credential(user.email, currentPw);
      await reauthenticateWithCredential(user, cred);
      await updatePassword(user, newPw);
      setPwSuccess(true); setCurrentPw(""); setNewPw("");
      setTimeout(() => setPwSuccess(false), 4000);
    } catch { setPwError("Failed to change password. Check your current password and try again."); }
    finally { setPwLoading(false); }
  };

  const handleResendVerification = async () => {
    try {
      const res = await fetch("/api/auth/send-verification", { method: "POST" });
      if (!res.ok) { const b = await res.json().catch(() => ({})); throw new Error(b?.error ?? "Unknown error"); }
      setVerifyMsg("Verification email sent. Check your inbox.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setVerifyMsg(msg.includes("already verified") ? "Your email is already verified." : "Could not send verification email. Try again later.");
    }
  };

  const closeDeleteModal = () => {
    if (deleteLoading) return;
    setShowDeleteModal(false); setDeletePassword(""); setDeleteEmail(""); setDeleteError(null);
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email) return;
    setDeleteLoading(true); setDeleteError(null);
    try {
      if (isGoogleUser) {
        if (deleteEmail.trim().toLowerCase() !== user.email.toLowerCase()) {
          setDeleteError("Email address doesn't match. Please try again.");
          setDeleteLoading(false); return;
        }
        await reauthenticateWithPopup(user, new GoogleAuthProvider());
      } else {
        const cred = EmailAuthProvider.credential(user.email, deletePassword);
        await reauthenticateWithCredential(user, cred);
      }
      const res = await fetch("/api/account/delete", { method: "DELETE" });
      if (!res.ok) { const b = await res.json().catch(() => ({})); throw new Error(b?.error ?? "Server error"); }
      try { await deleteUser(user); } catch { /* already deleted */ }
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/?account=deleted";
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("auth/wrong-password") || msg.includes("auth/invalid-credential")) setDeleteError("Incorrect password. Please try again.");
      else if (msg.includes("auth/too-many-requests")) setDeleteError("Too many attempts. Please wait a few minutes.");
      else if (msg.includes("auth/popup-closed-by-user")) setDeleteError("Sign-in popup was closed. Please try again.");
      else setDeleteError(msg || "Failed to delete account. Please try again.");
    } finally { setDeleteLoading(false); }
  };

  return (
    <div className="flex flex-col gap-5">

      {/* Header */}
      <div>
        <p className="text-[10px] font-body uppercase tracking-[0.28em] text-[#B8B3AB] mb-1.5">Account</p>
        <h1 className="font-heading text-[28px] sm:text-[32px] font-bold text-[#111] leading-none">Security</h1>
      </div>

      {/* Email verification */}
      <SectionCard icon={Shield} title="Email Verification">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            {user?.emailVerified ? (
              <>
                <CheckCircle2 size={18} className="text-emerald-500 shrink-0" strokeWidth={2} />
                <div>
                  <p className="text-[13px] font-body font-semibold text-[#111]">Email verified</p>
                  <p className="text-[11px] font-body text-[#B8B3AB]">{user.email}</p>
                </div>
              </>
            ) : (
              <>
                <XCircle size={18} className="text-red-500 shrink-0" strokeWidth={2} />
                <div>
                  <p className="text-[13px] font-body font-semibold text-[#111]">Email not verified</p>
                  <p className="text-[11px] font-body text-[#B8B3AB]">Please verify your email address.</p>
                </div>
              </>
            )}
          </div>
          {!user?.emailVerified && (
            <button onClick={handleResendVerification}
              className="w-full sm:w-fit text-[11px] font-body font-bold uppercase tracking-[0.1em] border border-[#203A2B] text-[#203A2B] px-5 py-2.5 rounded-xl hover:bg-[#0D1F17] hover:text-white hover:border-[#0D1F17] transition-colors">
              Resend Verification Email
            </button>
          )}
          {verifyMsg && (
            <p className="text-[12px] font-body text-[#888] flex items-center gap-1.5">
              <Check size={12} className="text-emerald-500 shrink-0" /> {verifyMsg}
            </p>
          )}
        </div>
      </SectionCard>

      {/* Change password */}
      <SectionCard icon={Lock} title="Change Password">
        <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10.5px] font-body font-bold uppercase tracking-[0.12em] text-[#999]">Current Password</label>
            <input type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)}
              required className={inputCls} placeholder="Your current password" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10.5px] font-body font-bold uppercase tracking-[0.12em] text-[#999]">New Password</label>
            <div className="relative">
              <input type={showPw ? "text" : "password"} value={newPw} onChange={(e) => setNewPw(e.target.value)}
                required minLength={8} className={`${inputCls} pr-11`} placeholder="At least 8 characters" />
              <button type="button" onClick={() => setShowPw(v => !v)} tabIndex={-1}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#C0BBB3] hover:text-[#555] transition-colors">
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {pwSuccess && (
            <div className="flex items-center gap-2.5 bg-emerald-50 border border-emerald-200/80 px-4 py-3 rounded-xl">
              <Check size={14} className="text-emerald-600 shrink-0" strokeWidth={2.5} />
              <p className="text-[12px] font-body text-emerald-700">Password changed successfully.</p>
            </div>
          )}
          {pwError && (
            <div className="flex items-center gap-2.5 bg-red-50 border border-red-200/80 px-4 py-3 rounded-xl">
              <X size={14} className="text-red-500 shrink-0" />
              <p className="text-[12px] font-body text-red-600">{pwError}</p>
            </div>
          )}

          <button type="submit" disabled={pwLoading}
            className="w-full sm:w-fit inline-flex items-center justify-center gap-2 bg-[#0D1F17] text-white font-body text-[11.5px] font-bold uppercase tracking-[0.12em] px-6 py-3 rounded-xl hover:bg-[#203A2B] transition-colors disabled:opacity-50">
            {pwLoading && <Loader2 size={13} className="animate-spin" />}
            {pwLoading ? "Updating…" : "Update Password"}
          </button>
        </form>
      </SectionCard>

      {/* Delete account */}
      <SectionCard icon={Trash2} iconBg="bg-red-50" iconColor="text-red-500" title="Delete Account">
        <div className="flex flex-col gap-4">
          <p className="text-[13px] font-body text-[#888] leading-relaxed">
            Permanently delete your account and all associated data — including orders, downloads, and your library.
            <strong className="text-red-500 font-semibold"> This cannot be undone.</strong>
          </p>
          <button onClick={() => setShowDeleteModal(true)}
            className="w-full sm:w-fit inline-flex items-center justify-center gap-2 text-[11px] font-body font-bold uppercase tracking-[0.1em] border border-red-300 text-red-500 px-5 py-2.5 rounded-xl hover:bg-red-500 hover:text-white hover:border-red-500 transition-colors">
            <Trash2 size={13} /> Delete My Account
          </button>
        </div>
      </SectionCard>

      {/* Delete modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-0 sm:px-4 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) closeDeleteModal(); }}>
          <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-black/[0.05]">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 bg-red-50 rounded-lg flex items-center justify-center">
                  <Trash2 size={13} className="text-red-500" strokeWidth={2} />
                </div>
                <h3 className="font-heading text-[15px] font-bold text-[#111]">Delete Account</h3>
              </div>
              <button onClick={closeDeleteModal} className="text-[#B8B3AB] hover:text-[#111] transition-colors p-1">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleDeleteAccount} className="px-5 sm:px-6 py-5 flex flex-col gap-4">
              <p className="text-[13px] font-body text-[#888] leading-relaxed">
                This will permanently erase your profile, orders, download history, and all data.
                <strong className="text-red-500 font-semibold"> This cannot be undone.</strong>
              </p>

              {isGoogleUser ? (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10.5px] font-body font-bold uppercase tracking-[0.12em] text-[#999]">Type your email to confirm</label>
                  <input type="email" value={deleteEmail} onChange={(e) => setDeleteEmail(e.target.value)}
                    required autoComplete="email" placeholder={user?.email ?? "your@email.com"} className={inputCls} />
                  <p className="text-[11px] font-body text-[#B8B3AB]">You&apos;ll be asked to sign in with Google to confirm.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10.5px] font-body font-bold uppercase tracking-[0.12em] text-[#999]">Confirm your password</label>
                  <div className="relative">
                    <input type={showDeletePw ? "text" : "password"} value={deletePassword}
                      onChange={(e) => setDeletePassword(e.target.value)} required autoComplete="current-password"
                      placeholder="Enter your password" className={`${inputCls} pr-11`} />
                    <button type="button" onClick={() => setShowDeletePw(v => !v)} tabIndex={-1}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#C0BBB3]">
                      {showDeletePw ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              )}

              {deleteError && (
                <div className="flex items-center gap-2.5 bg-red-50 border border-red-200/80 px-4 py-3 rounded-xl">
                  <X size={14} className="text-red-500 shrink-0" />
                  <p className="text-[12px] font-body text-red-600">{deleteError}</p>
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button type="button" disabled={deleteLoading} onClick={closeDeleteModal}
                  className="flex-1 border border-black/[0.08] text-[12px] font-body font-bold uppercase tracking-[0.08em] text-[#555] px-4 py-3 rounded-xl hover:bg-[#F5F2EE] transition-colors disabled:opacity-50">
                  Cancel
                </button>
                <button type="submit" disabled={deleteLoading || (isGoogleUser ? !deleteEmail : !deletePassword)}
                  className="flex-1 bg-red-500 text-white text-[12px] font-body font-bold uppercase tracking-[0.08em] px-4 py-3 rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
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
