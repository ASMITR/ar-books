import { getSessionUser } from "@/lib/firebase/auth-server";
import { getCustomerSubscriptionPayments, getAllSubscriptionsForCustomer } from "@/lib/firebase/subscriptions";
import { formatINR } from "@/lib/currency";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Membership Payments — Account" };

function PaymentStatusIcon({ status }: { status: string }) {
  if (status === "captured") return <CheckCircle size={14} className="text-emerald-600 shrink-0" />;
  if (status === "failed")   return <XCircle     size={14} className="text-red-500 shrink-0" />;
  return                            <Clock       size={14} className="text-[#A8B5A0] shrink-0" />;
}

export default async function MembershipPaymentsPage() {
  const user     = await getSessionUser();
  const payments = await getCustomerSubscriptionPayments(user!.uid);
  const subs     = await getAllSubscriptionsForCustomer(user!.uid);

  // Build sub name map
  const subNames: Record<string, string> = {};
  for (const s of subs) subNames[s.id] = s.planName;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-[10px] font-body uppercase tracking-[0.25em] text-[#A8B5A0] mb-1">Account</p>
        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#080808]">Membership Payments</h1>
      </div>

      {payments.length === 0 ? (
        <div className="bg-[#FFFCF7] border border-[#E6DFD5] rounded-sm p-8 text-center">
          <p className="font-body text-[13px] text-[#777970]">No membership payments yet.</p>
        </div>
      ) : (
        <div className="bg-[#FFFCF7] border border-[#E6DFD5] rounded-sm overflow-hidden">
          <div className="hidden sm:grid grid-cols-[1fr_auto_auto_auto] gap-4 px-5 py-3 border-b border-[#EDEBE6] bg-[#F5EFE6]">
            <span className="font-body text-[10px] font-bold uppercase tracking-[0.15em] text-[#A8B5A0]">Plan</span>
            <span className="font-body text-[10px] font-bold uppercase tracking-[0.15em] text-[#A8B5A0] w-28 text-right">Date</span>
            <span className="font-body text-[10px] font-bold uppercase tracking-[0.15em] text-[#A8B5A0] w-24 text-right">Amount</span>
            <span className="font-body text-[10px] font-bold uppercase tracking-[0.15em] text-[#A8B5A0] w-20 text-center">Status</span>
          </div>
          <div className="divide-y divide-[#EDEBE6]">
            {payments.map((p) => (
              <div key={p.id} className="flex flex-col sm:grid sm:grid-cols-[1fr_auto_auto_auto] gap-1 sm:gap-4 px-5 py-4 items-start sm:items-center">
                <div>
                  <p className="font-body text-[13px] font-semibold text-[#242824]">
                    {p.planName} Membership
                  </p>
                  <p className="font-body text-[11px] text-[#A8B5A0]">
                    {new Date(p.billingPeriodStart).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    {" — "}
                    {new Date(p.billingPeriodEnd).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
                <span className="font-body text-[12px] text-[#555] w-28 text-right">
                  {new Date(p.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </span>
                <span className="font-heading text-[14px] font-bold text-[#203A2B] w-24 text-right tabular-nums">
                  {formatINR(p.amountPaise)}
                </span>
                <div className="flex items-center justify-center gap-1.5 w-20">
                  <PaymentStatusIcon status={p.status} />
                  <span className="font-body text-[11px] text-[#555] capitalize">{p.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
