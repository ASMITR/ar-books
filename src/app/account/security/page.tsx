"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  sendEmailVerification,
} from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { Eye, EyeOff } from "lucide-react";

export default function SecurityPage() {
  const { user } = useAuth();
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwLoading, setPwLoading] = useState(false);
  const [verifyMsg, setVerifyMsg] = useState<string | null>(null);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user.email) return;
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
    } catch {
      setPwError("Failed to change password. Check your current password and try again.");
    } finally {
      setPwLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!auth.currentUser) return;
    try {
      await sendEmailVerification(auth.currentUser);
      setVerifyMsg("Verification email sent. Check your inbox.");
    } catch {
      setVerifyMsg("Could not send verification email.");
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-heading text-4xl font-bold text-[#080808]">Security Settings</h1>

      {/* Email verification */}
      <div className="bg-white border border-[#E9E7E2] p-6 max-w-lg">
        <h2 className="font-heading text-xl font-semibold text-[#080808] mb-3">Email Verification</h2>
        <p className="text-sm font-body text-[#777777] mb-4">
          Status:{" "}
          <span className={user?.emailVerified ? "text-green-600 font-medium" : "text-[#F12F43] font-medium"}>
            {user?.emailVerified ? "Verified" : "Not verified"}
          </span>
        </p>
        {!user?.emailVerified && (
          <button
            onClick={handleResendVerification}
            className="text-xs font-body font-bold uppercase tracking-wider border border-[#080808] px-5 py-2 hover:bg-[#080808] hover:text-white transition-colors"
          >
            Resend Verification Email
          </button>
        )}
        {verifyMsg && <p className="text-sm font-body text-[#777777] mt-3">{verifyMsg}</p>}
      </div>

      {/* Change password */}
      <form onSubmit={handleChangePassword} className="bg-white border border-[#E9E7E2] p-6 flex flex-col gap-4 max-w-lg">
        <h2 className="font-heading text-xl font-semibold text-[#080808]">Change Password</h2>
        <div>
          <label className="block text-xs font-body uppercase tracking-wider text-[#777777] mb-1">Current Password</label>
          <input
            type="password"
            value={currentPw}
            onChange={(e) => setCurrentPw(e.target.value)}
            required
            className="w-full border border-[#E9E7E2] px-4 py-3 text-sm font-body focus:outline-none focus:border-[#789185]"
          />
        </div>
        <div>
          <label className="block text-xs font-body uppercase tracking-wider text-[#777777] mb-1">New Password</label>
          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              required
              minLength={8}
              className="w-full border border-[#E9E7E2] px-4 py-3 pr-10 text-sm font-body focus:outline-none focus:border-[#789185]"
            />
            <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#777777]">
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        {pwSuccess && <p className="text-sm text-green-600 font-body">Password changed successfully.</p>}
        {pwError && <p className="text-sm text-[#F12F43] font-body">{pwError}</p>}
        <button
          type="submit"
          disabled={pwLoading}
          className="bg-[#080808] text-white font-body text-xs font-bold uppercase tracking-widest px-6 py-3 hover:bg-[#789185] transition-colors disabled:opacity-60 w-fit"
        >
          {pwLoading ? "Updating…" : "Update Password"}
        </button>
      </form>
    </div>
  );
}
