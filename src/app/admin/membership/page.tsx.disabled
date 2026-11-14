import { adminDb } from "@/lib/firebase/admin";
import { AdminShell } from "@/components/admin/AdminShell";
import { getAllMembershipPlans } from "@/lib/firebase/subscriptions";
import { formatINR } from "@/lib/currency";
import Link from "next/link";
import {
  Users, TrendingUp, CreditCard, AlertCircle,
  XCircle, BookOpen, ArrowRight, Settings,
} from "lucide-react";
import { AdminButton } from "@/components/admin/AdminButton";
import type { Metadata } from "next";
import type { MembershipSubscription } from "@/types/subscription";

export const dynamic   = "force-dynamic";
export const metadata: Metadata = { title: "Membership — Admin" };

const statusStyles: Record<string, string> = {
  active:         "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  authenticated:  "bg-blue-50 text-blue-600 ring-1 ring-blue-200",
  cancelled:      "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  payment_failed: "bg-rose-50 text-rose-600 ring-1 ring-rose-200",
  halted:         "bg-rose-50 text-rose-600 ring-1 ring-rose-200",
  expired:        "bg-slate-50 text-slate-500 ring-1 ring-slate-200",
  created:        "bg-slate-50 text-slate-500 ring-1 ring-slate-200",
  pending:        "bg-amber-50 text-amber-600 ring-1 ring-amber-200",
};

