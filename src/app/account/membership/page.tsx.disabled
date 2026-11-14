import { getSessionUser } from "@/lib/firebase/auth-server";
import { getActiveMembershipForCustomer, getAllSubscriptionsForCustomer } from "@/lib/firebase/subscriptions";
import { formatINR } from "@/lib/currency";
import Link from "next/link";
import { ArrowRight, BookOpen, Download, CheckCircle, AlertCircle, XCircle, Clock, Library, CreditCard } from "lucide-react";
import { MembershipCancelButton } from "@/components/membership/MembershipCancelButton";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "My Membership — Account" };

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    active:         { label: "Active",         cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    authenticated:  { label: "Activating",     cls: "bg-blue-50 text-blue-700 border-blue-200"          },
    cancelled:      { label: "Cancelled",      cls: "bg-orange-50 text-orange-700 border-orange-200"    },
    payment_failed: { label: "Payment Failed", cls: "bg-red-50 text-red-700 border-red-200"             },
    past_due:       { label: "Past Due",       cls: "bg-yellow-50 text-yellow-700 border-yellow-200"    },
    expired:        { label: "Expired",        cls: "bg-[#F5F2EE] text-[#777] border-black/[0.08]"      },
    halted:         { label: "Halted",         cls: "bg-red-50 text-red-700 border-red-200"             },
  };
  const { label, cls } = map[status] ?? { label: status, cls: "bg-[#F5F2EE] text-[#777] border-black/[0.08]" };
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

      {/* Page header */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-body uppercase tracking-[0.28em] text-[#B8B3AB] mb-1.5">Account</p>
          <h1 className="font-heading text-[28px] sm:text-[32px] font-bold text-[#111] leading-none">My Membership</h1>
          <p className="font-body text-[13px] text-[#999] mt-2">
            {isActive ? "Manage your subscription and benefits." : "Subscribe to unlock our curated eBook library."}
          </p>
        </div>
        <Link href="/membership"
          className="hidden sm:inline-flex items-center gap-2 bg-[#0D1F17] text-white font-body text-[11px] font-bold uppercase tracking-[0.12em] px-5 py-2.5 rounded-xl hover:bg-[#203A2B] transition-colors shrink-0">
          <Library size={13} />
          {isActive ? "View Plans" : "Explore Plans"}
        </Link>
      </div>

      {/* No subscription */}
      {!membership && (
        <div className="bg-white border border-black/[0.06] rounded-2xl p-8 flex flex-col items-center text-center gap-5">
          <div className="w-12 h-12 bg-[#F2EFE9] rounded-2xl flex items-center justify-center">
            <Library size={22} className="text-[#B8B3AB]" strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="font-heading text-xl font-bold text-[#111] mb-2">No Active Membership</h2>
            <p className="font-body text-[13px] text-[#999] leading-relaxed max-w-sm">
              Subscribe to get monthly access to our curated eBook library starting at ₹199/month.
            </p>
          </div>
          <Link href="/membership"
            className="inline-flex items-center gap-2 bg-[#0D1F17] text-white font-body text-[11px] font-bold uppercase tracking-[0.15em] px-7 py-3 rounded-xl hover:bg-[#203A2B] transition-colors">
            Explore Membership Plans <ArrowRight size={12} />
          </Link>
        </div>
      )}

      {/* Active membership */}
      {membership && (
        <>
          {/* Status card */}
          <div className="bg-white border border-black/[0.06] rounded-2xl overflow-hidden">
            <div className={`h-[3px] ${isActive ? "bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-500" : "bg-black/[0.06]"}`} />

            <div className="px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-5">
              <div className="flex flex-col gap-1 flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-heading text-[20px] font-bold text-[#111]">{membership.plan.name} Membership</span>
                  <StatusBadge status={membership.subscription.status} />
                </div>
                <p className="font-body text-[13px] text-[#999]">{formatINR(membership.subscription.pricePaise)}/month · billed monthly</p>
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

            <div className="border-t border-black/[0.05] grid grid-cols-2 sm:grid-cols-4 divide-x divide-black/[0.05]">
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
                    <Icon size={11} className="text-[#B8B3AB]" strokeWidth={1.8} />
                    <span className="font-body text-[9px] uppercase tracking-[0.15em] text-[#B8B3AB]">{label}</span>
                  </div>
                  <span className="font-body text-[13px] font-semibold text-[#111]">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Benefits */}
          <div className="bg-white border border-black/[0.06] rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-black/[0.05]">
              <h2 className="font-heading text-[15px] font-bold text-[#111]">Your {membership.plan.name} Benefits</h2>
            </div>
            <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {membership.plan.benefits.map((benefit) => (
                <div key={benefit} className="flex items-start gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle size={9} strokeWidth={3} className="text-emerald-600" />
                  </div>
                  <span className="font-body text-[12px] text-[#555] leading-snug">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link href="/account/membership/library"
              className="group flex items-center gap-4 bg-white border border-black/[0.06] rounded-2xl p-5 hover:border-black/[0.1] hover:shadow-sm transition-all">
              <div className="w-9 h-9 bg-[#F2EFE9] rounded-xl flex items-center justify-center shrink-0">
                <BookOpen size={16} className="text-[#203A2B]" strokeWidth={1.5} />
              </div>
              <div>
                <p className="font-body text-[13px] font-bold text-[#111]">Member Library</p>
                <p className="font-body text-[11px] text-[#B8B3AB]">Browse your accessible eBooks</p>
              </div>
              <ArrowRight size={14} className="ml-auto text-[#D0CCC6] group-hover:text-[#203A2B] transition-colors" />
            </Link>
            <Link href="/account/membership/payments"
              className="group flex items-center gap-4 bg-white border border-black/[0.06] rounded-2xl p-5 hover:border-black/[0.1] hover:shadow-sm transition-all">
              <div className="w-9 h-9 bg-[#F2EFE9] rounded-xl flex items-center justify-center shrink-0">
                <CreditCard size={16} className="text-[#203A2B]" strokeWidth={1.5} />
              </div>
              <div>
                <p className="font-body text-[13px] font-bold text-[#111]">Payment History</p>
                <p className="font-body text-[11px] text-[#B8B3AB]">View all membership payments</p>
              </div>
              <ArrowRight size={14} className="ml-auto text-[#D0CCC6] group-hover:text-[#203A2B] transition-colors" />
            </Link>
          </div>

          {membership.subscription.status === "payment_failed" && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl px-5 py-4">
              <AlertCircle size={16} className="text-red-600 shrink-0 mt-0.5" />
              <p className="font-body text-[13px] text-red-700">Your last payment failed. Please ensure your payment method is valid — Razorpay will retry automatically.</p>
            </div>
          )}
          {membership.subscription.cancelAtPeriodEnd && (
            <div className="flex items-start gap-3 bg-orange-50 border border-orange-200 rounded-2xl px-5 py-4">
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

          {membership.plan.slug !== "premium" && (
            <div className="bg-[#0D1F17] border border-[#203A2B] rounded-2xl px-6 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="font-body text-[10px] font-bold uppercase tracking-[0.2em] text-[#FFC928]/70 mb-1">Upgrade</p>
                <p className="font-heading text-[18px] font-bold text-white">Want more access?</p>
                <p className="font-body text-[12px] text-white/40 mt-0.5">Upgrade to unlock more books and downloads.</p>
              </div>
              <Link href="/membership"
                className="shrink-0 inline-flex items-center gap-2 bg-[#FFC928] text-[#0D1F17] font-body text-[11px] font-bold uppercase tracking-[0.15em] px-5 py-3 rounded-xl hover:bg-[#FFD54F] transition-colors">
                View Plans <ArrowRight size={11} />
              </Link>
            </div>
          )}
        </>
      )}

      {/* ── Past subscriptions ────────────────────────────────────────── */}
      {allSubs.length > 1 && (
        <div className="bg-white border border-black/[0.06] rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-black/[0.05]">
            <h2 className="font-heading text-[15px] font-bold text-[#111]">Subscription History</h2>
          </div>
          <div className="divide-y divide-black/[0.04]">
            {allSubs.slice(0, 10).map((sub) => (
              <div key={sub.id} className="px-5 py-3.5 flex items-center justify-between gap-4">
                <div>
                  <p className="font-body text-[13px] font-semibold text-[#111]">{sub.planName}</p>
                  <p className="font-body text-[11px] text-[#B8B3AB]">
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
