import { getPublishedArticles } from "@/lib/firebase/firestore";
import { BrandStripeDivider } from "@/components/shared/BrandStripeDivider";
import { EmptyState } from "@/components/shared/EmptyState";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Articles",
  description: "Writing notes, book insights, and ideas from Asmit Rajaramkar.",
};

export default async function ArticlesPage() {
  const articles = await getPublishedArticles();

  return (
    <div className="bg-[#FAF9F6] min-h-screen">
      <div className="bg-[#789185] py-12">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-heading text-5xl font-bold text-white">Articles</h1>
          <p className="font-body text-white/70 mt-2">Writing notes, ideas, and book insights.</p>
        </div>
      </div>

      <BrandStripeDivider />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {articles.length === 0 ? (
          <EmptyState
            title="No articles yet"
            description="Check back soon for writing notes and insights."
            actionLabel="Browse My Books"
            actionHref="/books"
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <Link
                key={article.id}
                href={`/articles/${article.slug}`}
                className="group bg-white border border-[#E9E7E2] flex flex-col hover:shadow-md transition-shadow"
              >
                {article.coverImageUrl ? (
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={article.coverImageUrl}
                      alt={article.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="h-48 bg-[#789185] flex items-center justify-center">
                    <span className="font-heading text-white/40 text-4xl">AR</span>
                  </div>
                )}
                <div className="p-5 flex flex-col gap-2 flex-1">
                  {article.publishedAt && (
                    <p className="text-xs font-body uppercase tracking-wider text-[#777777]">
                      {formatDate(article.publishedAt)}
                    </p>
                  )}
                  <h2 className="font-heading text-xl font-bold text-[#080808] group-hover:text-[#789185] transition-colors leading-tight">
                    {article.title}
                  </h2>
                  <p className="font-body text-sm text-[#777777] leading-relaxed line-clamp-3">
                    {article.excerpt}
                  </p>
                  <span className="mt-auto pt-3 text-xs font-body font-medium uppercase tracking-wider text-[#789185] group-hover:text-[#080808] transition-colors">
                    Read More →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