export default async function AdminMembershipPage() {
  const [plans, subsSnap, paymentsSnap] = await Promise.all([
    getAllMembershipPlans(),
    adminDb.collection("membershipSubscriptions").orderBy("createdAt", "desc").get(),
    adminDb.collection("subscriptionPayments").where("status", "==", "captured").get(),
  ]);

  const subs = subsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as MembershipSubscription));
  const active    = subs.filter((s) => s.status === "active" || s.status === "authenticated");
  const cancelled = subs.filter((s) => s.status === "cancelled");
  const failed    = subs.filter((s) => s.status === "payment_failed" || s.status === "halted");
  const mrrPaise  = active.reduce((sum, s) => sum + s.pricePaise, 0);
  const totalCollectedPaise = paymentsSnap.docs.reduce((sum, d) => sum + (d.data().amountPaise ?? 0), 0);

  const byPlan: Record<string, number> = {};
  for (const s of active) byPlan[s.planSlug] = (byPlan[s.planSlug] ?? 0) + 1;

  const stats = [
    { label: "Total Subscribers",  value: subs.length,          icon: Users,       accent: "#789185", bg: "#789185" },
    { label: "Active Members",     value: active.length,         icon: TrendingUp,  accent: "#16a34a", bg: "#16a34a" },
    { label: "Monthly Recurring",  value: formatINR(mrrPaise),   icon: CreditCard,  accent: "#080808", bg: "#FFC928" },
    { label: "Total Collected",    value: formatINR(totalCollectedPaise), icon: CreditCard, accent: "#6366f1", bg: "#6366f1" },
    { label: "Cancelled",          value: cancelled.length,      icon: XCircle,     accent: "#94a3b8", bg: "#94a3b8" },
    { label: "Payment Failures",   value: failed.length,         icon: AlertCircle, accent: "#dc2626", bg: "#dc2626" },
  ];

  const recentSubs = subs.slice(0, 8);

  return (
    <AdminShell
      title="Membership"
      subtitle={`${active.length} active member${active.length !== 1 ? "s" : ""}`}
      action={
        <Link href="/admin/membership/plans">
          <AdminButton icon={<Settings size={14} />}>Manage Plans</AdminButton>
        </Link>
      }
    >
      <div className="space-y-6">

        {/* ── Stats ──────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {stats.map(({ label, value, icon: Icon, accent, bg }) => (
            <div key={label} className="bg-white rounded-xl border border-[#E6E3DD] p-4 sm:p-5 flex items-center gap-3 sm:gap-4 shadow-sm">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: bg + "18" }}>
                <Icon size={18} style={{ color: accent }} />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-body font-semibold uppercase tracking-[0.07em] text-[#b0aca6] leading-none mb-1.5">{label}</p>
                <p className="font-heading text-[18px] sm:text-[22px] font-bold text-[#080808] leading-none">{value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">

          {/* ── Recent subscribers ─────────────────────────────────────── */}
          <div className="lg:col-span-2 bg-white border border-[#E6E3DD] rounded-xl overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#EDE9E3]">
              <h2 className="font-heading text-[15px] font-bold text-[#080808] tracking-tight">Recent Subscribers</h2>
              <Link href="/admin/membership/subscriptions"
                className="text-[12.5px] font-body text-[#789185] hover:text-[#080808] font-semibold transition-colors">
                View all →
              </Link>
            </div>
            {recentSubs.length === 0 ? (
              <div className="py-16 text-center">
                <Users size={28} className="text-[#ddd] mx-auto mb-3" />
                <p className="text-[14px] font-body text-[#bbb]">No subscribers yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full font-body min-w-[520px]">
                  <thead>
                    <tr className="border-b border-[#EDE9E3] bg-[#FAF9F6]">
                      {["Customer", "Plan", "Amount", "Started", "Status"].map((h) => (
                        <th key={h} className="text-left px-5 py-3 text-[11px] uppercase tracking-[0.07em] text-[#b0aca6] font-semibold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F2F0EC]">
                    {recentSubs.map((sub) => (
                      <tr key={sub.id} className="hover:bg-[#FAF9F6] transition-colors">
                        <td className="px-5 py-3 max-w-[180px]">
                          <p className="text-[13px] font-semibold text-[#080808] truncate">{sub.customerEmail}</p>
                        </td>
                        <td className="px-5 py-3 text-[13px] text-[#666]">{sub.planName}</td>
                        <td className="px-5 py-3 text-[13px] font-semibold text-[#080808]">{formatINR(sub.pricePaise)}/mo</td>
                        <td className="px-5 py-3 text-[#aaa] whitespace-nowrap text-[13px]">
                          {new Date(sub.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </td>
                        <td className="px-5 py-3">
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

          {/* ── Right column ───────────────────────────────────────────── */}
          <div className="flex flex-col gap-4">

            {/* Active by plan */}
            <div className="bg-white border border-[#E6E3DD] rounded-xl overflow-hidden shadow-sm">
              <div className="px-5 py-4 border-b border-[#EDE9E3]">
                <h2 className="font-heading text-[15px] font-bold text-[#080808] tracking-tight">Active by Plan</h2>
              </div>
              <div className="p-2">
                {plans.filter((p) => p.active).map((plan) => (
                  <div key={plan.id} className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-[#FAF9F6] transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-[#203A2B]" />
                      <span className="text-[13.5px] font-body text-[#555] font-medium">{plan.name}</span>
                    </div>
                    <span className="font-heading text-[16px] font-bold text-[#080808]">{byPlan[plan.slug] ?? 0}</span>
                  </div>
                ))}
                {plans.length === 0 && (
                  <p className="px-3 py-4 text-[13px] font-body text-[#bbb] text-center">No plans yet.</p>
                )}
              </div>
            </div>

            {/* Quick links */}
            <div className="bg-white border border-[#E6E3DD] rounded-xl overflow-hidden shadow-sm">
              <div className="px-5 py-4 border-b border-[#EDE9E3]">
                <h2 className="font-heading text-[15px] font-bold text-[#080808] tracking-tight">Quick Actions</h2>
              </div>
              <div className="p-2">
                {[
                  { href: "/admin/membership/plans",         label: "Manage Plans",       Icon: Settings   },
                  { href: "/admin/membership/subscriptions", label: "All Subscribers",    Icon: Users      },
                  { href: "/admin/books",                    label: "Configure Book Access", Icon: BookOpen },
                  { href: "/membership",                     label: "View Pricing Page",  Icon: ArrowRight },
                ].map(({ href, label, Icon }) => (
                  <Link key={href} href={href}
                    className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-[#FAF9F6] transition-colors group">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-[#789185]/10">
                      <Icon size={15} className="text-[#789185]" />
                    </div>
                    <span className="text-[13.5px] font-body text-[#555] group-hover:text-[#080808] font-medium">{label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
