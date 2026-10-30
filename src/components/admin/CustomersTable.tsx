"use client";

import { useState } from "react";
import {
  Lock, ShieldOff, Clock, CheckCircle2, Unlock,
  Trash2, MailCheck, MoreHorizontal, User, X,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { CustomerWithLockout } from "@/app/admin/customers/page";

// ── Badge helpers ─────────────────────────────────────────────────────────────
function LockoutBadge({ lockout }: { lockout: CustomerWithLockout["lockout"] }) {
  if (lockout.permanent) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-red-100 text-red-700 ring-1 ring-red-300">
        <ShieldOff size={10} /> Blocked
      </span>
    );
  }
  if (lockout.blocked && lockout.lockedUntil) {
    const until = new Date(lockout.lockedUntil);
    return (
      <span
        className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-amber-100 text-amber-700 ring-1 ring-amber-300"
        title={`Locked until ${until.toLocaleString()}`}
      >
        <Clock size={10} /> Locked
      </span>
    );
  }
  if (lockout.attempts > 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-orange-50 text-orange-600 ring-1 ring-orange-200">
        {lockout.attempts} failed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
      <CheckCircle2 size={10} /> OK
    </span>
  );
}

function ProviderBadge({ provider }: { provider?: string }) {
  if (!provider) return null;
  const label = provider === "google.com" ? "Google" : provider === "password" ? "Email" : provider;
  const cls =
    provider === "google.com"
      ? "bg-blue-50 text-blue-600 ring-blue-200"
      : "bg-[#F5EFE6] text-[#555] ring-[#E6DFD5]";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-semibold rounded-full ring-1 ${cls}`}>
      {label}
    </span>
  );
}

// ── Delete confirmation dialog ────────────────────────────────────────────────
function DeleteDialog({
  customer,
  onConfirm,
  onCancel,
  deleting,
}: {
  customer: CustomerWithLockout;
  onConfirm: () => void;
  onCancel: () => void;
  deleting: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 border border-[#E6E3DD]">
        <div className="flex items-start justify-between mb-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <Trash2 size={18} className="text-red-600" />
          </div>
          <button onClick={onCancel} className="text-[#aaa] hover:text-[#555] transition-colors">
            <X size={18} />
          </button>
        </div>
        <h3 className="font-heading text-lg font-bold text-[#080808] mb-1">Delete customer?</h3>
        <p className="font-body text-sm text-[#777] mb-1">
          This will permanently delete <strong className="text-[#080808]">{customer.displayName ?? customer.email}</strong> from Firebase Auth and the users collection.
        </p>
        <p className="font-body text-xs text-red-500 mb-6">This action cannot be undone.</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 border border-[#E6E3DD] font-body text-sm text-[#555] px-4 py-2.5 rounded-lg hover:bg-[#FAF9F6] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 bg-red-600 text-white font-body text-sm font-bold px-4 py-2.5 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {deleting ? "Deleting…" : "Yes, Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main table ────────────────────────────────────────────────────────────────
export function CustomersTable({ customers }: { customers: CustomerWithLockout[] }) {
  const [list, setList] = useState<CustomerWithLockout[]>(customers);
  const [unlocking, setUnlocking] = useState<string | null>(null);
  const [resending, setResending] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<CustomerWithLockout | null>(null);
  const [toasts, setToasts] = useState<{ id: string; msg: string; ok: boolean }[]>([]);

  const toast = (id: string, msg: string, ok = true) => {
    setToasts((t) => [...t, { id: `${id}-${Date.now()}`, msg, ok }]);
    setTimeout(() => setToasts((t) => t.filter((x) => !x.msg.startsWith(msg.slice(0, 10)))), 4000);
  };

  // ── Unlock ──────────────────────────────────────────────────────────────────
  const handleUnlock = async (email: string) => {
    setUnlocking(email);
    try {
      const res = await fetch("/api/admin/customers/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setList((prev) =>
          prev.map((c) =>
            c.email === email
              ? { ...c, lockout: { blocked: false, permanent: false, lockedUntil: null, attempts: 0, remainingMs: 0 } }
              : c
          )
        );
        toast(email, "Customer unlocked successfully.");
      } else {
        toast(email, "Failed to unlock customer.", false);
      }
    } finally {
      setUnlocking(null);
    }
  };

  // ── Resend verification ─────────────────────────────────────────────────────
  const handleResendVerification = async (customerId: string) => {
    setResending(customerId);
    try {
      const res = await fetch(`/api/admin/customers/${customerId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "resend-verification" }),
      });
      const data = await res.json();
      if (res.ok) {
        toast(customerId, "Verification email sent.");
      } else {
        toast(customerId, data.error ?? "Failed to send verification email.", false);
      }
    } finally {
      setResending(null);
    }
  };

  // ── Delete ──────────────────────────────────────────────────────────────────
  const handleDelete = async (customerId: string) => {
    setDeleting(customerId);
    try {
      const res = await fetch(`/api/admin/customers/${customerId}`, { method: "DELETE" });
      if (res.ok) {
        setList((prev) => prev.filter((c) => c.id !== customerId));
        toast(customerId, "Customer deleted.");
      } else {
        toast(customerId, "Failed to delete customer.", false);
      }
    } finally {
      setDeleting(null);
      setConfirmDelete(null);
    }
  };

  if (list.length === 0) {
    return (
      <div className="bg-white border border-[#E6E3DD] rounded-xl py-20 text-center flex flex-col items-center gap-3">
        <div className="w-14 h-14 rounded-full bg-[#F5EFE6] flex items-center justify-center">
          <User size={24} className="text-[#A8B5A0]" strokeWidth={1.5} />
        </div>
        <p className="font-heading text-base font-bold text-[#080808]">No customers yet</p>
        <p className="font-body text-sm text-[#bbb]">Registered users will appear here.</p>
      </div>
    );
  }

  return (
    <>
      {/* ── Toast notifications ─────────────────────────────────────────────── */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto px-4 py-3 rounded-lg shadow-lg text-sm font-body font-semibold flex items-center gap-2 ${
              t.ok ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
            }`}
          >
            {t.ok ? <CheckCircle2 size={14} /> : <X size={14} />}
            {t.msg}
          </div>
        ))}
      </div>

      {/* ── Delete confirmation dialog ──────────────────────────────────────── */}
      {confirmDelete && (
        <DeleteDialog
          customer={confirmDelete}
          deleting={deleting === confirmDelete.id}
          onConfirm={() => handleDelete(confirmDelete.id)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      {/* ── Table ──────────────────────────────────────────────────────────── */}
      <div className="bg-white border border-[#E6E3DD] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-body min-w-[780px]">
            <thead>
              <tr className="border-b border-[#EDE9E3] bg-[#FAF9F6]">
                <th className="text-left px-5 py-3.5 text-[11px] uppercase tracking-[0.07em] text-[#b0aca6] font-semibold">Customer</th>
                <th className="text-left px-4 py-3.5 text-[11px] uppercase tracking-[0.07em] text-[#b0aca6] font-semibold">Email</th>
                <th className="text-left px-4 py-3.5 text-[11px] uppercase tracking-[0.07em] text-[#b0aca6] font-semibold">Provider</th>
                <th className="text-left px-4 py-3.5 text-[11px] uppercase tracking-[0.07em] text-[#b0aca6] font-semibold">Verified</th>
                <th className="text-left px-4 py-3.5 text-[11px] uppercase tracking-[0.07em] text-[#b0aca6] font-semibold">Registered</th>
                <th className="text-left px-4 py-3.5 text-[11px] uppercase tracking-[0.07em] text-[#b0aca6] font-semibold">Login Status</th>
                <th className="px-4 py-3.5 text-[11px] uppercase tracking-[0.07em] text-[#b0aca6] font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2F0EC]">
              {list.map((customer) => (
                <tr
                  key={customer.id}
                  className={`hover:bg-[#FAF9F6] transition-colors ${customer.lockout.blocked ? "bg-red-50/30" : ""}`}
                >
                  {/* Name + avatar */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#FFC928]/20 flex items-center justify-center shrink-0 border border-[#FFC928]/30">
                        <span className="text-xs font-bold text-[#080808]">
                          {(customer.displayName ?? customer.email ?? "?")[0].toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-[#080808] text-sm leading-none truncate">
                          {customer.displayName ?? <span className="text-[#aaa] italic">No name</span>}
                        </p>
                        <p className="text-[10px] text-[#bbb] mt-0.5 font-mono">{customer.id.slice(0, 10)}…</p>
                      </div>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="px-4 py-3.5 text-[#555] text-sm max-w-[200px] truncate">{customer.email ?? "—"}</td>

                  {/* Provider */}
                  <td className="px-4 py-3.5">
                    <ProviderBadge provider={customer.provider} />
                  </td>

                  {/* Verified */}
                  <td className="px-4 py-3.5">
                    <span className={`px-2.5 py-1 text-[11px] rounded-full font-semibold ring-1 ${
                      customer.emailVerified
                        ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                        : "bg-amber-50 text-amber-700 ring-amber-200"
                    }`}>
                      {customer.emailVerified ? "Verified" : "Unverified"}
                    </span>
                  </td>

                  {/* Registered */}
                  <td className="px-4 py-3.5 text-[#aaa] whitespace-nowrap text-xs">
                    {customer.createdAt ? formatDate(customer.createdAt) : "—"}
                  </td>

                  {/* Login status */}
                  <td className="px-4 py-3.5">
                    <LockoutBadge lockout={customer.lockout} />
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Unlock — only if blocked */}
                      {customer.lockout.blocked && customer.email && (
                        <button
                          onClick={() => handleUnlock(customer.email!)}
                          disabled={unlocking === customer.email}
                          title="Unlock account"
                          className="inline-flex items-center gap-1 text-[11px] font-semibold border border-amber-400 text-amber-700 px-2.5 py-1.5 rounded hover:bg-amber-50 transition-colors disabled:opacity-50"
                        >
                          <Unlock size={11} />
                          {unlocking === customer.email ? "…" : "Unlock"}
                        </button>
                      )}

                      {/* Resend verification — only if unverified */}
                      {!customer.emailVerified && customer.email && (
                        <button
                          onClick={() => handleResendVerification(customer.id)}
                          disabled={resending === customer.id}
                          title="Resend verification email"
                          className="inline-flex items-center gap-1 text-[11px] font-semibold border border-[#789185] text-[#315B55] px-2.5 py-1.5 rounded hover:bg-[#F5EFE6] transition-colors disabled:opacity-50"
                        >
                          <MailCheck size={11} />
                          {resending === customer.id ? "…" : "Verify"}
                        </button>
                      )}

                      {/* Delete */}
                      <button
                        onClick={() => setConfirmDelete(customer)}
                        title="Delete customer"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold border border-red-200 text-red-500 px-2.5 py-1.5 rounded hover:bg-red-50 hover:border-red-400 hover:text-red-700 transition-colors"
                      >
                        <Trash2 size={11} />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer count */}
        <div className="px-5 py-3 border-t border-[#F2F0EC] bg-[#FAF9F6] flex items-center justify-between">
          <p className="text-[11px] font-body text-[#bbb] uppercase tracking-wider">
            {list.length} customer{list.length !== 1 ? "s" : ""}
          </p>
          <div className="flex items-center gap-4">
            <p className="text-[11px] font-body text-emerald-600">
              {list.filter((c) => c.emailVerified).length} verified
            </p>
            {list.filter((c) => c.lockout.blocked).length > 0 && (
              <p className="text-[11px] font-body text-red-500">
                {list.filter((c) => c.lockout.blocked).length} locked
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
