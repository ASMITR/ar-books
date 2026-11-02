import { getSessionUser } from "@/lib/firebase/auth-server";
import { getActiveMembershipForCustomer, getAllSubscriptionsForCustomer, getMembershipPlanById } from "@/lib/firebase/subscriptions";
import { formatINR } from "@/lib/currency";
import Link from "next/link";
import { ArrowRight, BookOpen, Download, CheckCircle, AlertCircle, XCircle, Clock, Library, CreditCard } from "lucide-react";
import { MembershipCancelButton } from "@/components/membership/MembershipCancelButton";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "My Membership — Account" };

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    active:         { label: "Active",        cls: "bg-emerald-100 text-emerald-800 border-emerald-200" },
    authenticated:  { label: "Activating",    cls: "bg-blue-100 text-blue-800 border-blue-200"          },
    cancelled:      { label: "Cancelled",     cls: "bg-orange-100 text-orange-800 border-orange-200"    },
    payment_failed: { label: "Payment Failed",cls: "bg-red-100 text-red-800 border-red-200"             },
    past_due:       { label: "Past Due",      cls: "bg-yellow-100 text-yellow-800 border-yellow-200"    },
    expired:        { label: "Expired",       cls: "bg-[#F0EDE8] text-[#777] border-[#E6DFD5]"          },
    halted:         { label: "Halted",        cls: "bg-red-100 text-red-800 border-red-200"             },
  };
  const { label, cls } = map[status] ?? { label: status, cls: "bg-[#F0EDE8] text-[#777] border-[#E6DFD5]" };
  return (
    <span className={`inline-flex items-center font-body text-[10px] font-bold uppercase tracking-[0.14em] px-2.5 py-1 border rounded-full ${cls}`}>
      {label}
    </span>
  );
}

