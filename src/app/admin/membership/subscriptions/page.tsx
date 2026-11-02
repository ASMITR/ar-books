import { AdminShell } from "@/components/admin/AdminShell";
import { adminDb } from "@/lib/firebase/admin";
import { formatINR } from "@/lib/currency";
import Link from "next/link";
import type { Metadata } from "next";
import type { MembershipSubscription } from "@/types/subscription";

export const dynamic   = "force-dynamic";
export const metadata: Metadata = { title: "Subscribers — Admin" };

const statusStyles: Record<string, string> = {
  active:         "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  authenticated:  "bg-blue-50 text-blue-600 ring-1 ring-blue-200",
  cancelled:      "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  payment_failed: "bg-rose-50 text-rose-600 ring-1 ring-rose-200",
  halted:         "bg-rose-50 text-rose-600 ring-1 ring-rose-200",
  past_due:       "bg-amber-50 text-amber-600 ring-1 ring-amber-200",
  expired:        "bg-slate-50 text-slate-500 ring-1 ring-slate-200",
  completed:      "bg-slate-50 text-slate-500 ring-1 ring-slate-200",
  created:        "bg-slate-50 text-slate-500 ring-1 ring-slate-200",
  pending:        "bg-amber-50 text-amber-600 ring-1 ring-amber-200",
};

interface Props { searchParams: Promise<{ status?: string; plan?: string }> }

const statusFilters = [
  { value: "",               label: "All"            },
  { value: "active",         label: "Active"         },
  { value: "cancelled",      label: "Cancelled"      },
  { value: "payment_failed", label: "Failed"         },
  { value: "expired",        label: "Expired"        },
];

export default async function AdminSubscriptionsPage({ searchParams }: Props) {
  const { status } = await searchParams;

  let q = adminDb
    .collection("membershipSubscriptions")
    .orderBy("createdAt", "desc") as FirebaseFirestore.Query;
  if (status) q = q.where("status", "==", status);
  q = q.limit(100);

  const snap = await q.get();
  const subs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as MembershipSubscription));

  return (
    <AdminShell
      title="Subscribers"
      subtitle={`${subs.length} subscription${subs.length !== 1 ? "s" : ""}${status ? ` · ${status}` : ""}`}
    >
      <div className="space-y-5">

        {/* Filter tabs */}
        <div className="flex gap-1.5 flex-wrap">
          {statusFilters.map((f) => (
            <Link
              key={f.value}
              href={f.value ? `/admin/membership/subscriptions?status=${f.value}` : "/admin/membership/subscriptions"}
              className={`inline-flex items-center text-[12px] font-body font-semibold px-3.5 py-2 rounded-lg border transition-all
                ${(status ?? "") === f.value
                  ? "bg-[#FFC928] text-[#080808] border-[#FFC928] shadow-sm"
                  : "border-[#E6E3DD] text-[#888] hover:border-[#bbb] hover:text-[#444] bg-white"
                }`}
            >
              {f.label}
            </Link>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white border border-[#E6E3DD] rounded-xl overflow-hidden shadow-sm">
          {subs.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-sm font-body text-[#bbb]">No subscribers found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-body min-w-[700px]">
                <thead>
                  <tr className="border-b border-[#EDE9E3] bg-[#FAF9F6]">
                    {["Customer", "Plan", "Amount", "Started", "Renews", "Status"].map((h) => (
                      <th key={h} className="text-left px-5 py-3.5 text-[11px] uppercase tracking-[0.07em] text-[#b0aca6] font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F2F0EC]">
                  {subs.map((sub) => (
                    <tr key={sub.id} className="hover:bg-[#FAF9F6] transition-colors">
                      <td className="px-5 py-3.5 max-w-[200px]">
                        <p className="font-semibold text-[#080808] text-[13px] truncate">{sub.customerEmail}</p>
                        <p className="text-[11px] text-[#aaa] truncate">{sub.customerName}</p>
                      </td>
                      <td className="px-5 py-3.5 text-[13px] text-[#666]">{sub.planName}</td>
                      <td className="px-5 py-3.5 font-semibold text-[#080808] text-[13px]">{formatINR(sub.pricePaise)}/mo</td>
                      <td className="px-5 py-3.5 text-[#aaa] whitespace-nowrap text-[13px]">
                        {new Date(sub.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-5 py-3.5 text-[#aaa] whitespace-nowrap text-[13px]">
                        {sub.status === "cancelled"
                          ? "—"
                          : new Date(sub.currentPeriodEnd).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center px-2.5 py-1 text-[11px] rounded-full font-semibold capitalize ${statusStyles[sub.status] ?? "bg-slate-50 text-slate-500 ring-1 ring-slate-200"}`}>
                          {sub.status.replace("_", " ")}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
