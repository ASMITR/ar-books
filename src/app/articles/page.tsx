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
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="bg-[#FAF9F6] border-b border-[#E9E7E2]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <p className="text-xs font-body uppercase tracking-[0.2em] text-[#789185] mb-2">From the Author</p>
              <h1 className="font-heading text-4xl sm:text-5xl font-bold text-[#080808]">Articles</h1>
              <p className="font-body text-[#777777] mt-2 max-w-md">
                Writing notes, book insights, and ideas from Asmit Rajaramkar.
              </p>
            </div>
            {articles.length > 0 && (
              <p className="text-xs font-body uppercase tracking-[0.15em] text-[#777777] shrink-0">
                {articles.length} article{articles.length !== 1 ? "s" : ""}
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="bg-[#FAF9F6] py-12 lg:py-16 min-h-screen">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">

          {articles.length === 0 ? (
            <EmptyState
              title="No articles yet"
              description="Check back soon for writing notes and insights."
              actionLabel="Browse My Books"
              actionHref="/books"
            />
          ) : (
            <div className="flex flex-col gap-12">

              {/* ── Featured Article ─────────────────────────────────────── */}
              {featured && (
                <Link
                  href={`/articles/${featured.slug}`}
                  className="group grid grid-cols-1 lg:grid-cols-2 bg-white border border-[#E9E7E2] hover:shadow-md hover:border-[#789185] transition-all duration-200 overflow-hidden"
                >
                  <div className="relative h-56 sm:h-72 lg:h-full min-h-[260px] bg-[#E9E7E2]">
                    {featured.coverImageUrl ? (
                      <Image
                        src={featured.coverImageUrl}
                        alt={featured.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#789185]/10 flex items-center justify-center">
                        <span className="font-heading text-[#789185]/40 text-6xl font-bold">AR</span>
                      </div>
                    )}
                  </div>
                  <div className="p-7 sm:p-10 flex flex-col justify-center gap-4">
                    <div className="flex items-center gap-3">
                      <span className="bg-[#FFC928] text-[#080808] text-[10px] font-body font-bold uppercase tracking-widest px-3 py-1">
                        Featured
                      </span>
                      {featured.publishedAt && (
                        <p className="text-xs font-body text-[#777777]">{formatDate(featured.publishedAt)}</p>
                      )}
                    </div>
                    <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#080808] group-hover:text-[#789185] transition-colors leading-tight">
                      {featured.title}
                    </h2>
                    <p className="font-body text-[#777777] leading-relaxed line-clamp-3">{featured.excerpt}</p>
                    <span className="inline-flex items-center gap-2 text-xs font-body font-bold uppercase tracking-wider text-[#080808] border-b-2 border-[#FFC928] pb-1 w-fit group-hover:text-[#789185] transition-colors">
                      Read Article <ArrowRight size={12} />
                    </span>
                  </div>
                </Link>
              )}

              {/* ── Rest of Articles ─────────────────────────────────────── */}
              {rest.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {rest.map((article) => (
                    <Link
                      key={article.id}
                      href={`/articles/${article.slug}`}
                      className="group bg-white border border-[#E9E7E2] flex flex-col hover:shadow-md hover:border-[#789185] transition-all duration-200 overflow-hidden"
                    >
                      <div className="relative h-44 bg-[#E9E7E2] overflow-hidden">
                        {article.coverImageUrl ? (
                          <Image
                            src={article.coverImageUrl}
                            alt={article.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full bg-[#789185]/10 flex items-center justify-center">
                            <span className="font-heading text-[#789185]/40 text-4xl font-bold">AR</span>
                          </div>
                        )}
                      </div>
                      <div className="p-5 flex flex-col gap-2 flex-1">
                        {article.publishedAt && (
                          <p className="text-[11px] font-body uppercase tracking-wider text-[#777777]">
                            {formatDate(article.publishedAt)}
                          </p>
                        )}
                        <h2 className="font-heading text-lg font-bold text-[#080808] group-hover:text-[#789185] transition-colors leading-tight line-clamp-2">
                          {article.title}
                        </h2>
                        <p className="font-body text-sm text-[#777777] leading-relaxed line-clamp-3 flex-1">
                          {article.excerpt}
                        </p>
                        <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-body font-bold uppercase tracking-wider text-[#789185] group-hover:text-[#080808] transition-colors">
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

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="bg-[#080808] py-14">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-xs font-body uppercase tracking-[0.2em] text-[#789185] mb-2">The Collection</p>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white">
              Enjoyed the articles?
            </h2>
            <p className="font-body text-white/50 mt-1">Explore the full book catalog.</p>
          </div>
          <Link
            href="/books"
            className="shrink-0 inline-flex items-center gap-2 bg-[#FFC928] text-[#080808] font-body text-xs font-bold uppercase tracking-widest px-8 py-4 hover:bg-[#F2B916] transition-colors"
          >
            Browse My Books <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    </>
  );
}
