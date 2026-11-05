import { getVisibleSeries, getPublishedBooks } from "@/lib/firebase/firestore";
import { PageHeader, CtaBanner } from "@/components/shared/PageHeader";
import Link from "next/link";
import { ArrowRight, Layers } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Book Series",
  description: "Explore book series by Asmit Rajaramkar.",
};

export const revalidate = 300;

export default async function SeriesListPage() {
  const [allSeries, allBooks] = await Promise.all([
    getVisibleSeries(),
    getPublishedBooks(),
  ]);

  const countMap: Record<string, number> = {};
  for (const book of allBooks) {
    if (book.seriesId) countMap[book.seriesId] = (countMap[book.seriesId] ?? 0) + 1;
  }

  return (
    <div className="bg-[#FAFAF7] min-h-screen">
      <PageHeader
        eyebrow="Collections"
        title="Book Series"
        subtitle="Multi-book collections grouped by theme or journey"
        meta={[
          { label: "Series", value: allSeries.length },
          { label: "Titles", value: allBooks.length },
        ]}
      />

      <section className="py-10 lg:py-14">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          {allSeries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-5 text-center">
              <div className="w-14 h-14 bg-[#F0EDE8] rounded-2xl flex items-center justify-center">
                <Layers size={22} className="text-[#C8C3BC]" strokeWidth={1.5} />
              </div>
              <div>
                <p className="font-heading text-xl font-bold text-[#111] mb-2">No series yet</p>
                <p className="font-body text-sm text-[#999]">Check back soon.</p>
              </div>
              <Link
                href="/books"
                className="inline-flex items-center gap-2 bg-[#0D1F17] text-white font-body text-[11px] font-bold uppercase tracking-[0.14em] px-6 py-3 rounded-xl hover:bg-[#203A2B] transition-colors mt-2"
              >
                Browse All Books <ArrowRight size={12} />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-5">
              {allSeries.map((s) => {
                const bookCount = countMap[s.id] ?? 0;
                return (
                  <Link
                    key={s.id}
                    href={`/series/${s.slug}`}
                    className="group flex flex-col bg-white border border-[#ECEAE5] rounded-2xl overflow-hidden hover:border-[#203A2B]/25 hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] transition-all duration-300"
                  >
                    <div className="flex flex-col gap-3 p-5 sm:p-6 flex-1">
                      <div className="w-10 h-10 bg-[#0D1F17]/6 rounded-xl flex items-center justify-center shrink-0">
                        <Layers size={17} className="text-[#203A2B]" strokeWidth={1.5} />
                      </div>
                      <div className="flex flex-col gap-1.5 flex-1">
                        <h2 className="font-heading text-[17px] font-bold text-[#111] leading-snug group-hover:text-[#203A2B] transition-colors">
                          {s.name}
                        </h2>
                        {s.description && (
                          <p className="font-body text-[12px] text-[#888] leading-relaxed line-clamp-2">
                            {s.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-[#F0EDE8]">
                        <span className="font-body text-[11px] text-[#B8B3AB]">
                          {bookCount} {bookCount === 1 ? "book" : "books"}
                        </span>
                        <span className="flex items-center gap-1 font-body text-[11px] font-bold uppercase tracking-[0.1em] text-[#203A2B] group-hover:gap-2 transition-all">
                          Explore <ArrowRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {allSeries.length > 0 && (
        <CtaBanner
          eyebrow="Full Collection"
          title="Looking for something specific?"
          subtitle={`Browse all ${allBooks.length} titles in one place.`}
          href="/books"
          label="All eBooks →"
        />
      )}
    </div>
  );
}
