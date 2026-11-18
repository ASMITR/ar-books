"use client";

import { useState, useEffect, useCallback } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminButton } from "@/components/admin/AdminButton";
import { AdminModal } from "@/components/admin/AdminModal";
import { Users, PlusCircle, Mail, Building2, CheckCircle2, XCircle, Pause, Eye } from "lucide-react";
import type { AuthorProfile, AuthorInvitation } from "@/types";
import Link from "next/link";

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    active:      { label: "Active",      className: "bg-green-100 text-green-700"  },
    suspended:   { label: "Suspended",   className: "bg-yellow-100 text-yellow-700" },
    deactivated: { label: "Deactivated", className: "bg-red-100 text-red-700"     },
    pending:     { label: "Invited",     className: "bg-blue-100 text-blue-700"   },
    accepted:    { label: "Accepted",    className: "bg-green-100 text-green-700" },
    expired:     { label: "Expired",     className: "bg-gray-100 text-gray-500"   },
    revoked:     { label: "Revoked",     className: "bg-red-100 text-red-700"     },
  };
  const cfg = map[status] ?? { label: status, className: "bg-gray-100 text-gray-600" };
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.className}`}>{cfg.label}</span>;
}

export default function AdminAuthorsPage() {
  const [authors, setAuthors] = useState<AuthorProfile[]>([]);
  const [invitations, setInvitations] = useState<AuthorInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"authors" | "invitations">("authors");
  const [inviteModal, setInviteModal] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteInstitution, setInviteInstitution] = useState("");
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [aRes, iRes] = await Promise.all([
      fetch("/api/admin/authors"),
      fetch("/api/admin/invitations"),
    ]);
    const [aJson, iJson] = await Promise.all([aRes.json(), iRes.json()]);
    if (aJson.success) setAuthors(aJson.data);
    if (iJson.success) setInvitations(iJson.data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleInvite = async () => {
    setInviting(true);
    setInviteError(null);
    try {
      const res = await fetch("/api/admin/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail, name: inviteName, institution: inviteInstitution || undefined }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(typeof json.error === "string" ? json.error : "Invite failed");
      setInviteSuccess(true);
      setInviteName(""); setInviteEmail(""); setInviteInstitution("");
      await fetchData();
      setTimeout(() => { setInviteModal(false); setInviteSuccess(false); }, 1500);
    } catch (err) {
      setInviteError(err instanceof Error ? err.message : "Failed to send invitation");
    } finally {
      setInviting(false);
    }
  };

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

  const handleRevokeInvite = async (inviteId: string) => {
    if (!confirm("Revoke this invitation? The link will no longer work.")) return;
    try {
      const res = await fetch(`/api/admin/invitations/${inviteId}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed");
      await fetchData();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to revoke invitation");
    }
  };

  const handleResendInvite = async (inviteId: string) => {
    try {
      const res = await fetch(`/api/admin/invitations/${inviteId}`, { method: "PATCH" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed");
      alert("Invitation resent successfully.");
      await fetchData();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to resend invitation");
    }
  };

  return (
    <AdminShell
      title="Author Management"
      subtitle={`${authors.length} author${authors.length !== 1 ? "s" : ""} · ${invitations.filter((i) => i.status === "pending").length} pending invitations`}
      action={
        <AdminButton onClick={() => setInviteModal(true)} icon={<PlusCircle />}>
          Invite Author
        </AdminButton>
      }
    >
      {actionError && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">{actionError}</div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-[#F0EDE7] p-1 rounded-xl w-fit mb-6">
        {(["authors", "invitations"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${tab === t ? "bg-white text-[#080808] shadow-sm" : "text-[#666] hover:text-[#080808]"}`}>
            {t} ({t === "authors" ? authors.length : invitations.length})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}</div>
      ) : tab === "authors" ? (
        authors.length === 0 ? (
          <div className="bg-white border border-[#E6E3DD] rounded-xl p-10 text-center">
            <Users size={28} className="text-[#CCC] mx-auto mb-3" />
            <p className="text-[#888] text-sm">No authors yet. Invite one to get started.</p>
          </div>
        ) : (
          <div className="bg-white border border-[#E6E3DD] rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#F0EDE7]">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#888] uppercase">Author</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#888] uppercase hidden md:table-cell">Institution</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#888] uppercase">Status</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-[#888] uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EDE7]">
                {authors.map((author) => (
                  <tr key={author.id} className="hover:bg-[#FAFAF8] transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-medium text-[#080808]">{author.displayName}</p>
                      <p className="text-xs text-[#888]">{author.email}</p>
                    </td>
                    <td className="px-5 py-4 text-[#555] hidden md:table-cell">{author.institution ?? "—"}</td>
                    <td className="px-5 py-4"><StatusBadge status={author.accountStatus} /></td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1 justify-end">
                        {author.accountStatus === "active" ? (
                          <button onClick={() => handleAuthorStatus(author.id, "suspended")} title="Suspend" className="p-1.5 rounded-lg text-yellow-500 hover:bg-yellow-50 transition-colors">
                            <Pause size={14} />
                          </button>
                        ) : (
                          <button onClick={() => handleAuthorStatus(author.id, "active")} title="Activate" className="p-1.5 rounded-lg text-green-500 hover:bg-green-50 transition-colors">
                            <CheckCircle2 size={14} />
                          </button>
                        )}
                        {author.accountStatus !== "deactivated" && (
                          <button onClick={() => handleAuthorStatus(author.id, "deactivated")} title="Deactivate" className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors">
                            <XCircle size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        invitations.length === 0 ? (
          <div className="bg-white border border-[#E6E3DD] rounded-xl p-10 text-center">
            <Mail size={28} className="text-[#CCC] mx-auto mb-3" />
            <p className="text-[#888] text-sm">No invitations sent yet.</p>
          </div>
        ) : (
          <div className="bg-white border border-[#E6E3DD] rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#F0EDE7]">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#888] uppercase">Invitee</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#888] uppercase hidden sm:table-cell">Expires</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#888] uppercase">Status</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-[#888] uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EDE7]">
                {invitations.map((inv) => (
                  <tr key={inv.id} className="hover:bg-[#FAFAF8] transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-medium text-[#080808]">{inv.name}</p>
                      <p className="text-xs text-[#888]">{inv.email}</p>
                    </td>
                    <td className="px-5 py-4 text-xs text-[#888] hidden sm:table-cell">
                      {new Date(inv.expiresAt).toLocaleDateString("en-IN")}
                    </td>
                    <td className="px-5 py-4"><StatusBadge status={inv.status} /></td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1 justify-end">
                        {(inv.status === "pending" || inv.status === "expired") && (
                          <button onClick={() => handleResendInvite(inv.id)} className="text-xs text-blue-600 hover:underline font-medium px-2 py-1">Resend</button>
                        )}
                        {inv.status === "pending" && (
                          <button onClick={() => handleRevokeInvite(inv.id)} className="text-xs text-red-500 hover:underline font-medium px-2 py-1">Revoke</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* Invite Modal */}
      <AdminModal
        open={inviteModal}
        onClose={() => { setInviteModal(false); setInviteError(null); setInviteSuccess(false); }}
        title="Invite Author"
      >
        {inviteSuccess ? (
          <div className="text-center py-6">
            <CheckCircle2 size={32} className="text-green-500 mx-auto mb-3" />
            <p className="font-semibold text-[#080808]">Invitation sent!</p>
            <p className="text-sm text-[#888] mt-1">An email has been sent to the author with a registration link.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {inviteError && <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">{inviteError}</div>}
            <div>
              <label className="block text-xs font-medium text-[#555] mb-1.5">Author Name *</label>
              <input value={inviteName} onChange={(e) => setInviteName(e.target.value)} className="w-full px-3 py-2.5 border border-[#E6E3DD] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FFC928]/30 focus:border-[#FFC928]" placeholder="Full name" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#555] mb-1.5">Email Address *</label>
              <input value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} type="email" className="w-full px-3 py-2.5 border border-[#E6E3DD] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FFC928]/30 focus:border-[#FFC928]" placeholder="author@college.edu" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#555] mb-1.5">College / Institution</label>
              <input value={inviteInstitution} onChange={(e) => setInviteInstitution(e.target.value)} className="w-full px-3 py-2.5 border border-[#E6E3DD] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FFC928]/30 focus:border-[#FFC928]" placeholder="Optional" />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleInvite}
                disabled={inviting || !inviteEmail || !inviteName}
                className="flex-1 bg-[#080808] text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-[#111] disabled:opacity-50 transition-colors"
              >
                {inviting ? "Sending…" : "Send Invitation"}
              </button>
              <button onClick={() => setInviteModal(false)} className="px-4 py-2.5 rounded-xl text-sm font-semibold text-[#666] hover:bg-[#F0EDE7] transition-colors">
                Cancel
              </button>
            </div>
          </div>
        )}
      </AdminModal>
    </AdminShell>
  );
}
