"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Trash2, ShoppingCart, ArrowRight, ArrowLeft, BookOpen, Shield, Zap, Minus, Plus } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { formatINR } from "@/lib/currency";

function QuantityStepper({ quantity, onDecrease, onIncrease, onRemove }: {
  quantity: number; onDecrease: () => void; onIncrease: () => void; onRemove: () => void;
}) {
  return (
    <div className="flex items-center border border-[#E8E4DF] rounded-xl overflow-hidden">
      <button onClick={quantity === 1 ? onRemove : onDecrease}
        aria-label={quantity === 1 ? "Remove item" : "Decrease quantity"}
        className={`w-8 h-8 flex items-center justify-center transition-colors
          ${quantity === 1 ? "text-[#CCC] hover:text-red-500 hover:bg-red-50" : "text-[#666] hover:text-[#203A2B] hover:bg-[#F5F2EE]"}`}>
        {quantity === 1 ? <Trash2 size={11} /> : <Minus size={11} />}
      </button>
      <span className="w-8 text-center font-body text-[13px] font-semibold text-[#111] tabular-nums select-none">{quantity}</span>
      <button onClick={onIncrease} aria-label="Increase quantity"
        className="w-8 h-8 flex items-center justify-center text-[#666] hover:text-[#203A2B] hover:bg-[#F5F2EE] transition-colors">
        <Plus size={11} />
      </button>
    </div>
  );
}

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPaise, count } = useCart();
  const requireAuth = useRequireAuth();
  const router = useRouter();

  const handleCheckout = () => {
    if (!requireAuth()) return;
    router.push("/checkout");
  };

  return (
    <div className="bg-[#FAFAF7] min-h-screen">
      {/* Page Header */}
      <div className="border-b border-[#ECEAE5] bg-white">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-7 sm:py-9">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-body font-bold uppercase tracking-[0.28em] text-[#B8B3AB] mb-2">Your Selection</p>
              <h1 className="font-heading text-[26px] sm:text-[32px] font-bold text-[#111] leading-none">
                Shopping Cart
                {count > 0 && <span className="ml-3 text-[20px] text-[#B8B3AB] font-normal align-middle">{count} {count === 1 ? "item" : "items"}</span>}
              </h1>
            </div>
            {items.length > 0 && (
              <Link href="/books"
                className="hidden sm:inline-flex items-center gap-1.5 border border-[#E8E4DF] text-[#666] font-body text-[11px] font-semibold uppercase tracking-[0.1em] px-3.5 py-2 rounded-xl hover:border-[#203A2B] hover:text-[#203A2B] transition-colors shrink-0">
                <ArrowLeft size={12} /> Continue Shopping
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-6 text-center max-w-sm mx-auto">
            <div className="w-18 h-18 bg-[#F0EDE8] rounded-2xl flex items-center justify-center p-5">
              <ShoppingCart size={26} className="text-[#C8C3BC]" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="font-heading text-2xl font-bold text-[#111] mb-2">Your cart is empty</h2>
              <p className="font-body text-[#888] text-sm leading-relaxed">Browse the collection and add something that speaks to you.</p>
            </div>
            <Link href="/books"
              className="inline-flex items-center gap-2.5 bg-[#0D1F17] text-white font-body text-[11px] font-bold uppercase tracking-[0.15em] px-8 py-3.5 rounded-xl hover:bg-[#203A2B] transition-colors">
              Explore Books <ArrowRight size={13} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 xl:gap-12 items-start">

            {/* Item list */}
            <div className="flex flex-col gap-3">
              {items.map((item) => (
                <div key={item.bookId}
                  className="bg-white border border-[#ECEAE5] hover:border-[#203A2B]/20 hover:shadow-sm transition-all duration-200 rounded-2xl overflow-hidden group">
                  <div className="flex gap-4 p-4 sm:p-5">
                    <Link href={`/books/${item.slug}`}
                      className="relative w-[56px] h-[80px] sm:w-[64px] sm:h-[92px] shrink-0 overflow-hidden bg-[#F5F2EE] rounded-xl">
                      {item.coverImageUrl ? (
                        <Image src={item.coverImageUrl} alt={item.title} fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen size={18} className="text-[#C8C3BC]" strokeWidth={1.5} />
                        </div>
                      )}
                    </Link>
                    <div className="flex flex-1 flex-col justify-between min-w-0 py-0.5">
                      <div className="pr-2">
                        <Link href={`/books/${item.slug}`}
                          className="font-heading text-base sm:text-[17px] font-bold text-[#111] hover:text-[#203A2B] transition-colors line-clamp-2 leading-snug">
                          {item.title}
                        </Link>
                        <p className="text-[11px] font-body text-[#B8B3AB] mt-1 uppercase tracking-wide">{item.author}</p>
                        <span className="inline-block mt-2 text-[9.5px] font-body font-bold bg-[#0D1F17]/6 text-[#203A2B] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                          Digital eBook
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#F0EDE8] gap-3 flex-wrap">
                        <QuantityStepper
                          quantity={item.quantity}
                          onDecrease={() => updateQuantity(item.bookId, item.quantity - 1)}
                          onIncrease={() => updateQuantity(item.bookId, item.quantity + 1)}
                          onRemove={() => removeItem(item.bookId)}
                        />
                        <div className="flex flex-col items-end gap-0.5">
                          {item.quantity > 1 && (
                            <span className="text-[10px] font-body text-[#B8B3AB] tabular-nums">{formatINR(item.pricePaise)} × {item.quantity}</span>
                          )}
                          <span className="font-heading text-base font-bold text-[#111] tabular-nums">{formatINR(item.pricePaise * item.quantity)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <Link href="/books"
                className="sm:hidden inline-flex items-center gap-1.5 border border-[#E8E4DF] text-[#666] font-body text-[11px] font-semibold uppercase tracking-[0.1em] px-3.5 py-2 rounded-xl hover:border-[#203A2B] hover:text-[#203A2B] transition-colors mt-1 w-fit">
                <ArrowLeft size={12} /> Continue Shopping
              </Link>
            </div>

            {/* Order summary */}
            <div className="flex flex-col gap-3 lg:sticky lg:top-24">
              <div className="bg-white border border-[#ECEAE5] rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-[#F0EDE8]">
                  <h2 className="font-heading text-[17px] font-bold text-[#111]">Order Summary</h2>
                </div>
                <div className="px-5 py-4 flex flex-col gap-2.5">
                  {items.map((item) => (
                    <div key={item.bookId} className="flex justify-between gap-3 text-sm font-body">
                      <span className="text-[#666] line-clamp-1 flex-1">
                        {item.title}
                        {item.quantity > 1 && <span className="ml-1 text-[#B8B3AB] text-[11px]">×{item.quantity}</span>}
                      </span>
                      <span className="text-[#111] shrink-0 font-medium tabular-nums">{formatINR(item.pricePaise * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="px-5 pt-3 pb-5 border-t border-[#F0EDE8]">
                  <div className="flex justify-between items-baseline mb-5">
                    <span className="font-body text-sm text-[#888]">Subtotal ({count} {count === 1 ? "item" : "items"})</span>
                    <span className="font-heading text-xl font-bold text-[#111] tabular-nums">{formatINR(totalPaise)}</span>
                  </div>
                  <button onClick={handleCheckout}
                    className="w-full bg-[#0D1F17] text-white font-body text-[11.5px] font-bold uppercase tracking-[0.15em] px-6 py-3.5 rounded-xl hover:bg-[#203A2B] transition-colors flex items-center justify-center gap-2.5">
                    Proceed to Checkout <ArrowRight size={13} />
                  </button>
                  <p className="text-[11px] font-body text-[#B8B3AB] text-center mt-3 flex items-center justify-center gap-1.5">
                    <Shield size={11} /> Secure checkout via Razorpay
                  </p>
                </div>
              </div>

              <div className="bg-white border border-[#ECEAE5] rounded-2xl overflow-hidden divide-y divide-[#F0EDE8]">
                {[
                  { icon: Zap, title: "Instant Access", sub: "Download immediately after payment" },
                  { icon: BookOpen, title: "Digital eBook", sub: "PDF format, read on any device" },
                  { icon: Shield, title: "Secure Payment", sub: "256-bit SSL encryption" },
                ].map(({ icon: Icon, title, sub }) => (
                  <div key={title} className="flex items-start gap-3 px-4 py-3.5">
                    <Icon size={13} className="text-[#C6A66B] mt-0.5 shrink-0" strokeWidth={2} />
                    <div>
                      <p className="text-[11px] font-body font-semibold text-[#111] uppercase tracking-wide">{title}</p>
                      <p className="text-[11px] font-body text-[#888] mt-0.5">{sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
