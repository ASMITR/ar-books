import { getSessionUser } from "@/lib/firebase/auth-server";
import { getEntitlementsByCustomer } from "@/lib/firebase/firestore";
import { adminDb } from "@/lib/firebase/admin";
import { formatDate } from "@/lib/utils";
import { formatINR } from "@/lib/currency";
import { DownloadCard } from "@/components/shared/DownloadCard";
import Image from "next/image";
import Link from "next/link";
import { BookOpen, ShoppingBag, ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import type { Book } from "@/types";

export const metadata: Metadata = { title: "My Library" };

export default async function LibraryPage() {
  const user         = await getSessionUser();
  const entitlements = await getEntitlementsByCustomer(user!.uid);

  /* ── Empty state ──────────────────────────────────────────────────────────── */
  if (entitlements.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader count={0} />
        <div className="bg-white border border-[#E6DFD5] flex flex-col items-center justify-center py-20 px-4 text-center gap-5">
          <div className="w-16 h-16 bg-[#F5EFE6] flex items-center justify-center">
            <BookOpen size={24} className="text-[#C6A66B]" strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="font-heading text-xl font-bold text-[#080808] mb-1">Your library is empty</h3>
            <p className="font-body text-sm text-[#777777]">Purchase eBooks to see them here.</p>
          </div>
          <Link
            href="/books"
            className="flex items-center gap-2 bg-[#203A2B] text-[#FFFCF7] font-body text-[11px] font-bold uppercase tracking-[0.12em] px-6 py-3 hover:bg-[#315B55] transition-colors"
          >
            <ShoppingBag size={13} /> Browse Books
          </Link>
        </div>
      </div>
    );
  }

  /* ── Fetch book details ───────────────────────────────────────────────────── */
  const books = await Promise.all(
    entitlements.map(async (ent) => {
      const doc = await adminDb.collection("books").doc(ent.productId).get();
      return doc.exists ? ({ id: doc.id, ...doc.data() } as Book) : null;
    })
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader count={entitlements.length} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {entitlements.map((ent, i) => {
          const book = books[i];
          if (!book) return null;
          return (
            <div
              key={ent.id}
              className="group bg-white border border-[#E6DFD5] hover:border-[#C6A66B] hover:shadow-md transition-all duration-200"
            >
              {/* Gold top accent on hover */}
              <div className="h-[2px] bg-gradient-to-r from-[#C6A66B] via-[#FFC928] to-[#C6A66B] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="p-5 flex gap-4">
                {/* Cover */}
                <Link href={`/books/${book.slug}`} className="shrink-0">
                  <div className="relative w-[52px] h-[74px] overflow-hidden bg-gradient-to-br from-[#203A2B] to-[#315B55] shadow-sm">
                    {book.coverImageUrl ? (
                      <Image
                        src={book.coverImageUrl}
                        alt={book.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="52px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen size={16} className="text-[#A8B5A0]" strokeWidth={1.5} />
                      </div>
                    )}
                    <div className="absolute inset-y-0 left-0 w-[3px] bg-gradient-to-b from-white/20 via-white/10 to-transparent" />
                  </div>
                </Link>

                {/* Info */}
                <div className="flex flex-col justify-between flex-1 min-w-0 py-0.5">
                  <div>
                    <Link href={`/books/${book.slug}`}>
                      <h3 className="font-heading text-[15px] font-bold text-[#080808] hover:text-[#203A2B] transition-colors line-clamp-2 leading-snug">
                        {book.title}
                      </h3>
                    </Link>
                    <p className="text-[11px] font-body text-[#A8B5A0] mt-0.5 uppercase tracking-wide">
                      {book.author}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[10px] font-body font-semibold text-[#C6A66B] border border-[#C6A66B]/40 px-1.5 py-0.5 uppercase tracking-wider">
                        PDF
                      </span>
                      <span className="text-[10px] font-body text-[#A8B5A0]">
                        Purchased {formatDate(ent.createdAt)}
                      </span>
                    </div>
                    {book.pricePaise > 0 && (
                      <p className="text-[11px] font-body font-bold text-[#203A2B] mt-1 tabular-nums">
                        {formatINR(book.pricePaise)}
                      </p>
                    )}
                  </div>

                  <a
                    href={`/api/downloads/secure?bookId=${book.id}`}
                    className="mt-3 inline-flex items-center gap-2 bg-[#203A2B] text-[#FFC928] font-body text-[10px] font-bold uppercase tracking-[0.1em] px-3 py-2 hover:bg-[#315B55] transition-colors w-fit"
                  >
                    <span className="text-base leading-none">↓</span> Download PDF
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Browse more */}
      <Link
        href="/books"
        className="group self-start flex items-center gap-2 border border-[#E6DFD5] bg-white text-[#203A2B] font-body text-[11px] font-bold uppercase tracking-[0.12em] px-5 py-3 hover:border-[#C6A66B] transition-colors"
      >
        <ShoppingBag size={13} />
        Discover More Books
        <ArrowRight size={12} className="text-[#C6A66B] group-hover:translate-x-0.5 transition-transform" />
      </Link>
    </div>
  );
}

function PageHeader({ count }: { count: number }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <p className="text-[10px] font-body uppercase tracking-[0.25em] text-[#A8B5A0] mb-1">Your collection</p>
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-[#080808] leading-none">My Library</h1>
      </div>
      {count > 0 && (
        <span className="font-body text-[12px] text-[#A8B5A0] pb-0.5">
          {count} {count === 1 ? "eBook" : "eBooks"} owned
        </span>
      )}
    </div>
  );
}
