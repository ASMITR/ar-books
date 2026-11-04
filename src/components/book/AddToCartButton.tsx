"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/useCart";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { Minus, Plus, Trash2, Zap, ShoppingCart, Check, ArrowRight } from "lucide-react";
import { formatINR } from "@/lib/currency";
import type { Book } from "@/types";

export function AddToCartButton({ book }: { book: Book }) {
  const { addItem, removeItem, updateQuantity, items } = useCart();
  const requireAuth = useRequireAuth();
  const router = useRouter();

  const cartItem = items.find((i) => i.bookId === book.id);
  const inCart   = !!cartItem;
  const quantity = cartItem?.quantity ?? 0;

  const payload = {
    bookId: book.id, title: book.title, author: book.author,
    coverImageUrl: book.coverImageUrl, pricePaise: book.pricePaise, slug: book.slug,
  };

  const handleBuyNow     = () => { if (!requireAuth()) return; if (!inCart) addItem(payload); router.push("/checkout"); };
  const handleAddToCart  = () => { if (!requireAuth()) return; addItem(payload); };
  const handleDecrease   = () => quantity <= 1 ? removeItem(book.id) : updateQuantity(book.id, quantity - 1);
  const handleIncrease   = () => updateQuantity(book.id, quantity + 1);

  return (
    <div className="flex flex-col gap-3 w-full">

      {/* ── BUY NOW ──────────────────────────────────────────────────────── */}
      <button
        onClick={handleBuyNow}
        className="group relative w-full overflow-hidden flex items-center justify-center gap-3
          bg-[#0D1F17] text-white
          font-body text-[13px] font-bold uppercase tracking-[0.15em]
          px-6 py-4 rounded-2xl
          hover:bg-[#203A2B]
          active:scale-[0.98]
          transition-all duration-200
          shadow-[0_4px_16px_rgba(13,31,23,0.25)]"
      >
        {/* Shimmer */}
        <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full
          bg-gradient-to-r from-transparent via-white/[0.06] to-transparent
          transition-transform duration-700 pointer-events-none" />
        <div className="w-7 h-7 rounded-full bg-[#FFC928]/15 flex items-center justify-center shrink-0">
          <Zap size={14} className="text-[#FFC928]" strokeWidth={2.5} fill="currentColor" />
        </div>
        <span>Buy Now — {formatINR(book.pricePaise)}</span>
      </button>

      {/* ── CART STATE ───────────────────────────────────────────────────── */}
      {inCart ? (
        <div className="flex flex-col gap-3">

          {/* Added badge */}
          <div className="flex items-center gap-2.5 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-2xl">
            <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
              <Check size={11} strokeWidth={3} className="text-white" />
            </div>
            <span className="font-body text-[13px] font-semibold text-emerald-800 flex-1">
              Added to your cart
            </span>
            {quantity > 1 && (
              <span className="font-body text-[12px] font-bold text-emerald-700 tabular-nums">
                {formatINR(book.pricePaise * quantity)}
              </span>
            )}
          </div>

          {/* Stepper row */}
          <div className="flex items-stretch gap-2.5">
            <div className="flex items-stretch flex-1 rounded-2xl overflow-hidden
              border border-[#E2DDD8] bg-[#F7F5F2]">
              <button
                onClick={handleDecrease}
                aria-label={quantity === 1 ? "Remove from cart" : "Decrease quantity"}
                className={`flex items-center justify-center w-12 transition-all duration-150
                  ${quantity === 1
                    ? "text-[#C4BFB9] hover:text-red-500 hover:bg-red-50"
                    : "text-[#888] hover:text-[#203A2B] hover:bg-[#ECEAE5]"
                  }`}
              >
                {quantity === 1 ? <Trash2 size={14} /> : <Minus size={14} />}
              </button>

              <div className="flex-1 flex flex-col items-center justify-center py-3 select-none
                border-x border-[#E2DDD8]">
                <span className="font-heading text-[26px] font-bold text-[#0D1F17] tabular-nums leading-none">
                  {quantity}
                </span>
                <span className="font-body text-[9px] uppercase tracking-[0.14em] text-[#BDB8B0] mt-0.5">
                  {quantity === 1 ? "copy" : "copies"}
                </span>
              </div>

              <button
                onClick={handleIncrease}
                aria-label="Increase quantity"
                className="flex items-center justify-center w-12 text-[#888]
                  hover:text-[#203A2B] hover:bg-[#ECEAE5] transition-all duration-150"
              >
                <Plus size={14} />
              </button>
            </div>

            {/* View Cart */}
            <Link
              href="/cart"
              className="group flex flex-col items-center justify-center gap-1 px-5 rounded-2xl
                bg-white border border-[#E2DDD8] text-[#444]
                hover:border-[#203A2B] hover:bg-[#0D1F17] hover:text-white
                transition-all duration-200 shrink-0"
            >
              <ShoppingCart size={15} strokeWidth={1.8} />
              <span className="font-body text-[9px] font-bold uppercase tracking-[0.1em]">Cart</span>
            </Link>
          </div>

          {/* Checkout shortcut */}
          <button
            onClick={handleBuyNow}
            className="group flex items-center justify-center gap-1.5 w-full py-3
              font-body text-[12px] font-semibold text-[#203A2B]
              border border-[#203A2B]/20 rounded-2xl
              hover:border-[#203A2B] hover:bg-[#F2F0EC]
              transition-all duration-200"
          >
            Proceed to Checkout
            <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform duration-200" />
          </button>
        </div>

      ) : (
        <button
          onClick={handleAddToCart}
          className="group w-full flex items-center justify-center gap-3
            bg-white border border-[#E2DDD8] text-[#444]
            font-body text-[13px] font-bold uppercase tracking-[0.15em]
            px-6 py-4 rounded-2xl
            hover:border-[#203A2B]/40 hover:bg-[#F7F5F2] hover:text-[#203A2B]
            active:scale-[0.98] transition-all duration-200
            shadow-sm"
        >
          <ShoppingCart size={15} strokeWidth={1.8}
            className="group-hover:scale-110 transition-transform duration-200" />
          Add to Cart
        </button>
      )}
    </div>
  );
}
