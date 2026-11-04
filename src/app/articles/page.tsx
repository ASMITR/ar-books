import { getPublishedArticles } from "@/lib/firebase/firestore";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader, CtaBanner } from "@/components/shared/PageHeader";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Articles",
  description: "Writing notes, book insights, and ideas from Asmit Rajaramkar.",
};

export const revalidate = 300;

export default async function ArticlesPage() {
  const articles = await getPublishedArticles();
  const [featured, ...rest] = articles;

  return (
    <div className="bg-[#FAFAF7] min-h-screen">
      <PageHeader
        eyebrow="Writing & Ideas"
        title="Articles"
        subtitle="Notes, insights & ideas from the author"
        meta={articles.length > 0 ? [{ label: "Articles", value: articles.length }] : undefined}
      />

      <section className="py-10 lg:py-14">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          {articles.length === 0 ? (
            <EmptyState title="No articles yet" description="Check back soon for writing notes and insights." actionLabel="Browse My Books" actionHref="/books" />
          ) : (
            <div className="flex flex-col gap-6">

              {/* Featured */}
              {featured && (
                <Link href={`/articles/${featured.slug}`}
                  className="group grid grid-cols-1 lg:grid-cols-2 bg-white border border-[#ECEAE5] rounded-2xl overflow-hidden hover:border-[#203A2B]/25 hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] transition-all duration-300">
                  <div className="relative h-56 sm:h-72 lg:h-full min-h-[280px] bg-[#F5F2EE] overflow-hidden">
                    {featured.coverImageUrl ? (
                      <Image src={featured.coverImageUrl} alt={featured.title} fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="font-heading text-[#E0DDD8] text-7xl font-bold">AR</span>
                      </div>
                    )}
                  </div>
                  <div className="p-7 sm:p-10 flex flex-col justify-center gap-4">
                    <div className="flex items-center gap-3">
                      <span className="bg-[#0D1F17] text-white text-[9px] font-body font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">
                        Featured
                      </span>
                      {featured.publishedAt && (
                        <p className="text-[11px] font-body text-[#B8B3AB]">{formatDate(featured.publishedAt)}</p>
                      )}
                    </div>
                    <h2 className="font-heading text-[22px] sm:text-[28px] font-bold text-[#111] group-hover:text-[#203A2B] transition-colors leading-tight">
                      {featured.title}
                    </h2>
                    <p className="font-body text-[13px] text-[#777] leading-relaxed line-clamp-3">{featured.excerpt}</p>
                    <span className="inline-flex items-center gap-2 text-[11px] font-body font-bold uppercase tracking-[0.12em] text-[#203A2B] w-fit group-hover:gap-3 transition-all">
                      Read Article <ArrowRight size={12} />
                    </span>
                  </div>
                </Link>
              )}

              {/* Rest */}
              {rest.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
                  {rest.map((article) => (
                    <Link key={article.id} href={`/articles/${article.slug}`}
                      className="group bg-white border border-[#ECEAE5] rounded-2xl flex flex-col overflow-hidden hover:border-[#203A2B]/25 hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] transition-all duration-300">
                      <div className="relative h-44 bg-[#F5F2EE] overflow-hidden">
                        {article.coverImageUrl ? (
                          <Image src={article.coverImageUrl} alt={article.title} fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="font-heading text-[#E0DDD8] text-5xl font-bold">AR</span>
                          </div>
                        )}
                      </div>
                      <div className="p-5 flex flex-col gap-2 flex-1">
                        {article.publishedAt && (
                          <p className="text-[10px] font-body uppercase tracking-[0.15em] text-[#B8B3AB]">
                            {formatDate(article.publishedAt)}
                          </p>
                        )}
                        <h2 className="font-heading text-[16px] font-bold text-[#111] group-hover:text-[#203A2B] transition-colors leading-snug line-clamp-2">
                          {article.title}
                        </h2>
                        <p className="font-body text-[12px] text-[#777] leading-relaxed line-clamp-3 flex-1">{article.excerpt}</p>
                        <span className="mt-3 inline-flex items-center gap-1.5 text-[10.5px] font-body font-bold uppercase tracking-[0.12em] text-[#203A2B] group-hover:gap-2.5 transition-all">
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

      <CtaBanner eyebrow="The Collection" title="Enjoyed the articles?" subtitle="Explore the full book catalog." href="/books" label="Browse Books →" />
    </div>
  );
}
