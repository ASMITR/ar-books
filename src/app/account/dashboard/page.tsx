import { getSessionUser } from "@/lib/firebase/auth-server";
import { getOrdersByCustomer, getEntitlementsByCustomer } from "@/lib/firebase/firestore";
import { formatINR } from "@/lib/currency";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import {
  BookOpen, ShoppingBag, Banknote, Library,
  ArrowRight, Download, TrendingUp,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard — My Account" };

export default async function AccountDashboardPage() {
  const user = await getSessionUser();
  const [orders, entitlements] = await Promise.all([
    getOrdersByCustomer(user!.uid),
    getEntitlementsByCustomer(user!.uid),
  ]);

  const paidOrders  = orders.filter((o) => o.paymentStatus === "paid");
  const totalSpent  = paidOrders.reduce((s, o) => s + o.totalPaise, 0);
  const recentOrders = paidOrders.slice(0, 5);
  const firstName   = (user!.displayName ?? user!.email ?? "Reader").split(" ")[0];

  const stats = [
    {
      label: "eBooks Owned",
      value: entitlements.length,
      icon: BookOpen,
      accent: "#203A2B",
      href: "/account/library",
    },
    {
      label: "Completed Orders",
      value: paidOrders.length,
      icon: ShoppingBag,
      accent: "#315B55",
      href: "/account/orders",
    },
    {
      label: "Total Spent",
      value: formatINR(totalSpent),
      icon: Banknote,
      accent: "#C6A66B",
      href: "/account/orders",
    },
    {
      label: "All Orders",
      value: orders.length,
      icon: TrendingUp,
      accent: "#789185",
      href: "/account/orders",
    },
  ];

  return (
    <div className="flex flex-col gap-7">

      {/* ── Greeting ──────────────────────────────────────────────────────── */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-body uppercase tracking-[0.25em] text-[#A8B5A0] mb-1">
            Welcome back
          </p>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-[#080808] leading-none">
            Hello, <span className="text-[#203A2B]">{firstName}</span>
          </h1>
          <p className="font-body text-sm text-[#777777] mt-2">
            Here&apos;s a summary of your reading activity.
          </p>
        </div>
        <Link
          href="/account/library"
          className="hidden sm:flex items-center gap-2 bg-[#203A2B] text-[#FFFCF7] font-body text-[11px] font-bold uppercase tracking-[0.12em] px-5 py-2.5 hover:bg-[#315B55] transition-colors shrink-0"
        >
          <Library size={13} />
          My Library
        </Link>
      </div>

      {/* ── Stat cards ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map(({ label, value, icon: Icon, accent, href }) => (
          <Link
            key={label}
            href={href}
            className="group bg-white border border-[#E6DFD5] hover:border-[#C6A66B] hover:shadow-md transition-all duration-200 p-5 flex flex-col gap-3"
          >
            <div
              className="w-9 h-9 flex items-center justify-center shrink-0"
              style={{ backgroundColor: accent + "18" }}
            >
              <Icon size={16} style={{ color: accent }} strokeWidth={2} />
            </div>
            <div>
              <p
                className="font-heading text-2xl sm:text-3xl font-bold leading-none tabular-nums"
                style={{ color: accent }}
              >
                {value}
              </p>
              <p className="text-[11px] font-body uppercase tracking-[0.15em] text-[#A8B5A0] mt-1">
                {label}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* ── Recent purchases ──────────────────────────────────────────────── */}
      <div className="bg-white border border-[#E6DFD5]">
        <div className="px-5 py-4 border-b border-[#E6DFD5] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag size={14} className="text-[#203A2B]" strokeWidth={2} />
            <h2 className="font-heading text-base font-semibold text-[#080808]">Recent Purchases</h2>
          </div>
          <Link
            href="/account/orders"
            className="text-[11px] font-body text-[#789185] hover:text-[#203A2B] flex items-center gap-1 transition-colors"
          >
            View all <ArrowRight size={11} />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="px-5 py-10 text-center flex flex-col items-center gap-3">
            <ShoppingBag size={28} className="text-[#E6DFD5]" strokeWidth={1.5} />
            <div>
              <p className="font-body text-sm text-[#555]">No purchases yet.</p>
              <Link href="/books" className="text-[11px] font-body text-[#203A2B] underline underline-offset-2 hover:text-[#315B55]">
                Browse books
              </Link>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-[#F0EEE9]">
            {recentOrders.map((order) => (
              <div key={order.id} className="px-5 py-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[13px] font-body font-semibold text-[#080808] font-mono tracking-tight">
                    {order.orderNumber}
                  </p>
                  <p className="text-[11px] font-body text-[#A8B5A0] mt-0.5">
                    {formatDate(order.createdAt)} · {order.items.length} {order.items.length === 1 ? "book" : "books"}
                  </p>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <span className="font-heading text-base font-bold text-[#203A2B] tabular-nums">
                    {formatINR(order.totalPaise)}
                  </span>
                  <Link
                    href={`/account/orders/${order.id}`}
                    className="text-[11px] font-body text-[#789185] hover:text-[#203A2B] flex items-center gap-1 transition-colors"
                  >
                    Details <ArrowRight size={11} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Quick actions ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Link
          href="/account/library"
          className="group flex items-center gap-4 bg-[#203A2B] px-5 py-4 hover:bg-[#315B55] transition-colors"
        >
          <div className="w-9 h-9 bg-[#FFFCF7]/10 flex items-center justify-center shrink-0">
            <Library size={16} className="text-[#FFC928]" strokeWidth={2} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-body text-[11px] font-bold uppercase tracking-[0.1em] text-[#FFFCF7]">My Library</p>
            <p className="font-body text-[11px] text-[#A8B5A0] mt-0.5">All your books in one place</p>
          </div>
          <ArrowRight size={14} className="text-[#A8B5A0] group-hover:text-[#FFC928] transition-colors shrink-0" />
        </Link>

        <Link
          href="/books"
          className="group flex items-center gap-4 bg-white border border-[#E6DFD5] px-5 py-4 hover:border-[#C6A66B] transition-colors"
        >
          <div className="w-9 h-9 bg-[#FAF9F6] flex items-center justify-center shrink-0">
            <ShoppingBag size={16} className="text-[#203A2B]" strokeWidth={2} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-body text-[11px] font-bold uppercase tracking-[0.1em] text-[#242824]">Browse Books</p>
            <p className="font-body text-[11px] text-[#777970] mt-0.5">Discover more titles</p>
          </div>
          <ArrowRight size={14} className="text-[#D0CEC9] group-hover:text-[#203A2B] transition-colors shrink-0" />
        </Link>

        <Link
          href="/account/downloads"
          className="group flex items-center gap-4 bg-white border border-[#E6DFD5] px-5 py-4 hover:border-[#C6A66B] transition-colors"
        >
          <div className="w-9 h-9 bg-[#FAF9F6] flex items-center justify-center shrink-0">
            <Download size={16} className="text-[#203A2B]" strokeWidth={2} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-body text-[11px] font-bold uppercase tracking-[0.1em] text-[#242824]">Download History</p>
            <p className="font-body text-[11px] text-[#777970] mt-0.5">Re-download your files</p>
          </div>
          <ArrowRight size={14} className="text-[#D0CEC9] group-hover:text-[#203A2B] transition-colors shrink-0" />
        </Link>

        <Link
          href="/account/orders"
          className="group flex items-center gap-4 bg-white border border-[#E6DFD5] px-5 py-4 hover:border-[#C6A66B] transition-colors"
        >
          <div className="w-9 h-9 bg-[#FAF9F6] flex items-center justify-center shrink-0">
            <ShoppingBag size={16} className="text-[#203A2B]" strokeWidth={2} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-body text-[11px] font-bold uppercase tracking-[0.1em] text-[#242824]">My Orders</p>
            <p className="font-body text-[11px] text-[#777970] mt-0.5">View order history</p>
          </div>
          <ArrowRight size={14} className="text-[#D0CEC9] group-hover:text-[#203A2B] transition-colors shrink-0" />
        </Link>
      </div>

    </div>
  );
}
