import { getSessionUser } from "@/lib/firebase/auth-server";
import { getOrdersByCustomer, getEntitlementsByCustomer } from "@/lib/firebase/firestore";
import { formatINR } from "@/lib/currency";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { BookOpen, ShoppingBag, Banknote, ArrowRight, Download, Library, TrendingUp } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard — My Account" };

export default async function AccountDashboardPage() {
  const user = await getSessionUser();
  const [orders, entitlements] = await Promise.all([
    getOrdersByCustomer(user!.uid),
    getEntitlementsByCustomer(user!.uid),
  ]);

  const paidOrders = orders.filter((o) => o.paymentStatus === "paid");
  const totalSpent = paidOrders.reduce((s, o) => s + o.totalPaise, 0);
  const recentOrders = paidOrders.slice(0, 5);
  const firstName = (user!.displayName ?? user!.email ?? "Reader").split(" ")[0];

  const stats = [
    { label: "eBooks Owned",  value: entitlements.length,   icon: BookOpen,    href: "/account/library" },
    { label: "Paid Orders",   value: paidOrders.length,     icon: ShoppingBag, href: "/account/orders"  },
    { label: "Total Spent",   value: formatINR(totalSpent), icon: Banknote,    href: "/account/orders"  },
    { label: "All Orders",    value: orders.length,         icon: TrendingUp,  href: "/account/orders"  },
  ];

  return (
    <div className="flex flex-col gap-6">

      {/* Greeting */}
      <div className="rounded-2xl bg-[#0D1F17] px-7 py-7 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-full opacity-[0.04] pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle at 80% 50%, #FFC928 0%, transparent 70%)" }} />
        <p className="text-[10px] font-body uppercase tracking-[0.3em] text-white/30 mb-2">Welcome back</p>
        <h1 className="font-heading text-[30px] sm:text-[36px] font-bold text-white leading-none">
          Hello, <span className="text-[#FFC928]">{firstName}</span>
        </h1>
        <p className="font-body text-[13px] text-white/35 mt-2.5 mb-5">Here&apos;s a summary of your reading activity.</p>
        <Link href="/account/library"
          className="inline-flex items-center gap-2 bg-[#FFC928] text-[#0D1F17] font-body text-[11px] font-bold uppercase tracking-[0.14em] px-4 py-2.5 rounded-xl hover:bg-[#FFD54F] transition-colors">
          <Library size={12} /> My Library
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map(({ label, value, icon: Icon, href }) => (
          <Link key={label} href={href}
            className="group bg-white border border-black/[0.06] hover:border-black/[0.1] hover:shadow-sm transition-all duration-200 p-4 sm:p-5 rounded-2xl flex flex-col gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#F2EFE9] flex items-center justify-center shrink-0">
              <Icon size={14} className="text-[#203A2B]" strokeWidth={2} />
            </div>
            <div>
              <p className="font-heading text-[26px] sm:text-[30px] font-bold leading-none tabular-nums text-[#0D1F17]">{value}</p>
              <p className="text-[10px] font-body uppercase tracking-[0.14em] text-[#B8B3AB] mt-1.5">{label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent purchases */}
      <div className="bg-white border border-black/[0.06] rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-black/[0.05] flex items-center justify-between">
          <h2 className="font-heading text-[15px] font-bold text-[#111]">Recent Purchases</h2>
          <Link href="/account/orders"
            className="inline-flex items-center gap-1 text-[11.5px] font-body font-semibold text-[#999] hover:text-[#111] transition-colors">
            View all <ArrowRight size={11} />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="px-5 py-14 text-center flex flex-col items-center gap-3">
            <div className="w-11 h-11 bg-[#F5F2EE] rounded-2xl flex items-center justify-center">
              <ShoppingBag size={17} className="text-[#C8C3BC]" strokeWidth={1.5} />
            </div>
            <div>
              <p className="font-body text-[13.5px] font-semibold text-[#333]">No purchases yet</p>
              <p className="font-body text-[12px] text-[#999] mt-0.5">Your orders will appear here after purchase.</p>
            </div>
            <Link href="/books"
              className="inline-flex items-center gap-1.5 text-[11.5px] font-body font-bold text-[#203A2B] hover:underline mt-1">
              Browse books <ArrowRight size={11} />
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-black/[0.04]">
            {recentOrders.map((order) => (
              <Link key={order.id} href={`/account/orders/${order.id}`}
                className="group px-5 py-3.5 flex items-center justify-between gap-3 hover:bg-[#FAFAF8] transition-colors">
                <div className="min-w-0">
                  <p className="text-[13px] font-body font-semibold text-[#111] font-mono tracking-tight truncate">{order.orderNumber}</p>
                  <p className="text-[11px] font-body text-[#B8B3AB] mt-0.5">
                    {formatDate(order.createdAt)} · {order.items.length} {order.items.length === 1 ? "book" : "books"}
                  </p>
                </div>
                <div className="flex items-center gap-2.5 shrink-0">
                  <span className="font-heading text-[15px] font-bold text-[#203A2B] tabular-nums">{formatINR(order.totalPaise)}</span>
                  <ArrowRight size={12} className="text-[#D0CCC6] group-hover:text-[#203A2B] transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          { href: "/account/library",   label: "My Library",   sub: "All your purchased books",  icon: Library,     dark: true  },
          { href: "/books",             label: "Browse Books", sub: "Discover new titles",        icon: ShoppingBag, dark: false },
          { href: "/account/downloads", label: "Downloads",    sub: "Re-download your files",     icon: Download,    dark: false },
          { href: "/account/orders",    label: "My Orders",    sub: "View full order history",    icon: ShoppingBag, dark: false },
        ].map(({ href, label, sub, icon: Icon, dark }) => (
          <Link key={href} href={href}
            className={`group flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-200 border ${
              dark ? "bg-[#0D1F17] border-transparent hover:bg-[#162a1c]"
                   : "bg-white border-black/[0.06] hover:border-black/[0.1] hover:shadow-sm"
            }`}>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${dark ? "bg-white/[0.07]" : "bg-[#F2EFE9]"}`}>
              <Icon size={14} className={dark ? "text-[#FFC928]" : "text-[#203A2B]"} strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <p className={`font-body text-[13px] font-bold ${dark ? "text-white" : "text-[#111]"}`}>{label}</p>
              <p className={`font-body text-[11.5px] mt-0.5 ${dark ? "text-white/35" : "text-[#999]"}`}>{sub}</p>
            </div>
            <ArrowRight size={13} className={`shrink-0 transition-colors ${dark ? "text-white/15 group-hover:text-[#FFC928]" : "text-[#D0CCC6] group-hover:text-[#203A2B]"}`} />
          </Link>
        ))}
      </div>

    </div>
  );
}
