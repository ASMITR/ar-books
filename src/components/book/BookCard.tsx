"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/useCart";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { formatINR } from "@/lib/currency";
import { ShoppingCart, Zap, Minus, Plus, Trash2, Check, BookOpen } from "lucide-react";
import type { Book } from "@/types";

interface BookCardProps { book: Book; }

export function BookCard({ book }: BookCardProps) {
  const { addItem, removeItem, updateQuantity, items } = useCart();
  const requireAuth = useRequireAuth();
  const router = useRouter();

  const cartItem = items.find((i) => i.bookId === book.id);
  const inCart   = !!cartItem;
  const quantity = cartItem?.quantity ?? 0;

  const payload = {
    bookId: book.id, title: book.title, author: book.author,
    coverImageUrl: book.coverImageUrl, priceRupees: book.priceRupees, slug: book.slug,
  };

  const handleAddToCart = (e: React.MouseEvent) => { e.preventDefault(); if (!requireAuth()) return; addItem(payload); };
  const handleBuyNow    = (e: React.MouseEvent) => { e.preventDefault(); if (!requireAuth()) return; if (!inCart) addItem(payload); router.push("/checkout"); };
  const handleDecrease  = (e: React.MouseEvent) => { e.preventDefault(); quantity <= 1 ? removeItem(book.id) : updateQuantity(book.id, quantity - 1); };
  const handleIncrease  = (e: React.MouseEvent) => { e.preventDefault(); updateQuantity(book.id, quantity + 1); };

  const discount   = book.originalPriceRupees ? Math.round((1 - book.priceRupees / book.originalPriceRupees) * 100) : null;
  const isNew      = (Date.now() - new Date(book.createdAt).getTime()) < 30 * 24 * 60 * 60 * 1000;
  const isFeatured = book.featured;

  return (
    <article className="group relative flex flex-col bg-white rounded-2xl overflow-hidden
      border border-[#ECEAE5] h-full
      hover:border-[#203A2B]/20 hover:shadow-[0_8px_32px_rgba(0,0,0,0.09)]
      transition-all duration-300 ease-out">

      {/* ── Cover ── fixed height so it never grows too tall */}
      <Link href={`/books/${book.slug}`} className="relative block bg-[#F2EFE9] shrink-0 h-[200px]" tabIndex={-1} aria-hidden>

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1.5">
          {discount && (
            <span className="inline-flex items-center bg-[#0D1F17] text-white
              text-[9px] font-bold uppercase tracking-[0.12em] px-2 py-0.5 rounded-full shadow-sm">
              -{discount}%
            </span>
          )}
          {isFeatured && (
            <span className="inline-flex items-center bg-[#FFC928] text-[#0D1F17]
              text-[9px] font-bold uppercase tracking-[0.12em] px-2 py-0.5 rounded-full shadow-sm">
              Bestseller
            </span>
          )}
          {isNew && !isFeatured && (
            <span className="inline-flex items-center bg-white/90 border border-[#203A2B]/20 text-[#203A2B]
              text-[9px] font-bold uppercase tracking-[0.12em] px-2 py-0.5 rounded-full shadow-sm">
              New
            </span>
          )}
        </div>

        {book.coverImageUrl ? (
          <Image
            src={book.coverImageUrl}
            alt={book.title}
            fill
            className="object-contain p-5 transition-transform duration-500 ease-out
              group-hover:-translate-y-1 group-hover:scale-[1.04]"
            style={{ filter: "drop-shadow(0 6px 16px rgba(0,0,0,0.18))" }}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center p-8">
            <div className="w-full h-full bg-[#203A2B] flex items-end p-3 rounded shadow-lg
              transition-transform duration-500 group-hover:-translate-y-1">
              <span className="font-heading text-white text-xs font-bold leading-tight line-clamp-3">
                {book.title}
              </span>
            </div>
          </div>
        )}

        <div className="absolute bottom-0 inset-x-0 h-8 bg-gradient-to-t from-white to-transparent pointer-events-none" />
      </Link>

      {/* ── Info ── */}
      <div className="flex flex-col flex-1 p-4 gap-2.5">

        {/* Title + author */}
        <div className="flex flex-col gap-1">
          <Link href={`/books/${book.slug}`} className="group/title">
            <h3 className="font-heading text-[13px] font-bold leading-snug text-[#111]
              group-hover/title:text-[#203A2B] transition-colors line-clamp-2">
              {book.title}
            </h3>
          </Link>
          <div className="flex items-center gap-1.5">
            <BookOpen size={9} className="text-[#C4BFB9] shrink-0" strokeWidth={2} />
            <p className="font-body text-[10px] text-[#C4BFB9] uppercase tracking-[0.1em] truncate">
              {book.author}
            </p>
          </div>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-1.5">
            <span className="font-heading text-[16px] font-bold text-[#0D1F17] leading-none">
              {formatINR(book.priceRupees)}
            </span>
            {book.originalPriceRupees && (
              <span className="font-body text-[10px] text-[#C4BFB9] line-through leading-none">
                {formatINR(book.originalPriceRupees)}
              </span>
            )}
          </div>
          {discount && (
            <span className="font-body text-[9px] font-bold text-emerald-700
              bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-full shrink-0">
              -{discount}%
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 mt-auto pt-2.5 border-t border-[#F0EDE8]">
          <button
            onClick={handleBuyNow}
            className="w-full flex items-center justify-center gap-1.5
              bg-[#0D1F17] text-white
              font-body text-[10px] font-bold uppercase tracking-[0.12em]
              py-2.5 rounded-xl
              hover:bg-[#203A2B] active:scale-[0.98] transition-all duration-200"
          >
            <Zap size={10} strokeWidth={2.5} className="shrink-0" />
            Buy Now
          </button>

          {inCart ? (
            <div className="flex items-center gap-1.5">
              <div className="flex items-center flex-1 bg-[#F7F5F2] border border-[#E8E4DF] rounded-xl overflow-hidden">
                <button
                  onClick={handleDecrease}
                  aria-label={quantity === 1 ? "Remove" : "Decrease"}
                  className={`flex items-center justify-center w-8 h-8 shrink-0 transition-colors
                    ${quantity === 1
                      ? "text-[#C4BFB9] hover:text-red-500 hover:bg-red-50"
                      : "text-[#888] hover:text-[#203A2B] hover:bg-[#ECEAE5]"
                    }`}
                >
                  {quantity === 1 ? <Trash2 size={10} /> : <Minus size={10} />}
                </button>
                <span className="flex-1 text-center font-body text-[11px] font-bold text-[#0D1F17] tabular-nums select-none">
                  {quantity}
                </span>
                <button
                  onClick={handleIncrease}
                  aria-label="Increase"
                  className="flex items-center justify-center w-8 h-8 shrink-0 text-[#888] hover:text-[#203A2B] hover:bg-[#ECEAE5] transition-colors"
                >
                  <Plus size={10} />
                </button>
              </div>
              <Link
                href="/cart"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center justify-center gap-1
                  bg-emerald-50 border border-emerald-200 text-emerald-700
                  font-body text-[9px] font-bold uppercase tracking-[0.08em]
                  px-2.5 h-8 rounded-xl hover:bg-emerald-100 transition-colors shrink-0"
              >
                <Check size={9} strokeWidth={2.5} />
                Cart
              </Link>
            </div>
          ) : (
            <button
              onClick={handleAddToCart}
              className="w-full flex items-center justify-center gap-1.5
                bg-[#F7F5F2] border border-[#E2DDD8] text-[#555]
                font-body text-[10px] font-bold uppercase tracking-[0.12em]
                py-2.5 rounded-xl
                hover:bg-[#ECEAE5] hover:border-[#203A2B]/30 hover:text-[#203A2B]
                active:scale-[0.98] transition-all duration-200"
            >
              <ShoppingCart size={10} strokeWidth={2} />
              Add to Cart
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
