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
  const inCart = !!cartItem;
  const quantity = cartItem?.quantity ?? 0;

  const payload = {
    bookId: book.id,
    title: book.title,
    author: book.author,
    coverImageUrl: book.coverImageUrl,
    pricePaise: book.pricePaise,
    slug: book.slug,
  };

  const handleBuyNow = () => {
    if (!requireAuth()) return;
    if (!inCart) addItem(payload);
    router.push("/checkout");
  };

  const handleAddToCart = () => {
    if (!requireAuth()) return;
    addItem(payload);
  };

  const handleDecrease = () =>
    quantity <= 1 ? removeItem(book.id) : updateQuantity(book.id, quantity - 1);

  const handleIncrease = () => updateQuantity(book.id, quantity + 1);

  return (
    <div className="flex flex-col gap-3 w-full">

      {/* ── BUY NOW ──────────────────────────────────────────────────── */}
      <button
        onClick={handleBuyNow}
        className="group relative w-full overflow-hidden flex items-center justify-center gap-3
          bg-[#203A2B] text-[#FFFCF7]
          font-body text-[12px] font-black uppercase tracking-[0.2em]
          px-6 py-[15px] rounded-sm
          shadow-[0_4px_14px_rgba(32,58,43,0.35)]
          hover:bg-[#2a4d38] hover:shadow-[0_6px_20px_rgba(32,58,43,0.45)]
          active:scale-[0.98] active:shadow-none
          transition-all duration-200"
      >
        {/* Shimmer */}
        <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full
          bg-gradient-to-r from-transparent via-white/[0.08] to-transparent
          transition-transform duration-700 pointer-events-none" />
        <div className="w-7 h-7 rounded-full bg-[#C6A66B]/20 flex items-center justify-center shrink-0">
          <Zap size={14} className="text-[#C6A66B]" strokeWidth={2.5} fill="currentColor" />
        </div>
        <span>Buy Now — {formatINR(book.pricePaise)}</span>
      </button>

      {/* ── CART STATE ───────────────────────────────────────────────── */}
      {inCart ? (

        /* ╔═══════════════════════════════════╗
           ║  IN-CART  STATE                   ║
           ╚═══════════════════════════════════╝ */
        <div className="flex flex-col gap-3">

          {/* Added badge */}
          <div className="flex items-center gap-2.5 px-4 py-2.5 bg-emerald-50 border border-emerald-200 rounded-sm">
            <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
              <Check size={11} strokeWidth={3} className="text-white" />
            </div>
            <span className="font-body text-[12px] font-semibold text-emerald-800 flex-1">
              Added to your cart
            </span>
            {quantity > 1 && (
              <span className="font-body text-[11px] font-bold text-emerald-700 tabular-nums">
                {formatINR(book.pricePaise * quantity)}
              </span>
            )}
          </div>

          {/* Quantity label */}
          <p className="font-body text-[10px] font-bold uppercase tracking-[0.18em] text-[#A8B5A0]">
            Quantity
          </p>

          {/* Stepper row */}
          <div className="flex items-stretch gap-2.5">

            {/* − / + stepper */}
            <div className="flex items-stretch flex-1 rounded-sm overflow-hidden
              border-2 border-[#203A2B]/20 bg-[#FFFCF7]
              shadow-[0_1px_4px_rgba(0,0,0,0.06)]">

              {/* Decrease / Remove */}
              <button
                onClick={handleDecrease}
                aria-label={quantity === 1 ? "Remove from cart" : "Decrease quantity"}
                className={`flex items-center justify-center w-12 transition-all duration-150
                  ${quantity === 1
                    ? "text-[#C0BAB2] hover:text-red-500 hover:bg-red-50"
                    : "text-[#777] hover:text-[#203A2B] hover:bg-[#F0EDE8]"
                  }`}
              >
                {quantity === 1 ? <Trash2 size={14} /> : <Minus size={14} />}
              </button>

              {/* Count display */}
              <div className="flex-1 flex flex-col items-center justify-center py-3 select-none
                border-x-2 border-[#203A2B]/10">
                <span className="font-heading text-[24px] font-bold text-[#203A2B] tabular-nums leading-none">
                  {quantity}
                </span>
                <span className="font-body text-[8.5px] uppercase tracking-[0.14em] text-[#A8B5A0] mt-0.5">
                  {quantity === 1 ? "copy" : "copies"}
                </span>
              </div>

              {/* Increase */}
              <button
                onClick={handleIncrease}
                aria-label="Increase quantity"
                className="flex items-center justify-center w-12 text-[#777]
                  hover:text-[#203A2B] hover:bg-[#F0EDE8] transition-all duration-150"
              >
                <Plus size={14} />
              </button>
            </div>

            {/* View Cart */}
            <Link
              href="/cart"
              className="group flex flex-col items-center justify-center gap-1 px-4 rounded-sm
                bg-[#FFFCF7] border-2 border-[#203A2B]/25 text-[#203A2B]
                hover:border-[#203A2B] hover:bg-[#203A2B] hover:text-[#FFFCF7]
                transition-all duration-200 shrink-0 min-w-[64px]
                shadow-[0_1px_4px_rgba(0,0,0,0.06)]"
            >
              <ShoppingCart size={15} strokeWidth={1.8} />
              <span className="font-body text-[8.5px] font-bold uppercase tracking-[0.12em]">
                View Cart
              </span>
            </Link>
          </div>

          {/* Go to Checkout link */}
          <button
            onClick={handleBuyNow}
            className="group flex items-center justify-center gap-1.5 w-full py-2.5
              font-body text-[11px] font-semibold text-[#315B55]
              border border-dashed border-[#315B55]/30 rounded-sm
              hover:border-[#203A2B] hover:text-[#203A2B] hover:bg-[#F5EFE6]
              transition-all duration-200"
          >
            Proceed to Checkout
            <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform duration-200" />
          </button>

        </div>

      ) : (

        /* ╔═══════════════════════════════════╗
           ║  NOT-IN-CART STATE                ║
           ╚═══════════════════════════════════╝ */
        <button
          onClick={handleAddToCart}
          className="group w-full flex items-center justify-center gap-3
            bg-[#FFFCF7] border-2 border-[#203A2B]/30 text-[#203A2B]
            font-body text-[12px] font-black uppercase tracking-[0.2em]
            px-6 py-[14px] rounded-sm
            hover:border-[#203A2B] hover:bg-[#F0EDE8]
            active:scale-[0.98] transition-all duration-200
            shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_2px_8px_rgba(32,58,43,0.12)]"
        >
          <ShoppingCart size={15} strokeWidth={1.8}
            className="group-hover:scale-110 transition-transform duration-200" />
          Add to Cart
        </button>

      )}
    </div>
  );
}
