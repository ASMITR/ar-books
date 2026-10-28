import { adminDb } from "@/lib/firebase/admin";
import { AdminShell } from "@/components/admin/AdminShell";
import { formatDate } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Customers" };

interface CustomerRecord { id: string; displayName?: string; email?: string; role?: string; createdAt?: string; emailVerified?: boolean; }

export default async function AdminCustomersPage() {
  const snap = await adminDb.collection("users").orderBy("createdAt", "desc").get();
  const customers = snap.docs.map((d) => ({ id: d.id, ...d.data() } as CustomerRecord));
  const members = customers.filter((c) => c.role !== "admin");

  return (
    <AdminShell
      title="Customers"
      subtitle={`${members.length} registered member${members.length !== 1 ? "s" : ""}`}
    >
      <div className="bg-white border border-[#E6E3DD] rounded-xl overflow-hidden shadow-sm">
        {members.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-sm font-body text-[#bbb]">No customers yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-body min-w-[500px]">
              <thead>
                <tr className="border-b border-[#EDE9E3] bg-[#FAF9F6]">
                  <th className="text-left px-5 py-3.5 text-[11px] uppercase tracking-[0.07em] text-[#b0aca6] font-semibold">Name</th>
                  <th className="text-left px-4 py-3.5 text-[11px] uppercase tracking-[0.07em] text-[#b0aca6] font-semibold">Email</th>
                  <th className="text-left px-4 py-3.5 text-[11px] uppercase tracking-[0.07em] text-[#b0aca6] font-semibold">Verified</th>
                  <th className="text-left px-4 py-3.5 text-[11px] uppercase tracking-[0.07em] text-[#b0aca6] font-semibold">Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2F0EC]">
                {members.map((customer) => (
                  <tr key={customer.id} className="hover:bg-[#FAF9F6] transition-colors">
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