export default async function AccountMembershipPage() {
  const user       = await getSessionUser();
  const membership = await getActiveMembershipForCustomer(user!.uid);
  const allSubs    = await getAllSubscriptionsForCustomer(user!.uid);

  const isActive = !!membership?.isActive;

  return (
    <div className="flex flex-col gap-6">

      {/* ── Page header ───────────────────────────────────────────────── */}
      <div>
        <p className="text-[10px] font-body uppercase tracking-[0.25em] text-[#A8B5A0] mb-1">Account</p>
        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#080808]">My Membership</h1>
      </div>

      {/* ── No subscription ───────────────────────────────────────────── */}
      {!membership && (
        <div className="bg-[#FFFCF7] border border-[#E6DFD5] rounded-sm p-8 flex flex-col items-center text-center gap-5">
          <div className="w-14 h-14 bg-[#F5EFE6] rounded-sm flex items-center justify-center">
            <Library size={24} className="text-[#A8B5A0]" strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="font-heading text-xl font-bold text-[#1a1a1a] mb-2">No Active Membership</h2>
            <p className="font-body text-[13px] text-[#777970] leading-relaxed max-w-sm">
              Subscribe to get monthly access to our curated eBook library starting at ₹199/month.
            </p>
          </div>
          <Link href="/membership"
            className="inline-flex items-center gap-2 bg-[#203A2B] text-[#FFFCF7] font-body text-[11px] font-bold uppercase tracking-[0.15em] px-7 py-3.5 rounded-sm hover:bg-[#2c5040] transition-colors">
            Explore Membership Plans <ArrowRight size={12} />
          </Link>
        </div>
      )}

      {/* ── Active membership ─────────────────────────────────────────── */}
      {membership && (
        <>
          {/* Status card */}
          <div className="bg-[#FFFCF7] border border-[#E6DFD5] rounded-sm overflow-hidden shadow-sm">
            {/* Coloured top stripe */}
            <div className={`h-[3px] ${isActive ? "bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-500" : "bg-[#E6DFD5]"}`} />

            <div className="px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-5">
              <div className="flex flex-col gap-1 flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-heading text-[22px] font-bold text-[#1a1a1a]">
                    {membership.plan.name} Membership
                  </span>
                  <StatusBadge status={membership.subscription.status} />
                </div>
                <p className="font-body text-[13px] text-[#777970]">
                  {formatINR(membership.subscription.pricePaise)}/month · billed monthly
                </p>
              </div>
              {isActive && (
                <div className="flex items-center gap-2 shrink-0">
                  <CheckCircle size={14} className="text-emerald-600" />
                  <span className="font-body text-[12px] font-semibold text-emerald-700">
                    {membership.daysRemaining} day{membership.daysRemaining !== 1 ? "s" : ""} remaining
                  </span>
                </div>
              )}
            </div>

            {/* Details grid */}
            <div className="border-t border-[#EDEBE6] grid grid-cols-2 sm:grid-cols-4 divide-x divide-[#EDEBE6]">
              {[
                {
                  label: "Plan",
                  value: membership.plan.name,
                  Icon: Library,
                },
                {
                  label: "Started",
                  value: new Date(membership.subscription.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
                  Icon: Clock,
                },
                {
                  label: "Renews",
                  value: membership.subscription.status === "cancelled"
                    ? "Cancelled"
                    : new Date(membership.subscription.currentPeriodEnd).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
                  Icon: CreditCard,
                },
                {
                  label: "Downloads",
                  value: membership.canDownload ? "Enabled" : "Not included",
                  Icon: Download,
                },
              ].map(({ label, value, Icon }) => (
                <div key={label} className="px-4 py-4 flex flex-col gap-1">
                  <div className="flex items-center gap-1.5">
                    <Icon size={11} className="text-[#A8B5A0]" strokeWidth={1.8} />
                    <span className="font-body text-[9px] uppercase tracking-[0.15em] text-[#A8B5A0]">{label}</span>
                  </div>
                  <span className="font-body text-[13px] font-semibold text-[#242824]">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Benefits */}
          <div className="bg-[#FFFCF7] border border-[#E6DFD5] rounded-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-[#EDEBE6] bg-[#F5EFE6]">
              <h2 className="font-heading text-[17px] font-bold text-[#242824]">Your {membership.plan.name} Benefits</h2>
            </div>
            <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {membership.plan.benefits.map((benefit) => (
                <div key={benefit} className="flex items-start gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle size={9} strokeWidth={3} className="text-emerald-700" />
                  </div>
                  <span className="font-body text-[12px] text-[#555] leading-snug">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/account/membership/library"
              className="group flex items-center gap-4 bg-[#FFFCF7] border border-[#E6DFD5] rounded-sm p-5 hover:border-[#203A2B]/40 hover:shadow-sm transition-all">
              <div className="w-10 h-10 bg-[#203A2B]/8 rounded-sm flex items-center justify-center shrink-0">
                <BookOpen size={18} className="text-[#203A2B]" strokeWidth={1.5} />
              </div>
              <div>
                <p className="font-body text-[13px] font-bold text-[#1a1a1a]">Member Library</p>
                <p className="font-body text-[11px] text-[#A8B5A0]">Browse your accessible eBooks</p>
              </div>
              <ArrowRight size={14} className="ml-auto text-[#C0BAB2] group-hover:text-[#203A2B] transition-colors" />
            </Link>
            <Link href="/account/membership/payments"
              className="group flex items-center gap-4 bg-[#FFFCF7] border border-[#E6DFD5] rounded-sm p-5 hover:border-[#203A2B]/40 hover:shadow-sm transition-all">
              <div className="w-10 h-10 bg-[#203A2B]/8 rounded-sm flex items-center justify-center shrink-0">
                <CreditCard size={18} className="text-[#203A2B]" strokeWidth={1.5} />
              </div>
              <div>
                <p className="font-body text-[13px] font-bold text-[#1a1a1a]">Payment History</p>
                <p className="font-body text-[11px] text-[#A8B5A0]">View all membership payments</p>
              </div>
              <ArrowRight size={14} className="ml-auto text-[#C0BAB2] group-hover:text-[#203A2B] transition-colors" />
            </Link>
          </div>

          {/* Warnings */}
          {membership.subscription.status === "payment_failed" && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-sm px-5 py-4">
              <AlertCircle size={16} className="text-red-600 shrink-0 mt-0.5" />
              <p className="font-body text-[13px] text-red-700">
                Your last payment failed. Please ensure your payment method is valid — Razorpay will retry automatically.
              </p>
            </div>
          )}
          {membership.subscription.cancelAtPeriodEnd && (
            <div className="flex items-start gap-3 bg-orange-50 border border-orange-200 rounded-sm px-5 py-4">
              <XCircle size={16} className="text-orange-600 shrink-0 mt-0.5" />
              <p className="font-body text-[13px] text-orange-700">
                Your membership is cancelled and will end on{" "}
                <strong>{new Date(membership.subscription.currentPeriodEnd).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</strong>.
              </p>
            </div>
          )}

          {/* Cancel button */}
          {isActive && !membership.subscription.cancelAtPeriodEnd && (
            <div className="pt-2">
              <MembershipCancelButton
                periodEnd={membership.subscription.currentPeriodEnd}
              />
            </div>
          )}

          {/* Upgrade CTA */}
          {membership.plan.slug !== "premium" && (
            <div className="bg-[#1C3325] border border-[#2E5040] rounded-sm px-6 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="font-body text-[10px] font-bold uppercase tracking-[0.2em] text-[#C6A66B] mb-1">Upgrade</p>
                <p className="font-heading text-[18px] font-bold text-[#FFFCF7]">Want more access?</p>
                <p className="font-body text-[12px] text-[#A8B5A0] mt-0.5">Upgrade to unlock more books and downloads.</p>
              </div>
              <Link href="/membership"
                className="shrink-0 inline-flex items-center gap-2 bg-[#C6A66B] text-[#1a1a1a] font-body text-[11px] font-bold uppercase tracking-[0.15em] px-5 py-3 rounded-sm hover:bg-[#d4b47a] transition-colors">
                View Plans <ArrowRight size={11} />
              </Link>
            </div>
          )}
        </>
      )}

      {/* ── Past subscriptions ────────────────────────────────────────── */}
      {allSubs.length > 1 && (
        <div className="bg-[#FFFCF7] border border-[#E6DFD5] rounded-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[#EDEBE6] bg-[#F5EFE6]">
            <h2 className="font-heading text-[17px] font-bold text-[#242824]">Subscription History</h2>
          </div>
          <div className="divide-y divide-[#EDEBE6]">
            {allSubs.slice(0, 10).map((sub) => (
              <div key={sub.id} className="px-5 py-3.5 flex items-center justify-between gap-4">
                <div>
                  <p className="font-body text-[13px] font-semibold text-[#242824]">{sub.planName}</p>
                  <p className="font-body text-[11px] text-[#A8B5A0]">
                    {new Date(sub.startDate).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                    {sub.cancelledAt ? ` — ${new Date(sub.cancelledAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-body text-[12px] font-semibold text-[#203A2B]">{formatINR(sub.pricePaise)}/mo</span>
                  <StatusBadge status={sub.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
