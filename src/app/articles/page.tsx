import { getPublishedArticles } from "@/lib/firebase/firestore";
import { EmptyState } from "@/components/shared/EmptyState";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Articles",
  description: "Writing notes, book insights, and ideas from Asmit Rajaramkar.",
};

export default async function ArticlesPage() {
  const articles = await getPublishedArticles();
  const [featured, ...rest] = articles;

  return (
    <div className="bg-[#F5EFE6] min-h-screen">

      {/* ── Page header ───────────────────────────────────────────────────── */}
      <section className="bg-[#FFFCF7] border-b border-[#E6DFD5]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-7 sm:py-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="w-1 h-7 rounded-full bg-[#203A2B]" />
              <div>
                <h1 className="font-heading text-[22px] sm:text-[26px] font-bold text-[#242824] leading-none">
                  Articles
                </h1>
                <p className="font-body text-[11px] text-[#A8B5A0] mt-1 tracking-wide">
                  Writing notes, insights &amp; ideas
                </p>
              </div>
            </div>
            {articles.length > 0 && (
              <div className="shrink-0 text-right">
                <p className="font-heading text-[20px] font-bold text-[#203A2B] leading-none">{articles.length}</p>
                <p className="text-[10px] font-body text-[#A8B5A0] uppercase tracking-wider">Articles</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Content ───────────────────────────────────────────────────────── */}
      <section className="py-10 lg:py-14">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">

          {articles.length === 0 ? (
            <EmptyState
              title="No articles yet"
              description="Check back soon for writing notes and insights."
              actionLabel="Browse My Books"
              actionHref="/books"
            />
          ) : (
            <div className="flex flex-col gap-8">

              {/* ── Featured ──────────────────────────────────────────────── */}
              {featured && (
                <Link
                  href={`/articles/${featured.slug}`}
                  className="group grid grid-cols-1 lg:grid-cols-2 bg-[#FFFCF7] border border-[#E6DFD5] rounded-sm overflow-hidden
                    hover:border-[#203A2B]/40 hover:shadow-[0_8px_32px_rgba(32,58,43,0.10)] transition-all duration-300"
                >
                  {/* Image */}
                  <div className="relative h-56 sm:h-72 lg:h-full min-h-[280px] bg-[#F5EFE6] overflow-hidden">
                    {featured.coverImageUrl ? (
                      <Image
                        src={featured.coverImageUrl}
                        alt={featured.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="font-heading text-[#E6DFD5] text-7xl font-bold">AR</span>
                      </div>
                    )}
                    {/* Gold top accent */}
                    <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#C6A66B] via-[#e0c080] to-[#C6A66B]
                      scale-x-0 group-hover:scale-x-100 transition-transform duration-400 origin-left" />
                  </div>

                  {/* Text */}
                  <div className="p-7 sm:p-10 flex flex-col justify-center gap-4">
                    <div className="flex items-center gap-3">
                      <span className="bg-[#203A2B] text-[#FFFCF7] text-[9px] font-body font-bold uppercase tracking-widest px-2.5 py-1 rounded-sm">
                        Featured
                      </span>
                      {featured.publishedAt && (
                        <p className="text-[11px] font-body text-[#A8B5A0]">{formatDate(featured.publishedAt)}</p>
                      )}
                    </div>
                    <h2 className="font-heading text-[22px] sm:text-[28px] font-bold text-[#242824] group-hover:text-[#203A2B] transition-colors leading-tight">
                      {featured.title}
                    </h2>
                    <p className="font-body text-[13px] text-[#777] leading-relaxed line-clamp-3">
                      {featured.excerpt}
                    </p>
                    <span className="inline-flex items-center gap-2 text-[11px] font-body font-bold uppercase tracking-[0.12em] text-[#203A2B] border-b border-[#203A2B] pb-0.5 w-fit group-hover:text-[#315B55] group-hover:border-[#315B55] transition-colors">
                      Read Article <ArrowRight size={12} />
                    </span>
                  </div>
                </Link>
              )}

              {/* ── Rest ──────────────────────────────────────────────────── */}
              {rest.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
                  {rest.map((article) => (
                    <Link
                      key={article.id}
                      href={`/articles/${article.slug}`}
                      className="group bg-[#FFFCF7] border border-[#E6DFD5] rounded-sm flex flex-col overflow-hidden
                        hover:border-[#203A2B]/40 hover:shadow-[0_8px_32px_rgba(32,58,43,0.10)] transition-all duration-300"
                    >
                      {/* Gold top accent */}
                      <div className="h-[2.5px] bg-gradient-to-r from-[#C6A66B] via-[#e0c080] to-[#C6A66B]
                        scale-x-0 group-hover:scale-x-100 transition-transform duration-400 origin-left" />

                      {/* Cover */}
                      <div className="relative h-44 bg-[#F5EFE6] overflow-hidden">
                        {article.coverImageUrl ? (
                          <Image
                            src={article.coverImageUrl}
                            alt={article.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="font-heading text-[#E6DFD5] text-5xl font-bold">AR</span>
                          </div>
                        )}
                      </div>

                      <div className="h-px bg-[#E6DFD5] group-hover:bg-[#203A2B]/20 transition-colors duration-300" />

                      {/* Info */}
                      <div className="p-5 flex flex-col gap-2 flex-1">
                        {article.publishedAt && (
                          <p className="text-[10px] font-body uppercase tracking-[0.15em] text-[#A8B5A0]">
                            {formatDate(article.publishedAt)}
                          </p>
                        )}
                        <h2 className="font-heading text-[16px] font-bold text-[#242824] group-hover:text-[#203A2B] transition-colors leading-snug line-clamp-2">
                          {article.title}
                        </h2>
                        <p className="font-body text-[12px] text-[#777] leading-relaxed line-clamp-3 flex-1">
                          {article.excerpt}
                        </p>
                        <span className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-body font-bold uppercase tracking-[0.12em] text-[#203A2B] group-hover:text-[#315B55] transition-colors">
                          Read More <ArrowRight size={11} />
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

            </div>
          )}
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="bg-[#FFFCF7] border-t border-[#E6DFD5] py-12 lg:py-14">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-sm bg-[#203A2B] px-8 sm:px-12 py-10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="absolute top-0 right-0 w-72 h-72 bg-[#315B55] rounded-full blur-3xl opacity-25 -translate-y-1/2 translate-x-1/4" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-4 h-px bg-[#C6A66B]" />
                <p className="text-[10px] font-body font-bold uppercase tracking-[0.2em] text-[#A8B5A0]">The Collection</p>
              </div>
              <h2 className="font-heading text-[26px] sm:text-[32px] font-bold text-[#FFFCF7] leading-tight">
                Enjoyed the articles?
              </h2>
              <p className="font-body text-[13px] text-[#A8B5A0] mt-1">Explore the full book catalog.</p>
            </div>
            <Link
              href="/books"
              className="relative z-10 shrink-0 inline-flex items-center gap-2.5 bg-[#C6A66B] text-[#242824] font-body text-[11px] font-bold uppercase tracking-[0.15em] px-7 py-3.5 hover:bg-[#d4b77e] transition-colors rounded-sm"
            >
              Browse Books <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
