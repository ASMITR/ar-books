"use client";

import { useState, useEffect, useCallback } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminButton } from "@/components/admin/AdminButton";
import { AdminModal } from "@/components/admin/AdminModal";
import {
  Users, PlusCircle, CheckCircle2, XCircle,
  Pause, Eye, EyeOff, KeyRound, RefreshCw,
} from "lucide-react";
import type { AuthorProfile } from "@/types";

// ─── Status badge ─────────────────────────────────────────────────────────────
const statusStyles: Record<string, string> = {
  active:      "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/80",
  suspended:   "bg-amber-50 text-amber-700 ring-1 ring-amber-200/80",
  deactivated: "bg-red-50 text-red-700 ring-1 ring-red-200/80",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-1 text-[11px] rounded-full font-semibold font-body capitalize ${statusStyles[status] ?? "bg-gray-100 text-gray-600 ring-1 ring-gray-200"}`}>
      {status}
    </span>
  );
}

// ─── Input helper ─────────────────────────────────────────────────────────────
const inputCls = "w-full bg-[#F7F5F2] border border-[#E2DDD8] px-3.5 py-2.5 text-[13px] font-body text-[#111] placeholder:text-[#C4BFB9] focus:outline-none focus:border-[#203A2B] focus:bg-white transition-all rounded-lg";

export default function AdminAuthorsPage() {
  const [authors, setAuthors] = useState<AuthorProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Create author modal
  const [createModal, setCreateModal] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createEmail, setCreateEmail] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [createInstitution, setCreateInstitution] = useState("");
  const [showCreatePw, setShowCreatePw] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState(false);

  // Reset password modal
  const [resetModal, setResetModal] = useState<{ open: boolean; authorId: string; authorName: string }>({
    open: false, authorId: "", authorName: "",
  });
  const [resetPassword, setResetPassword] = useState("");
  const [showResetPw, setShowResetPw] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState(false);

  const [actionError, setActionError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/authors");
    const json = await res.json();
    if (json.success) setAuthors(json.data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Create author ──────────────────────────────────────────────────────────
  const openCreate = () => {
    setCreateName(""); setCreateEmail(""); setCreatePassword(""); setCreateInstitution("");
    setCreateError(null); setCreateSuccess(false); setShowCreatePw(false);
    setCreateModal(true);
  };

  const handleCreate = async () => {
    setCreating(true); setCreateError(null);
    try {
      const res = await fetch("/api/admin/authors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: createName,
          email: createEmail,
          password: createPassword,
          institution: createInstitution || undefined,
        }),
      });
      const json = await res.json();
      if (!json.success) {
        const msg = typeof json.error === "string"
          ? json.error
          : json.error?.fieldErrors
            ? Object.values(json.error.fieldErrors as Record<string, string[]>).flat().join(", ")
            : "Failed to create author";
        throw new Error(msg);
      }
      setCreateSuccess(true);
      await fetchData();
      setTimeout(() => { setCreateModal(false); setCreateSuccess(false); }, 2000);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setCreating(false);
    }
  };

  // ── Status change ──────────────────────────────────────────────────────────
  const handleAuthorStatus = async (authorId: string, status: string) => {
    setActionError(null);
    try {
      const res = await fetch(`/api/admin/authors/${authorId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountStatus: status }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Action failed");
      await fetchData();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Action failed");
    }
  };

  // ── Reset password ─────────────────────────────────────────────────────────
  const openReset = (authorId: string, authorName: string) => {
    setResetPassword(""); setResetError(null); setResetSuccess(false); setShowResetPw(false);
    setResetModal({ open: true, authorId, authorName });
  };

  const handleReset = async () => {
    setResetting(true); setResetError(null);
    try {
      const res = await fetch(`/api/admin/authors/${resetModal.authorId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword: resetPassword }),
      });
      const json = await res.json();
      if (!json.success) {
        const msg = typeof json.error === "string"
          ? json.error
          : json.error?.fieldErrors
            ? Object.values(json.error.fieldErrors as Record<string, string[]>).flat().join(", ")
            : "Failed to reset password";
        throw new Error(msg);
      }
      setResetSuccess(true);
      setTimeout(() => setResetModal((p) => ({ ...p, open: false })), 1800);
    } catch (err) {
      setResetError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setResetting(false);
    }
  };

  return (
    <AdminShell
      title="Author Management"
      subtitle={`${authors.length} author${authors.length !== 1 ? "s" : ""}`}
      action={
        <AdminButton onClick={openCreate} icon={<PlusCircle />}>
          Create Author
        </AdminButton>
      }
    >
      {actionError && (
        <div className="mb-5 bg-red-50 border border-red-200/80 rounded-xl px-4 py-3 text-[13px] font-body text-red-700">
          {actionError}
        </div>
      )}

      {/* Authors table */}
      <div className="bg-white border border-[#E6E3DD] rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="divide-y divide-[#F2F0EC]">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="px-5 py-4 flex items-center gap-4">
                <div className="w-9 h-9 rounded-full bg-[#F2F0EC] animate-pulse shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 bg-[#F2F0EC] rounded animate-pulse w-32" />
                  <div className="h-3 bg-[#F2F0EC] rounded animate-pulse w-48" />
                </div>
              </div>
            ))}
          </div>
        ) : authors.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-14 h-14 rounded-xl bg-[#F2F0EC] flex items-center justify-center mx-auto mb-4">
              <Users size={24} className="text-[#ccc]" />
            </div>
            <p className="text-[15px] font-body text-[#bbb] mb-3">No authors yet.</p>
            <AdminButton variant="inline" onClick={openCreate}>
              Create your first author →
            </AdminButton>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full font-body min-w-[560px]">
              <thead>
                <tr className="border-b border-[#EDE9E3] bg-[#FAF9F6]">
                  <th className="text-left px-5 py-3.5 text-[11px] uppercase tracking-[0.07em] text-[#b0aca6] font-semibold">Author</th>
                  <th className="text-left px-4 py-3.5 text-[11px] uppercase tracking-[0.07em] text-[#b0aca6] font-semibold hidden md:table-cell">Institution</th>
                  <th className="text-left px-4 py-3.5 text-[11px] uppercase tracking-[0.07em] text-[#b0aca6] font-semibold">Status</th>
                  <th className="text-right px-5 py-3.5 text-[11px] uppercase tracking-[0.07em] text-[#b0aca6] font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2F0EC]">
                {authors.map((author) => {
                  const initials = author.displayName
                    .split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
                  return (
                    <tr key={author.id} className="hover:bg-[#FAF9F6] transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#FFC928]/20 flex items-center justify-center shrink-0">
                            <span className="font-heading text-[11px] font-bold text-[#0D1F17]">{initials}</span>
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-[14px] text-[#0a0a0a] truncate">{author.displayName}</p>
                            <p className="text-[12px] text-[#999] truncate">{author.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-[13px] text-[#777] hidden md:table-cell">
                        {author.institution ?? <span className="text-[#ddd]">—</span>}
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge status={author.accountStatus} />
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1 justify-end">
                          {/* Reset password */}
                          <button
                            onClick={() => openReset(author.id, author.displayName)}
                            title="Reset password"
                            className="w-7 h-7 flex items-center justify-center rounded-md text-[#aaa] hover:text-[#203A2B] hover:bg-[#F5F2EE] transition-all"
                          >
                            <KeyRound size={13} />
                          </button>

                          {/* Suspend / Activate */}
                          {author.accountStatus === "active" ? (
                            <button
                              onClick={() => handleAuthorStatus(author.id, "suspended")}
                              title="Suspend author"
                              className="w-7 h-7 flex items-center justify-center rounded-md text-[#aaa] hover:text-amber-600 hover:bg-amber-50 transition-all"
                            >
                              <Pause size={13} />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleAuthorStatus(author.id, "active")}
                              title="Activate author"
                              className="w-7 h-7 flex items-center justify-center rounded-md text-[#aaa] hover:text-emerald-600 hover:bg-emerald-50 transition-all"
                            >
                              <CheckCircle2 size={13} />
                            </button>
                          )}

                          {/* Deactivate */}
                          {author.accountStatus !== "deactivated" && (
                            <button
                              onClick={() => handleAuthorStatus(author.id, "deactivated")}
                              title="Deactivate author"
                              className="w-7 h-7 flex items-center justify-center rounded-md text-[#aaa] hover:text-red-600 hover:bg-red-50 transition-all"
                            >
                              <XCircle size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Create Author Modal ───────────────────────────────────────────── */}
      <AdminModal
        open={createModal}
        onClose={() => { setCreateModal(false); setCreateError(null); setCreateSuccess(false); }}
        title="Create Author Account"
        subtitle="Set the login credentials. Share them with the author manually."
      >
        <div className="p-6">
          {createSuccess ? (
            <div className="text-center py-6">
              <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 size={22} className="text-emerald-500" />
              </div>
              <p className="font-heading font-bold text-[#0a0a0a]">Author account created</p>
              <p className="text-[13px] font-body text-[#999] mt-1">Share the email and password with the author.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {createError && (
                <div className="bg-red-50 border border-red-200/80 rounded-xl px-4 py-3 text-[13px] font-body text-red-700">
                  {createError}
                </div>
              )}

              <div>
                <label className="block text-[11px] font-body font-semibold uppercase tracking-[0.1em] text-[#6B6B6B] mb-1.5">
                  Full Name *
                </label>
                <input
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder="Priya Sharma"
                  className={inputCls}
                />
              </div>

              <div>
                <label className="block text-[11px] font-body font-semibold uppercase tracking-[0.1em] text-[#6B6B6B] mb-1.5">
                  Email Address *
                </label>
                <input
                  value={createEmail}
                  onChange={(e) => setCreateEmail(e.target.value)}
                  type="email"
                  placeholder="author@college.edu"
                  className={inputCls}
                />
              </div>

              <div>
                <label className="block text-[11px] font-body font-semibold uppercase tracking-[0.1em] text-[#6B6B6B] mb-1.5">
                  Password *
                </label>
                <div className="relative">
                  <input
                    value={createPassword}
                    onChange={(e) => setCreatePassword(e.target.value)}
                    type={showCreatePw ? "text" : "password"}
                    placeholder="Min 8 chars, upper, lower, number, special"
                    className={`${inputCls} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCreatePw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#C4BFB9] hover:text-[#555] transition-colors"
                  >
                    {showCreatePw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-body font-semibold uppercase tracking-[0.1em] text-[#6B6B6B] mb-1.5">
                  College / Institution
                </label>
                <input
                  value={createInstitution}
                  onChange={(e) => setCreateInstitution(e.target.value)}
                  placeholder="Optional"
                  className={inputCls}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <AdminButton
                  variant="dark"
                  className="flex-1"
                  loading={creating}
                  loadingText="Creating…"
                  disabled={!createName || !createEmail || !createPassword}
                  onClick={handleCreate}
                >
                  Create Account
                </AdminButton>
                <AdminButton
                  variant="secondary"
                  onClick={() => setCreateModal(false)}
                >
                  Cancel
                </AdminButton>
              </div>
            </div>
          )}
        </div>
      </AdminModal>

      {/* ── Reset Password Modal ──────────────────────────────────────────── */}
      <AdminModal
        open={resetModal.open}
        onClose={() => setResetModal((p) => ({ ...p, open: false }))}
        title="Reset Password"
        subtitle={`Set a new password for ${resetModal.authorName}`}
      >
        <div className="p-6">
          {resetSuccess ? (
            <div className="text-center py-6">
              <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 size={22} className="text-emerald-500" />
              </div>
              <p className="font-heading font-bold text-[#0a0a0a]">Password updated</p>
              <p className="text-[13px] font-body text-[#999] mt-1">Share the new password with the author. Their existing sessions have been signed out.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {resetError && (
                <div className="bg-red-50 border border-red-200/80 rounded-xl px-4 py-3 text-[13px] font-body text-red-700">
                  {resetError}
                </div>
              )}

              <div>
                <label className="block text-[11px] font-body font-semibold uppercase tracking-[0.1em] text-[#6B6B6B] mb-1.5">
                  New Password *
                </label>
                <div className="relative">
                  <input
                    value={resetPassword}
                    onChange={(e) => setResetPassword(e.target.value)}
                    type={showResetPw ? "text" : "password"}
                    placeholder="Min 8 chars, upper, lower, number, special"
                    className={`${inputCls} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowResetPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#C4BFB9] hover:text-[#555] transition-colors"
                  >
                    {showResetPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <p className="text-[11px] font-body text-[#aaa] mt-1.5">
                  The author&apos;s existing sessions will be signed out immediately.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <AdminButton
                  variant="dark"
                  className="flex-1"
                  loading={resetting}
                  loadingText="Updating…"
                  disabled={!resetPassword}
                  onClick={handleReset}
                >
                  Update Password
                </AdminButton>
                <AdminButton
                  variant="secondary"
                  onClick={() => setResetModal((p) => ({ ...p, open: false }))}
                >
                  Cancel
                </AdminButton>
              </div>
            </div>
          )}
        </div>
      </AdminModal>
    </AdminShell>
  );
}
