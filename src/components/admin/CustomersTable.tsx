"use client";

import { useState } from "react";
import { Lock, ShieldOff, Clock, CheckCircle2, Unlock } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { CustomerWithLockout } from "@/app/admin/customers/page";

// ── Small components ──────────────────────────────────────────────────────────
function LockoutBadge({ lockout }: { lockout: CustomerWithLockout["lockout"] }) {
  if (!lockout.blocked && lockout.attempts === 0) return null;

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
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-amber-100 text-amber-700 ring-1 ring-amber-300" title={`Locked until ${until.toLocaleString()}`}>
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

  return null;
}

// ── Main table ────────────────────────────────────────────────────────────────
export function CustomersTable({ customers }: { customers: CustomerWithLockout[] }) {
  const [list, setList] = useState<CustomerWithLockout[]>(customers);
  const [unlocking, setUnlocking] = useState<string | null>(null); // email being unlocked
  const [unlockSuccess, setUnlockSuccess] = useState<string | null>(null);

  const handleUnlock = async (email: string) => {
    setUnlocking(email);
    setUnlockSuccess(null);
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
        setUnlockSuccess(email);
        setTimeout(() => setUnlockSuccess(null), 3000);
      }
    } finally {
      setUnlocking(null);
    }
  };

  if (list.length === 0) {
    return (
      <div className="bg-white border border-[#E6E3DD] rounded-xl py-20 text-center">
        <p className="text-sm font-body text-[#bbb]">No customers yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#E6E3DD] rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm font-body min-w-[640px]">
          <thead>
            <tr className="border-b border-[#EDE9E3] bg-[#FAF9F6]">
              <th className="text-left px-5 py-3.5 text-[11px] uppercase tracking-[0.07em] text-[#b0aca6] font-semibold">Name</th>
              <th className="text-left px-4 py-3.5 text-[11px] uppercase tracking-[0.07em] text-[#b0aca6] font-semibold">Email</th>
              <th className="text-left px-4 py-3.5 text-[11px] uppercase tracking-[0.07em] text-[#b0aca6] font-semibold">Verified</th>
              <th className="text-left px-4 py-3.5 text-[11px] uppercase tracking-[0.07em] text-[#b0aca6] font-semibold">Registered</th>
              <th className="text-left px-4 py-3.5 text-[11px] uppercase tracking-[0.07em] text-[#b0aca6] font-semibold">Login Status</th>
              <th className="px-4 py-3.5 text-[11px] uppercase tracking-[0.07em] text-[#b0aca6] font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F2F0EC]">
            {list.map((customer) => (
              <tr key={customer.id} className={`hover:bg-[#FAF9F6] transition-colors ${customer.lockout.blocked ? "bg-red-50/40" : ""}`}>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#FFC928]/20 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-[#080808]">
                        {(customer.displayName ?? customer.email ?? "?")[0].toUpperCase()}
                      </span>
                    </div>
                    <span className="font-semibold text-[#080808] text-sm">{customer.displayName ?? "—"}</span>
                  </div>
                </td>
                <td className="px-4 py-3.5 text-[#666] text-sm">{customer.email ?? "—"}</td>
                <td className="px-4 py-3.5">
                  <span className={`px-2.5 py-1 text-[11px] rounded-full font-semibold ring-1 ${
                    customer.emailVerified
                      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                      : "bg-amber-50 text-amber-700 ring-amber-200"
                  }`}>
                    {customer.emailVerified ? "Verified" : "Unverified"}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-[#aaa] whitespace-nowrap text-xs">
                  {customer.createdAt ? formatDate(customer.createdAt) : "—"}
                </td>
                <td className="px-4 py-3.5">
                  {unlockSuccess === customer.email ? (
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
                      <CheckCircle2 size={12} /> Unlocked
                    </span>
                  ) : (
                    <LockoutBadge lockout={customer.lockout} />
                  )}
                </td>
                <td className="px-4 py-3.5 text-right">
                  {customer.lockout.blocked && customer.email && (
                    <button
                      onClick={() => handleUnlock(customer.email!)}
                      disabled={unlocking === customer.email}
                      className="inline-flex items-center gap-1.5 text-[11px] font-body font-semibold uppercase tracking-wider border border-[#080808] px-3 py-1.5 hover:bg-[#080808] hover:text-white transition-colors disabled:opacity-50"
                    >
                      <Unlock size={11} />
                      {unlocking === customer.email ? "Unlocking…" : "Unlock"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
