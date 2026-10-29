"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Trash2, ShoppingCart, ArrowRight, ArrowLeft, BookOpen, Shield, Zap } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { formatINR } from "@/lib/currency";

export default function CartPage() {
  const { items, removeItem, totalPaise } = useCart();
  const requireAuth = useRequireAuth();
  const router = useRouter();

  const handleCheckout = () => {
    if (!requireAuth()) return;
    router.push("/checkout");
  };

  return (
    <div className="bg-[#FAF9F6] min-h-screen">
      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <div className="border-b border-[#E9E7E2] bg-[#FFFCF7]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-body uppercase tracking-[0.25em] text-[#789185] mb-1.5">
                Your Selection
              </p>
              <h1 className="font-heading text-3xl sm:text-4xl font-bold text-[#080808] leading-none">
                Shopping Cart
                {items.length > 0 && (
                  <span className="ml-3 text-xl text-[#789185] font-normal align-middle">
                    {items.length} {items.length === 1 ? "item" : "items"}
                  </span>
                )}
              </h1>
            </div>
            {items.length > 0 && (
              <Link
                href="/books"
                className="hidden sm:inline-flex items-center gap-1.5 border border-[#E6DFD5] text-[#555] font-body text-[11px] font-semibold uppercase tracking-[0.1em] px-3.5 py-2 hover:border-[#789185] hover:text-[#203A2B] transition-colors shrink-0"
              >
                <ArrowLeft size={12} /> Continue Shopping
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        {items.length === 0 ? (
          /* ── Empty State ──────────────────────────────────────────────── */
          <div className="flex flex-col items-center justify-center py-24 gap-6 text-center max-w-sm mx-auto">
            <div className="w-20 h-20 bg-[#E9E7E2] flex items-center justify-center">
              <ShoppingCart size={28} className="text-[#aaa]" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="font-heading text-2xl font-bold text-[#080808] mb-2">Your cart is empty</h2>
              <p className="font-body text-[#777777] text-sm leading-relaxed">
                Browse the collection and add something that speaks to you.
              </p>
            </div>
            <Link
              href="/books"
              className="inline-flex items-center gap-2.5 bg-[#203A2B] text-[#FFFCF7] font-body text-[11px] font-bold uppercase tracking-[0.15em] px-8 py-3.5 hover:bg-[#315B55] transition-colors"
            >
              Explore Books <ArrowRight size={13} />
            </Link>
          </div>
        ) : (
          /* ── Cart Layout ──────────────────────────────────────────────── */
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 xl:gap-12 items-start">

            {/* ── Left: Item List ──────────────────────────────────────── */}
            <div className="flex flex-col gap-2">

              {/* Column headers — desktop only */}
              <div className="hidden sm:grid grid-cols-[1fr_auto_auto] gap-4 px-4 pb-2 border-b border-[#E9E7E2]">
                <span className="text-[10px] font-body uppercase tracking-[0.15em] text-[#999]">Book</span>
                <span className="text-[10px] font-body uppercase tracking-[0.15em] text-[#999] text-right w-20">Price</span>
                <span className="text-[10px] font-body uppercase tracking-[0.15em] text-[#999] text-right w-16">Remove</span>
              </div>

              {items.map((item) => (
                <div
                  key={item.bookId}
                  className="bg-white border border-[#E9E7E2] hover:border-[#789185] hover:shadow-sm transition-all duration-200 group"
                >
                  <div className="flex gap-4 p-4 sm:p-5">
                    {/* Cover */}
                    <Link href={`/books/${item.slug}`} className="relative w-[56px] h-[80px] sm:w-[64px] sm:h-[92px] shrink-0 overflow-hidden bg-[#F5EFE6]">
                      {item.coverImageUrl ? (
                        <Image
                          src={item.coverImageUrl}
                          alt={item.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen size={20} className="text-[#789185]/50" strokeWidth={1.5} />
                        </div>
                      )}
                    </Link>

                    {/* Content */}
                    <div className="flex flex-1 flex-col justify-between min-w-0 py-0.5">
                      <div className="pr-2">
                        <Link
                          href={`/books/${item.slug}`}
                          className="font-heading text-base sm:text-[17px] font-bold text-[#080808] hover:text-[#203A2B] transition-colors line-clamp-2 leading-snug"
                        >
                          {item.title}
                        </Link>
                        <p className="text-[11px] font-body text-[#999] mt-1 uppercase tracking-wide">
                          {item.author}
                        </p>
                        <span className="inline-block mt-2 text-[10px] font-body bg-[#203A2B]/8 text-[#203A2B] px-2 py-0.5 uppercase tracking-wider">
                          Digital eBook
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#F0EEE9]">
                        <span className="font-heading text-base font-bold text-[#080808]">
                          {formatINR(item.pricePaise)}
                        </span>
                        <button
                          onClick={() => removeItem(item.bookId)}
                          className="flex items-center gap-1.5 text-[11px] font-body text-[#bbb] hover:text-[#F12F43] transition-colors"
                          aria-label={`Remove ${item.title} from cart`}
                        >
                          <Trash2 size={12} />
                          <span className="hidden sm:inline">Remove</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <Link
                href="/books"
                className="sm:hidden inline-flex items-center gap-1.5 border border-[#E6DFD5] text-[#555] font-body text-[11px] font-semibold uppercase tracking-[0.1em] px-3.5 py-2 hover:border-[#789185] hover:text-[#203A2B] transition-colors mt-2 w-fit"
              >
                <ArrowLeft size={12} /> Continue Shopping
              </Link>
            </div>

            {/* ── Right: Order Summary ──────────────────────────────────── */}
            <div className="flex flex-col gap-4 lg:sticky lg:top-24">

              {/* Summary Card */}
              <div className="bg-white border border-[#E9E7E2]">
                <div className="px-5 py-4 border-b border-[#E9E7E2]">
                  <h2 className="font-heading text-lg font-bold text-[#080808]">Order Summary</h2>
                </div>

                {/* Item lines */}
                <div className="px-5 py-4 flex flex-col gap-2.5">
                  {items.map((item) => (
                    <div key={item.bookId} className="flex justify-between gap-3 text-sm font-body">
                      <span className="text-[#555] line-clamp-1 flex-1">{item.title}</span>
                      <span className="text-[#080808] shrink-0 font-medium tabular-nums">
                        {formatINR(item.pricePaise)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="px-5 pt-3 pb-5 border-t border-[#E9E7E2]">
                  <div className="flex justify-between items-baseline mb-5">
                    <span className="font-body text-sm text-[#777777]">
                      Subtotal ({items.length} {items.length === 1 ? "item" : "items"})
                    </span>
                    <span className="font-heading text-xl font-bold text-[#080808] tabular-nums">
                      {formatINR(totalPaise)}
                    </span>
                  </div>

                  <button
                    onClick={handleCheckout}
                    className="w-full bg-[#203A2B] text-[#FFFCF7] font-body text-[11px] font-bold uppercase tracking-[0.15em] px-6 py-4 hover:bg-[#315B55] transition-colors flex items-center justify-center gap-2.5"
                  >
                    Proceed to Checkout <ArrowRight size={13} />
                  </button>

                  <p className="text-[11px] font-body text-[#aaa] text-center mt-3 flex items-center justify-center gap-1.5">
                    <Shield size={11} />
                    Secure checkout via Razorpay
                  </p>
                </div>
              </div>

              {/* Value proposition badges */}
              <div className="border border-[#E9E7E2] bg-[#FFFCF7]">
                <div className="divide-y divide-[#F0EEE9]">
                  <div className="flex items-start gap-3 px-4 py-3">
                    <Zap size={14} className="text-[#C6A66B] mt-0.5 shrink-0" strokeWidth={2} />
                    <div>
                      <p className="text-[11px] font-body font-semibold text-[#080808] uppercase tracking-wide">Instant Access</p>
                      <p className="text-[11px] font-body text-[#777777] mt-0.5">Download immediately after payment</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 px-4 py-3">
                    <BookOpen size={14} className="text-[#C6A66B] mt-0.5 shrink-0" strokeWidth={2} />
                    <div>
                      <p className="text-[11px] font-body font-semibold text-[#080808] uppercase tracking-wide">Digital eBook</p>
                      <p className="text-[11px] font-body text-[#777777] mt-0.5">PDF format, read on any device</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 px-4 py-3">
                    <Shield size={14} className="text-[#C6A66B] mt-0.5 shrink-0" strokeWidth={2} />
                    <div>
                      <p className="text-[11px] font-body font-semibold text-[#080808] uppercase tracking-wide">Secure Payment</p>
                      <p className="text-[11px] font-body text-[#777777] mt-0.5">256-bit SSL encryption</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
