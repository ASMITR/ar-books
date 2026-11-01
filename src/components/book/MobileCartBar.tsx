"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/useCart";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { Minus, Plus, Trash2, Zap, ShoppingCart, Check } from "lucide-react";
import { formatINR } from "@/lib/currency";
import type { Book } from "@/types";

export function MobileCartBar({ book }: { book: Book }) {
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
    <div className="flex items-center gap-3 w-full">
      {/* Price */}
      <div className="flex-1 min-w-0">
        <p className="font-body text-[9px] text-[#A8B5A0] uppercase tracking-wider truncate">
          {book.title}
        </p>
        <p className="font-heading text-[20px] font-bold text-[#203A2B] leading-tight">
          {formatINR(inCart && quantity > 1 ? book.pricePaise * quantity : book.pricePaise)}
        </p>
      </div>

      {inCart ? (
        /* ── In-cart: compact stepper + cart link ── */
        <div className="flex items-center gap-2 shrink-0">
          {/* Stepper */}
          <div className="flex items-center border-2 border-[#203A2B]/25 rounded-sm overflow-hidden bg-[#F9F7F4] h-11">
            <button
              onClick={handleDecrease}
              aria-label={quantity === 1 ? "Remove" : "Decrease"}
              className={`flex items-center justify-center w-10 h-full transition-colors
                ${quantity === 1 ? "text-[#C0BAB2] hover:text-red-500 hover:bg-red-50" : "text-[#777] hover:text-[#203A2B] hover:bg-[#EEF3EF]"}`}
            >
              {quantity === 1 ? <Trash2 size={13} /> : <Minus size={13} />}
            </button>

            <span className="font-heading text-[18px] font-bold text-[#203A2B] tabular-nums select-none w-8 text-center">
              {quantity}
            </span>

            <button
              onClick={handleIncrease}
              aria-label="Increase"
              className="flex items-center justify-center w-10 h-full text-[#777] hover:text-[#203A2B] hover:bg-[#EEF3EF] transition-colors"
            >
              <Plus size={13} />
            </button>
          </div>

          {/* View Cart */}
          <Link
            href="/cart"
            className="flex items-center justify-center gap-1.5 h-11 px-3 rounded-sm
              border-2 border-[#203A2B] text-[#203A2B] bg-[#FFFCF7]
              font-body text-[10px] font-bold uppercase tracking-[0.1em]
              hover:bg-[#203A2B] hover:text-[#FFFCF7] transition-all duration-200 shrink-0"
          >
            <Check size={11} strokeWidth={2.5} />
            Cart
          </Link>

          {/* Buy Now */}
          <button
            onClick={handleBuyNow}
            className="flex items-center justify-center gap-1.5 h-11 px-4 rounded-sm
              bg-[#203A2B] text-[#FFFCF7]
              font-body text-[10px] font-bold uppercase tracking-[0.12em]
              hover:bg-[#2a4d38] active:scale-[0.97] transition-all duration-200 shrink-0"
          >
            <Zap size={12} fill="currentColor" />
            Buy
          </button>
        </div>
      ) : (
        /* ── Not in cart: Add to Cart + Buy Now ── */
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleAddToCart}
            className="flex items-center justify-center gap-1.5 h-11 px-4 rounded-sm
              border-2 border-[#203A2B]/35 text-[#203A2B] bg-[#FFFCF7]
              font-body text-[10px] font-bold uppercase tracking-[0.1em]
              hover:border-[#203A2B] hover:bg-[#F0EDE8] active:scale-[0.97] transition-all duration-200"
          >
            <ShoppingCart size={13} strokeWidth={1.8} />
            Add
          </button>

          <button
            onClick={handleBuyNow}
            className="flex items-center justify-center gap-1.5 h-11 px-5 rounded-sm
              bg-[#203A2B] text-[#FFFCF7]
              font-body text-[10px] font-bold uppercase tracking-[0.12em]
              shadow-[0_2px_8px_rgba(32,58,43,0.3)]
              hover:bg-[#2a4d38] active:scale-[0.97] transition-all duration-200"
          >
            <Zap size={12} fill="currentColor" />
            Buy Now
          </button>
        </div>
      )}
    </div>
  );
}
