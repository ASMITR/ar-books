import { getSessionUser } from "@/lib/firebase/auth-server";
import { getOrdersByCustomer, getEntitlementsByCustomer } from "@/lib/firebase/firestore";
import { adminDb } from "@/lib/firebase/admin";
import { formatINR } from "@/lib/currency";
import { formatDate } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import {
  BookOpen, ShoppingBag, Banknote, ArrowRight,
  Download, TrendingUp, Gift, Share2,
  CheckCircle2, Clock, Package, Layers,
} from "lucide-react";
import type { Metadata } from "next";
import type { Book } from "@/types";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Overview — My Account" };

export default async function AccountDashboardPage() {
  const user = await getSessionUser();

  const [orders, entitlements, userDoc] = await Promise.all([
    getOrdersByCustomer(user!.uid),
    getEntitlementsByCustomer(user!.uid),
    adminDb.collection("users").doc(user!.uid).get(),
  ]);

  const userData     = userDoc.data();
  const paidOrders   = orders.filter((o) => o.paymentStatus === "paid");
  const totalSpent   = paidOrders.reduce((s, o) => s + o.totalRupees, 0);
  const recentOrders = orders.slice(0, 5);
  const referralCount: number = userData?.referralCount ?? 0;

  const firstName = (user!.displayName ?? user!.email ?? "Reader").split(" ")[0];
  const initials  = firstName.slice(0, 2).toUpperCase();
  const hour      = new Date().getHours();
  const greeting  = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  // Fetch covers for recent entitlements (up to 4)
  const recentEntitlements = entitlements.slice(0, 4);
  let recentBooks: (Book | null)[] = [];
  if (recentEntitlements.length > 0) {
    const refs  = recentEntitlements.map((e) => adminDb.collection("books").doc(e.productId));
    const docs  = await adminDb.getAll(...refs);
    recentBooks = docs.map((d) => (d.exists ? ({ id: d.id, ...d.data() } as Book) : null));
  }

  const statusMap = {
    paid:     { label: "Paid",     cls: "bg-emerald-50 text-emerald-700 border-emerald-200/80" },
    pending:  { label: "Pending",  cls: "bg-amber-50  text-amber-700  border-amber-200/80"    },
    failed:   { label: "Failed",   cls: "bg-red-50    text-red-700    border-red-200/80"      },
    refunded: { label: "Refunded", cls: "bg-gray-50   text-gray-600   border-gray-200/80"     },
  } as const;

  return (
    <div className="flex flex-col gap-4 lg:gap-5">

      {/* ── Top greeting row ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 lg:gap-4 min-w-0">
          {/* Avatar */}
          <div className="shrink-0 w-11 h-11 lg:w-12 lg:h-12 rounded-2xl bg-[#0D1F17] border border-[#FFC928]/20 flex items-center justify-center">
            <span className="font-heading text-[15px] lg:text-[16px] font-bold text-[#FFC928]">{initials}</span>
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-body text-[#B8B3AB] uppercase tracking-[0.2em]">{greeting}</p>
            <h1 className="font-heading text-[20px] sm:text-[24px] lg:text-[26px] font-bold text-[#111] leading-tight truncate">
              {user!.displayName ?? firstName}
            </h1>
          </div>
        </div>
        <Link
          href="/books"
          className="shrink-0 hidden sm:inline-flex items-center gap-2 bg-[#0D1F17] text-white font-body text-[11px] font-bold uppercase tracking-[0.12em] px-4 py-2.5 rounded-2xl hover:bg-[#203A2B] transition-colors"
        >
          <ShoppingBag size={12} /> Browse Books
        </Link>
      </div>

      {/* ── 4 stat cards ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {[
          {
            label: "eBooks Owned",
            value: entitlements.length,
            icon: BookOpen,
            href: "/account/library",
            accent: "#203A2B",
            bg: "#F0F5F2",
            dark: false,
          },
          {
            label: "Total Spent",
            value: formatINR(totalSpent),
            icon: Banknote,
            href: "/account/orders",
            accent: "#0D1F17",
            bg: "#FFC928",
            dark: true,
          },
          {
            label: "Orders",
            value: orders.length,
            icon: Package,
            href: "/account/orders",
            accent: "#6366f1",
            bg: "#EEF2FF",
            dark: false,
          },
          {
            label: "Referrals",
            value: referralCount,
            icon: Share2,
            href: "/account/referral",
            accent: "#d97706",
            bg: "#FFFBEB",
            dark: false,
          },
        ].map(({ label, value, icon: Icon, href, accent, bg, dark }) => (
          <Link
            key={label}
            href={href}
            className="group relative bg-white border border-black/[0.06] hover:border-black/[0.12] hover:shadow-md transition-all duration-200 rounded-3xl p-4 lg:p-5 flex flex-col gap-3 lg:gap-4 overflow-hidden"
          >
            {/* icon */}
            <div
              className="w-9 h-9 rounded-2xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: bg }}
            >
              <Icon size={15} style={{ color: accent }} strokeWidth={2} />
            </div>
            {/* value */}
            <div>
              <p className="font-heading text-[22px] lg:text-[26px] font-bold leading-none tabular-nums text-[#111]">
                {value}
              </p>
              <p className="text-[10px] font-body uppercase tracking-[0.14em] text-[#B8B3AB] mt-1.5">{label}</p>
            </div>
            {/* hover arrow */}
            <ArrowRight
              size={13}
              className="absolute bottom-4 right-4 text-[#E0DDD8] group-hover:text-[#555] group-hover:translate-x-0.5 transition-all"
            />
          </Link>
        ))}
      </div>

      {/* ── Main two-column area ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-5">

        {/* ── Left: Recent orders (2/3 width) ─────────────────────────── */}
        <div className="lg:col-span-2 flex flex-col gap-4 lg:gap-5">

          {/* Recent orders table */}
          <div className="bg-white border border-black/[0.06] rounded-3xl overflow-hidden">
            <div className="px-4 lg:px-5 py-3.5 border-b border-black/[0.05] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 bg-[#F2EFE9] rounded-xl flex items-center justify-center shrink-0">
                  <Clock size={13} className="text-[#203A2B]" strokeWidth={2} />
                </div>
                <h2 className="font-heading text-[14px] font-bold text-[#111]">Recent Orders</h2>
              </div>
              <Link
                href="/account/orders"
                className="inline-flex items-center gap-1 text-[11px] font-body font-semibold text-[#999] hover:text-[#111] transition-colors"
              >
                View all <ArrowRight size={10} />
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <div className="px-6 py-16 flex flex-col items-center gap-3 text-center">
                <div className="w-12 h-12 bg-[#F5F2EE] rounded-2xl flex items-center justify-center">
                  <ShoppingBag size={18} className="text-[#C8C3BC]" strokeWidth={1.5} />
                </div>
                <p className="font-body text-[13px] text-[#999]">No orders yet.</p>
                <Link
                  href="/books"
                  className="text-[11px] font-body font-bold text-[#203A2B] hover:underline inline-flex items-center gap-1"
                >
                  Browse books <ArrowRight size={10} />
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-black/[0.04]">
                {recentOrders.map((order) => {
                  const s = statusMap[order.paymentStatus];
                  return (
                    <Link
                      key={order.id}
                      href={`/account/orders/${order.id}`}
                      className="group px-4 lg:px-5 py-3 flex items-center gap-3 hover:bg-[#FAFAF8] transition-colors"
                    >
                      {/* status dot */}
                      <div className="shrink-0 w-8 h-8 rounded-xl bg-[#F5F2EE] flex items-center justify-center">
                        {order.paymentStatus === "paid"
                          ? <CheckCircle2 size={14} className="text-emerald-500" strokeWidth={2} />
                          : <Clock size={14} className="text-amber-500" strokeWidth={2} />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12.5px] font-mono font-bold text-[#111] truncate">{order.orderNumber}</p>
                        <p className="text-[11px] font-body text-[#B8B3AB] mt-0.5">
                          {formatDate(order.createdAt)} · {order.items.length} {order.items.length === 1 ? "item" : "items"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2.5 shrink-0">
                        <span className={`hidden sm:inline-flex items-center text-[10px] font-body font-bold uppercase tracking-wider border px-2 py-0.5 rounded-full ${s.cls}`}>
                          {s.label}
                        </span>
                        <span className="font-heading text-[14px] font-bold text-[#203A2B] tabular-nums">
                          {formatINR(order.totalRupees)}
                        </span>
                        <ArrowRight size={11} className="text-[#D0CCC6] group-hover:text-[#203A2B] transition-colors" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick actions row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:gap-4">
            {[
              { href: "/account/library",   label: "Library",   icon: BookOpen,   bg: "#F0F5F2", color: "#203A2B" },
              { href: "/account/downloads", label: "Downloads", icon: Download,   bg: "#EEF2FF", color: "#6366f1" },
              { href: "/account/orders",    label: "Orders",    icon: TrendingUp, bg: "#FFFBEB", color: "#d97706" },
              { href: "/account/referral",  label: "Referral",  icon: Gift,       bg: "#FFF0F9", color: "#db2777" },
            ].map(({ href, label, icon: Icon, bg, color }) => (
              <Link
                key={href}
                href={href}
                className="group flex flex-col items-center gap-2 bg-white border border-black/[0.06] hover:border-black/[0.12] hover:shadow-sm transition-all duration-200 rounded-2xl py-3.5 lg:py-4 px-3 text-center"
              >
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ backgroundColor: bg }}>
                  <Icon size={16} style={{ color }} strokeWidth={2} />
                </div>
                <span className="text-[11.5px] font-body font-semibold text-[#555] group-hover:text-[#111] transition-colors">{label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Right: Library shelf (1/3 width) ────────────────────────── */}
        <div className="flex flex-col gap-5">

          {/* Library shelf */}
          <div className="bg-white border border-black/[0.06] rounded-3xl overflow-hidden flex flex-col">
            <div className="px-4 lg:px-5 py-3.5 border-b border-black/[0.05] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 bg-[#F2EFE9] rounded-xl flex items-center justify-center shrink-0">
                  <Layers size={13} className="text-[#203A2B]" strokeWidth={2} />
                </div>
                <h2 className="font-heading text-[14px] font-bold text-[#111]">My Library</h2>
              </div>
              <Link
                href="/account/library"
                className="inline-flex items-center gap-1 text-[11px] font-body font-semibold text-[#999] hover:text-[#111] transition-colors"
              >
                All <ArrowRight size={10} />
              </Link>
            </div>

            {recentBooks.length === 0 ? (
              <div className="px-5 py-12 flex flex-col items-center gap-3 text-center">
                <div className="w-12 h-12 bg-[#F5F2EE] rounded-2xl flex items-center justify-center">
                  <BookOpen size={18} className="text-[#C8C3BC]" strokeWidth={1.5} />
                </div>
                <p className="font-body text-[12px] text-[#999]">No books yet.</p>
                <Link
                  href="/books"
                  className="text-[11px] font-body font-bold text-[#203A2B] hover:underline inline-flex items-center gap-1"
                >
                  Browse books <ArrowRight size={10} />
                </Link>
              </div>
            ) : (
              <div className="p-3 lg:p-4 flex flex-col gap-2.5">
                {recentBooks.map((book, i) => {
                  if (!book) return null;
                  return (
                    <div key={recentEntitlements[i]?.id} className="group flex items-center gap-3 hover:bg-[#FAFAF8] rounded-xl p-2 -mx-2 transition-colors">
                      {/* cover */}
                      <Link href={`/books/${book.slug}`} className="relative w-9 h-[52px] shrink-0 rounded-xl overflow-hidden bg-[#0D1F17] shadow-sm">
                        {book.coverImageUrl ? (
                          <Image src={book.coverImageUrl} alt={book.title} fill className="object-cover" sizes="36px" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <BookOpen size={10} className="text-white/30" strokeWidth={1.5} />
                          </div>
                        )}
                      </Link>
                      <Link href={`/books/${book.slug}`} className="flex-1 min-w-0">
                        <p className="text-[12.5px] font-body font-semibold text-[#111] group-hover:text-[#203A2B] transition-colors line-clamp-2 leading-snug">
                          {book.title}
                        </p>
                        <p className="text-[10.5px] font-body text-[#B8B3AB] mt-0.5 truncate">{book.author}</p>
                      </Link>
                      <a
                        href={`/api/downloads/secure?bookId=${book.id}`}
                        className="shrink-0 w-7 h-7 rounded-xl bg-[#F2EFE9] hover:bg-[#0D1F17] flex items-center justify-center transition-colors group/dl"
                      >
                        <Download size={11} className="text-[#203A2B] group-hover/dl:text-[#FFC928] transition-colors" strokeWidth={2} />
                      </a>
                    </div>
                  );
                })}

                {entitlements.length > 4 && (
                  <Link
                    href="/account/library"
                    className="mt-1 text-center text-[11px] font-body font-semibold text-[#999] hover:text-[#111] transition-colors py-1"
                  >
                    +{entitlements.length - 4} more books
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Referral nudge card */}
          <div className="relative bg-[#0D1F17] rounded-3xl p-4 lg:p-5 overflow-hidden">
            <div className="pointer-events-none absolute -top-6 -right-6 w-32 h-32 rounded-full bg-[#FFC928]/[0.08] blur-2xl" />
            <div className="relative z-10 flex flex-col gap-3">
              <div className="w-9 h-9 rounded-2xl bg-[#FFC928]/10 border border-[#FFC928]/20 flex items-center justify-center">
                <Gift size={15} className="text-[#FFC928]" strokeWidth={2} />
              </div>
              <div>
                <p className="font-heading text-[14px] font-bold text-white leading-snug">
                  Refer friends,<br />earn rewards
                </p>
                <p className="font-body text-[11px] text-white/30 mt-1.5 leading-relaxed">
                  Get 10% off for every friend who signs up with your link.
                </p>
              </div>
              <Link
                href="/account/referral"
                className="inline-flex items-center gap-1.5 text-[11px] font-body font-bold text-[#FFC928] hover:text-white transition-colors"
              >
                Get your link <ArrowRight size={10} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
