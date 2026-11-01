"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/useCart";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { Minus, Plus, Trash2 } from "lucide-react";
import type { Book } from "@/types";

export function AddToCartButton({ book }: { book: Book }) {
  const { addItem, removeItem, updateQuantity, items } = useCart();
  const requireAuth = useRequireAuth();
  const router = useRouter();

  const cartItem = items.find((i) => i.bookId === book.id);
  const inCart = !!cartItem;
  const quantity = cartItem?.quantity ?? 0;

  const cartItemPayload = {
    bookId: book.id,
    title: book.title,
    author: book.author,
    coverImageUrl: book.coverImageUrl,
    pricePaise: book.pricePaise,
    slug: book.slug,
  };

  const handleBuyNow = () => {
    if (!requireAuth()) return;
    if (!inCart) addItem(cartItemPayload);
    router.push("/checkout");
  };

  const handleAddToCart = () => {
    if (!requireAuth()) return;
    addItem(cartItemPayload);
  };

  const handleDecrease = () => {
    if (quantity <= 1) {
      removeItem(book.id);
    } else {
      updateQuantity(book.id, quantity - 1);
    }
  };

  const handleIncrease = () => {
    updateQuantity(book.id, quantity + 1);
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* Buy Now — always visible */}
      <button
        onClick={handleBuyNow}
        className="w-full bg-[#203A2B] text-[#FFFCF7] font-body text-xs font-bold uppercase tracking-widest px-6 py-4 hover:bg-[#315B55] transition-colors"
      >
        Buy Now
      </button>

      {inCart ? (
        /* ── Quantity stepper (replaces Add to Cart when in cart) ── */
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center w-full border border-[#203A2B]">
            {/* Decrease / remove */}
            <button
              onClick={handleDecrease}
              aria-label={quantity === 1 ? "Remove from cart" : "Decrease quantity"}
              className={`h-full px-4 py-3.5 flex items-center justify-center transition-colors
                ${quantity === 1
                  ? "text-[#bbb] hover:text-[#F12F43] hover:bg-red-50"
                  : "text-[#555] hover:text-[#203A2B] hover:bg-[#F5EFE6]"
                }`}
            >
              {quantity === 1 ? <Trash2 size={14} /> : <Minus size={14} />}
            </button>

            {/* Quantity display */}
            <div className="flex-1 flex flex-col items-center justify-center border-x border-[#203A2B] py-3.5 select-none">
              <span className="font-body text-[11px] font-semibold uppercase tracking-[0.12em] text-[#A8B5A0] leading-none mb-0.5">
                Qty
              </span>
              <span className="font-heading text-[18px] font-bold text-[#203A2B] tabular-nums leading-none">
                {quantity}
              </span>
            </div>

            {/* Increase */}
            <button
              onClick={handleIncrease}
              aria-label="Increase quantity"
              className="h-full px-4 py-3.5 flex items-center justify-center text-[#555] hover:text-[#203A2B] hover:bg-[#F5EFE6] transition-colors"
            >
              <Plus size={14} />
            </button>
          </div>

          {/* View cart link */}
          <Link
            href="/cart"
            className="w-full text-center text-xs font-body text-[#315B55] underline underline-offset-2 hover:text-[#203A2B] transition-colors py-1"
          >
            View Cart →
          </Link>
        </div>
      ) : (
        /* ── Add to Cart button (not yet in cart) ── */
        <button
          onClick={handleAddToCart}
          className="w-full border border-[#203A2B] text-[#203A2B] font-body text-xs font-bold uppercase tracking-widest px-6 py-4 hover:bg-[#203A2B] hover:text-[#FFFCF7] transition-colors"
        >
          Add to Cart
        </button>
      )}
    </div>
  );
}
