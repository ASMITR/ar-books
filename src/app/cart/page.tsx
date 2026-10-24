"use client";

import Link from "next/link";
import Image from "next/image";
import { Trash2, ShoppingCart, ArrowRight } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { formatINR } from "@/lib/currency";

export default function CartPage() {
  const { items, removeItem, totalPaise } = useCart();

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="bg-[#FAF9F6] border-b border-[#E9E7E2]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <p className="text-xs font-body uppercase tracking-[0.2em] text-[#789185] mb-2">Your Selection</p>
          <h1 className="font-heading text-4xl sm:text-5xl font-bold text-[#080808]">
            Cart {items.length > 0 && <span className="text-[#789185]">({items.length})</span>}
          </h1>
        </div>
      </section>

      <section className="bg-[#FAF9F6] py-12 lg:py-16 min-h-[50vh]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">

          {items.length === 0 ? (
            /* ── Empty State ─────────────────────────────────────────────── */
            <div className="flex flex-col items-center justify-center py-20 gap-5 text-center">
              <div className="w-16 h-16 rounded-full bg-[#E9E7E2] flex items-center justify-center">
                <ShoppingCart size={24} className="text-[#aaa]" />
              </div>
              <div>
                <h2 className="font-heading text-2xl font-bold text-[#080808] mb-2">Your cart is empty</h2>
                <p className="font-body text-[#777777] text-sm">Browse my books and add something you love.</p>
              </div>
              <Link
                href="/books"
                className="inline-flex items-center gap-2 bg-[#080808] text-white font-body text-xs font-bold uppercase tracking-widest px-8 py-4 hover:bg-[#789185] transition-colors"
              >
                Explore My Books <ArrowRight size={14} />
              </Link>
            </div>
          ) : (
            /* ── Cart Items + Summary ─────────────────────────────────────── */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

              {/* Items */}
              <div className="lg:col-span-2 flex flex-col gap-3">
                {items.map((item) => (
                  <div key={item.bookId} className="bg-white border border-[#E9E7E2] flex gap-4 p-4 hover:border-[#789185] transition-colors">
                    <Link href={`/books/${item.slug}`} className="relative w-16 h-24 shrink-0 bg-[#FAF9F6] overflow-hidden">
                      {item.coverImageUrl ? (
                        <Image src={item.coverImageUrl} alt={item.title} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full bg-[#789185]/20 flex items-center justify-center">
                          <span className="font-heading text-[#789185]/40 text-lg font-bold">AR</span>
                        </div>
                      )}
                    </Link>
                    <div className="flex flex-1 flex-col justify-between min-w-0">
                      <div>
                        <Link href={`/books/${item.slug}`} className="font-heading text-base sm:text-lg font-bold text-[#080808] hover:text-[#789185] transition-colors line-clamp-2 leading-tight">
                          {item.title}
                        </Link>
                        <p className="text-xs text-[#777777] font-body mt-1 uppercase tracking-wide">{item.author}</p>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <span className="font-body font-bold text-[#080808]">{formatINR(item.pricePaise)}</span>
                        <button
                          onClick={() => removeItem(item.bookId)}
                          className="flex items-center gap-1.5 text-xs font-body text-[#777777] hover:text-[#F12F43] transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 size={13} /> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                <Link
                  href="/books"
                  className="inline-flex items-center gap-2 text-xs font-body text-[#777777] hover:text-[#080808] transition-colors mt-2 w-fit"
                >
                  ← Continue Shopping
                </Link>
              </div>

              {/* Summary */}
              <div className="h-fit">
                <div className="bg-white border border-[#E9E7E2] p-6">
                  <h2 className="font-heading text-xl font-bold text-[#080808] mb-5 pb-4 border-b border-[#E9E7E2]">
                    Order Summary
                  </h2>
                  <div className="flex flex-col gap-3 mb-5">
                    {items.map((item) => (
                      <div key={item.bookId} className="flex justify-between gap-3 text-sm font-body">
                        <span className="text-[#777777] line-clamp-1">{item.title}</span>
                        <span className="text-[#080808] shrink-0 font-medium">{formatINR(item.pricePaise)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-[#E9E7E2] pt-4 flex justify-between font-body font-bold text-[#080808] text-base mb-6">
                    <span>Total</span>
                    <span>{formatINR(totalPaise)}</span>
                  </div>
                  <Link
                    href="/checkout"
                    className="block w-full text-center bg-[#080808] text-white font-body text-xs font-bold uppercase tracking-widest px-6 py-4 hover:bg-[#789185] transition-colors"
                  >
                    Proceed to Checkout
                  </Link>
                  <p className="text-[11px] font-body text-[#777777] text-center mt-3">
                    Secure payment via Razorpay
                  </p>
                </div>

                {/* Trust note */}
                <div className="mt-3 bg-[#FFC928]/15 border border-[#FFC928]/40 p-4">
                  <p className="text-xs font-body text-[#555]">
                    All eBooks are digital products. Instant download after payment.
                  </p>
                </div>
              </div>

            </div>
          )}
        </div>
      </section>
    </>
  );
}
