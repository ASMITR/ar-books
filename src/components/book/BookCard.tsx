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

  const discount     = book.originalPriceRupees ? Math.round((1 - book.priceRupees / book.originalPriceRupees) * 100) : null;
  const isNew        = Date.now() - new Date(book.createdAt).getTime() < 30 * 24 * 60 * 60 * 1000;
  const isFeatured   = book.featured;

  return (
    <article className="group relative flex flex-col bg-white rounded-2xl overflow-hidden
      border border-[#ECEAE5]
      hover:border-[#203A2B]/20 hover:shadow-[0_12px_40px_rgba(0,0,0,0.10)]
      transition-all duration-300 ease-out">

      {/* ── MOBILE / TABLET: horizontal layout (< lg) ──────────────────────── */}
      <div className="flex lg:hidden">

        {/* Cover — fixed width column */}
        <Link
          href={`/books/${book.slug}`}
          className="relative shrink-0 w-[90px] sm:w-[110px] bg-[#F2EFE9] overflow-hidden"
          tabIndex={-1}
          aria-hidden
        >
          {/* Badges */}
          <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
            {discount && (
              <span className="inline-flex items-center bg-[#0D1F17] text-white
                text-[8px] font-bold uppercase tracking-[0.1em] px-1.5 py-0.5 rounded-full">
                -{discount}%
              </span>
            )}
            {isFeatured && (
              <span className="inline-flex items-center bg-[#FFC928] text-[#0D1F17]
                text-[8px] font-bold uppercase tracking-[0.1em] px-1.5 py-0.5 rounded-full">
                ★
              </span>
            )}
            {isNew && !isFeatured && (
              <span className="inline-flex items-center bg-white/90 border border-[#203A2B]/20 text-[#203A2B]
                text-[8px] font-bold uppercase tracking-[0.1em] px-1.5 py-0.5 rounded-full">
                New
              </span>
            )}
          </div>

          <div className="relative h-full min-h-[130px] sm:min-h-[150px] flex items-center justify-center px-3 py-4">
            {book.coverImageUrl ? (
              <div
                className="relative w-full h-full transition-transform duration-500 ease-out
                  group-hover:scale-[1.04]"
                style={{ filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.20))" }}
              >
                <Image
                  src={book.coverImageUrl}
                  alt={book.title}
                  fill
                  className="object-contain"
                  sizes="110px"
                />
              </div>
            ) : (
              <div className="w-[60px] h-[84px] bg-[#203A2B] flex items-end p-2 rounded-sm shadow-lg">
                <span className="font-heading text-white text-[9px] font-bold leading-tight line-clamp-3">
                  {book.title}
                </span>
              </div>
            )}
          </div>
        </Link>

        {/* Info + actions */}
        <div className="flex flex-col flex-1 min-w-0 px-3 py-3 gap-2">
          {/* Title + author */}
          <div className="flex flex-col gap-0.5">
            <Link href={`/books/${book.slug}`} className="group/title">
              <h3 className="font-heading text-[12px] sm:text-[13px] font-bold leading-snug text-[#111]
                group-hover/title:text-[#203A2B] transition-colors line-clamp-2">
                {book.title}
              </h3>
            </Link>
            <div className="flex items-center gap-1">
              <BookOpen size={8} className="text-[#BDB8B0] shrink-0" strokeWidth={2} />
              <p className="font-body text-[9px] text-[#BDB8B0] uppercase tracking-[0.08em] truncate">
                {book.author}
              </p>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="font-heading text-[15px] font-bold text-[#0D1F17] leading-none">
              {formatINR(book.priceRupees)}
            </span>
            {book.originalPriceRupees && (
              <span className="font-body text-[10px] text-[#C4BFB9] line-through leading-none">
                {formatINR(book.originalPriceRupees)}
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-1.5 mt-auto pt-2 border-t border-[#F0EDE8]">
            <button
              onClick={handleBuyNow}
              className="w-full flex items-center justify-center gap-1.5
                bg-[#0D1F17] text-white
                font-body text-[10px] font-bold uppercase tracking-[0.1em]
                py-2 rounded-lg
                hover:bg-[#203A2B] active:scale-[0.98] transition-all duration-200"
            >
              <Zap size={9} strokeWidth={2.5} className="shrink-0" />
              Buy Now
            </button>

            {inCart ? (
              <div className="flex items-center gap-1.5">
                <div className="flex items-center flex-1 bg-[#F7F5F2] border border-[#E8E4DF] rounded-lg overflow-hidden">
                  <button
                    onClick={handleDecrease}
                    aria-label={quantity === 1 ? "Remove" : "Decrease"}
                    className={`flex items-center justify-center w-7 h-7 shrink-0 transition-colors
                      ${quantity === 1
                        ? "text-[#C4BFB9] hover:text-red-500 hover:bg-red-50"
                        : "text-[#888] hover:text-[#203A2B] hover:bg-[#ECEAE5]"
                      }`}
                  >
                    {quantity === 1 ? <Trash2 size={9} /> : <Minus size={9} />}
                  </button>
                  <span className="flex-1 text-center font-body text-[11px] font-bold text-[#0D1F17] tabular-nums select-none">
                    {quantity}
                  </span>
                  <button
                    onClick={handleIncrease}
                    aria-label="Increase"
                    className="flex items-center justify-center w-7 h-7 shrink-0 text-[#888] hover:text-[#203A2B] hover:bg-[#ECEAE5] transition-colors"
                  >
                    <Plus size={9} />
                  </button>
                </div>
                <Link
                  href="/cart"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center justify-center gap-1
                    bg-emerald-50 border border-emerald-200 text-emerald-700
                    font-body text-[9px] font-bold uppercase tracking-[0.08em]
                    px-2 h-7 rounded-lg hover:bg-emerald-100 transition-colors shrink-0"
                >
                  <Check size={9} strokeWidth={2.5} />
                  Cart
                </Link>
              </div>
            ) : (
              <button
                onClick={handleAddToCart}
                className="w-full flex items-center justify-center gap-1.5
                  bg-[#F7F5F2] border border-[#E2DDD8] text-[#444]
                  font-body text-[10px] font-bold uppercase tracking-[0.1em]
                  py-2 rounded-lg
                  hover:bg-[#ECEAE5] hover:border-[#203A2B]/30 hover:text-[#203A2B]
                  active:scale-[0.98] transition-all duration-200"
              >
                <ShoppingCart size={9} strokeWidth={2} />
                Add to Cart
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── DESKTOP: original vertical layout (lg+) ────────────────────────── */}
      <div className="hidden lg:flex lg:flex-col">

        {/* Cover */}
        <Link
          href={`/books/${book.slug}`}
          className="relative block overflow-hidden bg-[#F2EFE9]"
          tabIndex={-1}
          aria-hidden
        >
          <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
            {discount && (
              <span className="inline-flex items-center bg-[#0D1F17] text-white
                text-[9px] font-bold uppercase tracking-[0.12em] px-2 py-1 rounded-full shadow-sm">
                -{discount}%
              </span>
            )}
            {isFeatured && (
              <span className="inline-flex items-center bg-[#FFC928] text-[#0D1F17]
                text-[9px] font-bold uppercase tracking-[0.12em] px-2 py-1 rounded-full shadow-sm">
                Bestseller
              </span>
            )}
            {isNew && !isFeatured && (
              <span className="inline-flex items-center bg-white/90 border border-[#203A2B]/20 text-[#203A2B]
                text-[9px] font-bold uppercase tracking-[0.12em] px-2 py-1 rounded-full shadow-sm">
                New
              </span>
            )}
          </div>

          <div className="relative h-[230px] flex items-center justify-center px-8 py-6">
            {book.coverImageUrl ? (
              <div
                className="relative w-full h-full transition-transform duration-500 ease-out
                  group-hover:-translate-y-2 group-hover:scale-[1.04]"
                style={{ filter: "drop-shadow(0 16px 32px rgba(0,0,0,0.22))" }}
              >
                <Image
                  src={book.coverImageUrl}
                  alt={book.title}
                  fill
                  className="object-contain"
                  sizes="240px"
                />
              </div>
            ) : (
              <div className="w-[100px] h-[140px] bg-[#203A2B] flex items-end p-3 rounded-sm
                shadow-xl transition-transform duration-500 group-hover:-translate-y-2">
                <span className="font-heading text-white text-xs font-bold leading-tight line-clamp-3">
                  {book.title}
                </span>
              </div>
            )}
          </div>

          <div className="absolute bottom-0 inset-x-0 h-12
            bg-gradient-to-t from-white to-transparent pointer-events-none" />
        </Link>

        {/* Info */}
        <div className="flex flex-col flex-1 px-4 pt-3 pb-4 gap-3.5">
          <div className="flex flex-col gap-1">
            <Link href={`/books/${book.slug}`} className="group/title">
              <h3 className="font-heading text-[14px] font-bold leading-snug text-[#111]
                group-hover/title:text-[#203A2B] transition-colors line-clamp-2">
                {book.title}
              </h3>
            </Link>
            <div className="flex items-center gap-1.5">
              <BookOpen size={9} className="text-[#BDB8B0] shrink-0" strokeWidth={2} />
              <p className="font-body text-[10px] text-[#BDB8B0] uppercase tracking-[0.1em] truncate">
                {book.author}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="font-heading text-[18px] font-bold text-[#0D1F17] leading-none">
                {formatINR(book.priceRupees)}
              </span>
              {book.originalPriceRupees && (
                <span className="font-body text-[11px] text-[#C4BFB9] line-through leading-none">
                  {formatINR(book.originalPriceRupees)}
                </span>
              )}
            </div>
            {discount && (
              <span className="font-body text-[10px] font-bold text-emerald-700
                bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                Save {discount}%
              </span>
            )}
          </div>

          <div className="flex flex-col gap-2 mt-auto pt-3 border-t border-[#F0EDE8]">
            <button
              onClick={handleBuyNow}
              className="w-full flex items-center justify-center gap-2
                bg-[#0D1F17] text-white
                font-body text-[11px] font-bold uppercase tracking-[0.12em]
                py-2.5 rounded-xl
                hover:bg-[#203A2B] active:scale-[0.98] transition-all duration-200"
            >
              <Zap size={11} strokeWidth={2.5} className="shrink-0" />
              Buy Now
            </button>

            {inCart ? (
              <div className="flex items-center gap-2">
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
                  <span className="flex-1 text-center font-body text-[12px] font-bold text-[#0D1F17] tabular-nums select-none">
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
                  className="flex items-center justify-center gap-1.5
                    bg-emerald-50 border border-emerald-200 text-emerald-700
                    font-body text-[10px] font-bold uppercase tracking-[0.1em]
                    px-3 h-8 rounded-xl hover:bg-emerald-100 transition-colors shrink-0"
                >
                  <Check size={10} strokeWidth={2.5} />
                  Cart
                </Link>
              </div>
            ) : (
              <button
                onClick={handleAddToCart}
                className="w-full flex items-center justify-center gap-2
                  bg-[#F7F5F2] border border-[#E2DDD8] text-[#444]
                  font-body text-[11px] font-bold uppercase tracking-[0.12em]
                  py-2.5 rounded-xl
                  hover:bg-[#ECEAE5] hover:border-[#203A2B]/30 hover:text-[#203A2B]
                  active:scale-[0.98] transition-all duration-200"
              >
                <ShoppingCart size={11} strokeWidth={2} />
                Add to Cart
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
