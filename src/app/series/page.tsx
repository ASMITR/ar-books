import { getVisibleSeries, getPublishedBooks } from "@/lib/firebase/firestore";
import { PageHeader, CtaBanner } from "@/components/shared/PageHeader";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Layers, BookOpen } from "lucide-react";
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

      <section className="py-12 lg:py-16">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {allSeries.map((s, i) => {
                const bookCount = countMap[s.id] ?? 0;
                return (
                  <Link
                    key={s.id}
                    href={`/series/${s.slug}`}
                    className="group flex flex-col bg-white border border-[#ECEAE5] rounded-2xl overflow-hidden
                      hover:border-[#203A2B]/25 hover:shadow-[0_12px_40px_rgba(0,0,0,0.10)]
                      transition-all duration-300"
                  >
                    {/* Banner */}
                    <div className="relative h-44 bg-[#0D1F17] overflow-hidden shrink-0">
                      {s.coverImageUrl ? (
                        <Image
                          src={s.coverImageUrl}
                          alt={s.name}
                          fill
                          className="object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          priority={i < 3}
                        />
                      ) : (
                        <>
                          <div className="absolute inset-0"
                            style={{ backgroundImage: "radial-gradient(circle at 20% 50%, #203A2B 0%, #0D1F17 60%)" }}
                          />
                          <div className="absolute inset-0 opacity-10"
                            style={{
                              backgroundImage: "repeating-linear-gradient(45deg, #C6A66B 0px, #C6A66B 1px, transparent 0px, transparent 50%)",
                              backgroundSize: "20px 20px",
                            }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Layers size={32} className="text-white/20" strokeWidth={1} />
                          </div>
                        </>
                      )}

                      {/* Book count pill */}
                      <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5
                        bg-black/40 backdrop-blur-sm border border-white/15
                        px-2.5 py-1 rounded-full">
                        <BookOpen size={10} className="text-white/80" strokeWidth={2} />
                        <span className="font-body text-[10px] font-bold text-white/90 uppercase tracking-[0.1em]">
                          {bookCount} {bookCount === 1 ? "Book" : "Books"}
                        </span>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="flex flex-col flex-1 p-4 gap-2">
                      <div>
                        <p className="font-body text-[9px] font-bold uppercase tracking-[0.2em] text-[#C6A66B] mb-1">Series</p>
                        <h2 className="font-heading text-[17px] font-bold text-[#111] leading-snug group-hover:text-[#203A2B] transition-colors">
                          {s.name}
                        </h2>
                      </div>

                      {s.description && (
                        <p className="font-body text-[12px] text-[#888] leading-relaxed line-clamp-2">
                          {s.description}
                        </p>
                      )}

                      <div className="mt-auto flex items-center justify-between pt-3 border-t border-[#F0EDE8]">
                        <span className="font-body text-[11px] text-[#B8B3AB]">
                          {bookCount} {bookCount === 1 ? "book" : "books"}
                        </span>
                        <span className="flex items-center gap-1.5 font-body text-[11px] font-bold
                          uppercase tracking-[0.1em] text-[#203A2B]
                          group-hover:gap-2.5 transition-all duration-200">
                          Explore <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
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
