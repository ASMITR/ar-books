import { getSessionUser } from "@/lib/firebase/auth-server";
import { getEntitlementsByCustomer } from "@/lib/firebase/firestore";
import { adminDb } from "@/lib/firebase/admin";
import { BookCover } from "@/components/book/BookCover";
import { EmptyState } from "@/components/shared/EmptyState";
import { formatDate } from "@/lib/utils";
import { Download } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import type { Book } from "@/types";

export const metadata: Metadata = { title: "My Library" };

export default async function LibraryPage() {
  const user = await getSessionUser();
  const entitlements = await getEntitlementsByCustomer(user!.uid);

  if (entitlements.length === 0) {
    return (
      <EmptyState
        title="Your library is empty"
        description="Purchase eBooks to see them here."
        actionLabel="Browse Books"
        actionHref="/books"
      />
    );
  }

  // Fetch book details for each entitlement
  const books = await Promise.all(
    entitlements.map(async (ent) => {
      const doc = await adminDb.collection("books").doc(ent.productId).get();
      return doc.exists ? ({ id: doc.id, ...doc.data() } as Book) : null;
    })
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-4xl font-bold text-[#080808]">My Library</h1>
        <p className="font-body text-[#777777] text-sm mt-1">{entitlements.length} eBook{entitlements.length !== 1 ? "s" : ""} owned</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {entitlements.map((ent, i) => {
          const book = books[i];
          if (!book) return null;
          return (
            <div key={ent.id} className="bg-white border border-[#E9E7E2] p-5 flex gap-4">
              <BookCover src={book.coverImageUrl} title={book.title} size="sm" />
              <div className="flex flex-col justify-between flex-1 min-w-0">
                <div>
                  <Link href={`/books/${book.slug}`}>
                    <h3 className="font-heading text-base font-semibold text-[#080808] hover:text-[#789185] transition-colors line-clamp-2">
                      {book.title}
                    </h3>
                  </Link>
                  <p className="text-xs text-[#777777] font-body mt-0.5">{book.author}</p>
                  <p className="text-xs text-[#777777] font-body mt-1">
                    Purchased {formatDate(ent.createdAt)}
                  </p>
                </div>
                <a
                  href={`/api/downloads/secure?bookId=${book.id}`}
                  className="mt-3 flex items-center gap-2 bg-[#FFC928] text-[#080808] font-body text-xs font-bold uppercase tracking-wider px-3 py-2 hover:bg-[#F2B916] transition-colors w-fit"
                >
                  <Download size={12} />
                  Download PDF
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
