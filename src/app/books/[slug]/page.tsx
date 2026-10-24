import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getBookBySlug, getPublishedBooks, getAllCategories } from "@/lib/firebase/firestore";
import { BookCover } from "@/components/book/BookCover";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { AddToCartButton } from "@/components/book/AddToCartButton";
import { formatINR } from "@/lib/currency";
import { BookOpen, FileText, Globe, CheckCircle } from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const book = await getBookBySlug(slug);
  if (!book) return { title: "Book Not Found" };
  return {
    title: book.seoTitle ?? book.title,
    description: book.seoDescription ?? book.description.slice(0, 160),
    openGraph: { images: book.coverImageUrl ? [book.coverImageUrl] : [] },
  };
}

export async function generateStaticParams() {
  const books = await getPublishedBooks();
  return books.map((b) => ({ slug: b.slug }));
}

export default async function BookPage({ params }: Props) {
  const { slug } = await params;
  const [book, allCategories] = await Promise.all([
    getBookBySlug(slug),
    getAllCategories(),
  ]);

  if (!book) notFound();

  const bookCategories = allCategories.filter((c) => book.categoryIds.includes(c.id));

  return (
    <div className="bg-[#FAF9F6] min-h-screen">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs
          crumbs={[
            { label: "Home", href: "/" },
            { label: "Books", href: "/books" },
            { label: book.title },
          ]}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-8">
          {/* Cover */}
          <div className="flex flex-col items-center lg:items-start gap-6">
            <div className="bg-white p-10 flex items-center justify-center w-full">
              <BookCover src={book.coverImageUrl} title={book.title} size="xl" perspective />
            </div>
            {book.previewPdfPath && (
              <a
                href={`/api/downloads/preview?bookId=${book.id}`}
                className="w-full text-center border border-[#E9E7E2] bg-white text-[#080808] font-body text-xs font-medium uppercase tracking-wider px-6 py-3 hover:bg-[#FAF9F6] transition-colors"
              >
                Read Sample Chapter
              </a>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col gap-5">
            {bookCategories.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {bookCategories.map((c) => (
                  <span key={c.id} className="text-xs font-body uppercase tracking-wider text-[#789185] border border-[#789185] px-2 py-0.5">
                    {c.name}
                  </span>
                ))}
              </div>
            )}

            <h1 className="font-heading text-4xl lg:text-5xl font-bold text-[#080808] leading-tight">
              {book.title}
            </h1>
            {book.subtitle && (
              <p className="font-heading text-xl text-[#777777]">{book.subtitle}</p>
            )}
            <p className="text-sm font-body text-[#777777] uppercase tracking-wider">
              by {book.author}
            </p>

            {/* Price */}
            <div className="flex items-center gap-3 py-2">
              <span className="font-heading text-3xl font-bold text-[#080808]">
                {formatINR(book.pricePaise)}
              </span>
              {book.originalPricePaise && (
                <span className="text-lg text-[#777777] line-through">
                  {formatINR(book.originalPricePaise)}
                </span>
              )}
            </div>

            {/* CTA */}
            <div className="flex gap-3">
              <AddToCartButton book={book} />
            </div>

            {/* Meta */}
            <div className="flex flex-wrap gap-4 py-4 border-y border-[#E9E7E2]">
              {book.pageCount && (
                <div className="flex items-center gap-2 text-sm text-[#777777]">
                  <BookOpen size={14} />
                  <span>{book.pageCount} pages</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-[#777777]">
                <FileText size={14} />
                <span>PDF Format</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#777777]">
                <Globe size={14} />
                <span>{book.language}</span>
              </div>
            </div>

            {/* Description */}
            <div>
              <h2 className="font-heading text-xl font-semibold text-[#080808] mb-3">About this Book</h2>
              <p className="font-body text-[#777777] leading-relaxed whitespace-pre-line">{book.description}</p>
            </div>

            {/* What you'll learn */}
            {book.whatYouLearn && book.whatYouLearn.length > 0 && (
              <div>
                <h2 className="font-heading text-xl font-semibold text-[#080808] mb-3">What You&apos;ll Learn</h2>
                <ul className="flex flex-col gap-2">
                  {book.whatYouLearn.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm font-body text-[#777777]">
                      <CheckCircle size={14} className="text-[#789185] mt-0.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Secure delivery note */}
            <div className="bg-[#FAF9F6] border border-[#E9E7E2] p-4 text-xs font-body text-[#777777]">
              🔒 Secure digital delivery. After verified payment, your eBook will be available in My Library for instant download.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
