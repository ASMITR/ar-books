import { notFound } from "next/navigation";
import { getArticleBySlug, getPublishedArticles, getStoreSettings } from "@/lib/firebase/firestore";
import { formatDate } from "@/lib/utils";
import { ReadingProgress } from "@/components/shared/ReadingProgress";
import { ArticleContent } from "@/components/article/ArticleContent";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Calendar, Clock, User } from "lucide-react";
import type { Metadata } from "next";

interface Props { params: Promise<{ slug: string }>; }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: "Article Not Found" };
  return {
    title: article.title,
    description: article.excerpt,
    openGraph: { images: article.coverImageUrl ? [article.coverImageUrl] : [] },
  };
}

function readingTime(content: string) {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

export default async function ArticleDetailPage({ params }: Props) {
  const { slug } = await params;

  const [article, settings] = await Promise.all([
    getArticleBySlug(slug),
    getStoreSettings(),
  ]);
  if (!article) notFound();

  // getAdjacentArticles internally calls getPublishedArticles, which is now
  // cached — but we also need allArticles for related articles, so we fetch
  // it once here and pass the adjacent data alongside.
  const allArticles = await getPublishedArticles();
  const idx = allArticles.findIndex((a) => a.id === article.id);
  const adjacent = {
    prev: idx < allArticles.length - 1 ? allArticles[idx + 1] : null,
    next: idx > 0 ? allArticles[idx - 1] : null,
  };

  const related = allArticles.filter((a) => a.id !== article.id).slice(0, 3);
  const mins = readingTime(article.content);

  return (
    <div className="bg-[#F5EFE6] min-h-screen">
      <ReadingProgress />

      {/* ── Hero ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#203A2B] flex flex-col justify-end">

        {/* Blurred cover as backdrop */}
        {article.coverImageUrl && (
          <Image
            src={article.coverImageUrl}
            alt=""
            fill
            className="object-cover opacity-20 blur-sm scale-105"
            priority
            aria-hidden
          />
        )}

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#203A2B] via-[#203A2B]/80 to-[#203A2B]/40" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,#315B55_0%,transparent_60%)] opacity-50" />

        {/* Gold top accent line */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#C6A66B] via-[#e0c080] to-[#C6A66B]" />

        <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-10 w-full">

          {/* Back link */}
          <Link
            href="/articles"
            className="inline-flex items-center gap-2 text-[11px] font-body font-semibold uppercase tracking-[0.12em] text-[#A8B5A0] hover:text-[#FFFCF7] transition-colors mb-7"
          >
            <ArrowLeft size={13} /> All Articles
          </Link>

          <div className="max-w-3xl">
            {/* Title */}
            <h1 className="font-heading text-[34px] sm:text-[48px] lg:text-[58px] font-bold text-[#FFFCF7] leading-tight tracking-tight mb-3">
              {article.title}
            </h1>

            {/* Excerpt — subtitle style */}
            <p className="font-body text-[13px] sm:text-[14px] text-[#7A9E8E] leading-relaxed mb-6 max-w-2xl">
              {article.excerpt}
            </p>

            {/* Meta pills */}
            <div className="flex flex-wrap items-center gap-2">
              {article.publishedAt && (
                <span className="inline-flex items-center gap-1.5 bg-[#FFFCF7]/8 border border-[#FFFCF7]/12 text-[#A8B5A0] text-[10px] font-body uppercase tracking-[0.12em] px-3 py-1 rounded-full">
                  <Calendar size={9} /> {formatDate(article.publishedAt)}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 bg-[#FFFCF7]/8 border border-[#FFFCF7]/12 text-[#A8B5A0] text-[10px] font-body uppercase tracking-[0.12em] px-3 py-1 rounded-full">
                <Clock size={9} /> {mins} min read
              </span>
              <span className="inline-flex items-center gap-1.5 bg-[#FFFCF7]/8 border border-[#FFFCF7]/12 text-[#A8B5A0] text-[10px] font-body uppercase tracking-[0.12em] px-3 py-1 rounded-full">
                <User size={9} /> Asmit Rajaramkar
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Article body ──────────────────────────────────────────────────── */}
      <section className="py-12 lg:py-16">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-10 lg:gap-16 items-start">

            {/* Content */}
            <div className="bg-[#FFFCF7] border border-[#E6DFD5] rounded-sm px-6 sm:px-10 py-10 min-w-0">
              <ArticleContent content={article.content} />

              {/* Author card */}              <div className="mt-12 pt-8 border-t border-[#E6DFD5] flex items-center gap-4">
                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-[#F5EFE6] border border-[#E6DFD5] shrink-0">
                  {settings?.authorPhotoUrl ? (
                    <Image src={settings.authorPhotoUrl} alt="Asmit Rajaramkar" fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User size={20} className="text-[#A8B5A0]" />
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-[10px] font-body uppercase tracking-[0.15em] text-[#A8B5A0] mb-0.5">Written by</p>
                  <p className="font-heading text-[15px] font-bold text-[#242824]">Asmit Rajaramkar</p>
                </div>
                <Link
                  href="/about"
                  className="ml-auto shrink-0 text-[11px] font-body font-bold uppercase tracking-[0.12em] text-[#203A2B] border-b border-[#203A2B] pb-0.5 hover:text-[#315B55] hover:border-[#315B55] transition-colors"
                >
                  About the Author
                </Link>
              </div>
            </div>

            {/* Sidebar */}
            <aside className="flex flex-col gap-5 lg:sticky lg:top-28">

              {/* Article info */}
              <div className="bg-[#FFFCF7] border border-[#E6DFD5] rounded-sm p-5">
                <p className="text-[10px] font-body font-bold uppercase tracking-[0.2em] text-[#A8B5A0] mb-4">Article Info</p>
                <div className="flex flex-col gap-3">
                  {article.publishedAt && (
                    <div className="flex items-center gap-2.5">
                      <Calendar size={13} className="text-[#203A2B] shrink-0" />
                      <div>
                        <p className="text-[10px] font-body text-[#A8B5A0] uppercase tracking-wider">Published</p>
                        <p className="text-[12px] font-body font-semibold text-[#242824]">{formatDate(article.publishedAt)}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-2.5">
                    <Clock size={13} className="text-[#203A2B] shrink-0" />
                    <div>
                      <p className="text-[10px] font-body text-[#A8B5A0] uppercase tracking-wider">Reading Time</p>
                      <p className="text-[12px] font-body font-semibold text-[#242824]">{mins} min read</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <User size={13} className="text-[#203A2B] shrink-0" />
                    <div>
                      <p className="text-[10px] font-body text-[#A8B5A0] uppercase tracking-wider">Author</p>
                      <p className="text-[12px] font-body font-semibold text-[#242824]">Asmit Rajaramkar</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Browse books CTA */}
              <div className="bg-[#203A2B] rounded-sm p-5">
                <p className="text-[10px] font-body font-bold uppercase tracking-[0.2em] text-[#A8B5A0] mb-2">The Collection</p>
                <p className="font-heading text-[16px] font-bold text-[#FFFCF7] leading-snug mb-4">
                  Enjoyed this article?
                </p>
                <Link
                  href="/books"
                  className="flex items-center justify-center gap-2 bg-[#C6A66B] text-[#242824] font-body text-[11px] font-bold uppercase tracking-[0.12em] px-4 py-2.5 hover:bg-[#d4b77e] transition-colors rounded-sm"
                >
                  Browse Books <ArrowRight size={12} />
                </Link>
              </div>

            </aside>
          </div>
        </div>
      </section>

      {/* ── Prev / Next ───────────────────────────────────────────────────── */}
      {(adjacent.prev || adjacent.next) && (
        <section className="bg-[#FFFCF7] border-y border-[#E6DFD5] py-6">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {adjacent.prev ? (
                <Link
                  href={`/articles/${adjacent.prev.slug}`}
                  className="group flex items-center gap-4 p-4 border border-[#E6DFD5] rounded-sm hover:border-[#203A2B]/40 hover:shadow-sm transition-all duration-200 bg-[#FFFCF7]"
                >
                  <ArrowLeft size={16} className="shrink-0 text-[#A8B5A0] group-hover:text-[#203A2B] transition-colors" />
                  <div className="min-w-0">
                    <p className="text-[10px] font-body uppercase tracking-[0.15em] text-[#A8B5A0] mb-0.5">Previous</p>
                    <p className="font-heading text-[13px] font-bold text-[#242824] group-hover:text-[#203A2B] transition-colors line-clamp-1">
                      {adjacent.prev.title}
                    </p>
                  </div>
                </Link>
              ) : <div />}

              {adjacent.next && (
                <Link
                  href={`/articles/${adjacent.next.slug}`}
                  className="group flex items-center justify-end gap-4 p-4 border border-[#E6DFD5] rounded-sm hover:border-[#203A2B]/40 hover:shadow-sm transition-all duration-200 bg-[#FFFCF7] text-right"
                >
                  <div className="min-w-0">
                    <p className="text-[10px] font-body uppercase tracking-[0.15em] text-[#A8B5A0] mb-0.5">Next</p>
                    <p className="font-heading text-[13px] font-bold text-[#242824] group-hover:text-[#203A2B] transition-colors line-clamp-1">
                      {adjacent.next.title}
                    </p>
                  </div>
                  <ArrowRight size={16} className="shrink-0 text-[#A8B5A0] group-hover:text-[#203A2B] transition-colors" />
                </Link>
              )}

            </div>
          </div>
        </section>
      )}

      {/* ── Related Articles ──────────────────────────────────────────────── */}
      {related.length > 0 && (
        <section className="py-12 lg:py-16">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between gap-4 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-1 h-6 rounded-full bg-[#203A2B]" />
                  <p className="text-[10px] font-body font-bold uppercase tracking-[0.2em] text-[#A8B5A0]">Keep Reading</p>
                </div>
                <h2 className="font-heading text-[24px] sm:text-[28px] font-bold text-[#242824]">More Articles</h2>
              </div>
              <Link
                href="/articles"
                className="shrink-0 inline-flex items-center gap-1.5 text-[11px] font-body font-bold uppercase tracking-[0.12em] text-[#203A2B] border-b border-[#203A2B] pb-0.5 hover:text-[#315B55] hover:border-[#315B55] transition-colors"
              >
                All Articles <ArrowRight size={12} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
              {related.map((a) => (
                <Link
                  key={a.id}
                  href={`/articles/${a.slug}`}
                  className="group bg-[#FFFCF7] border border-[#E6DFD5] rounded-sm flex flex-col overflow-hidden
                    hover:border-[#203A2B]/40 hover:shadow-[0_8px_32px_rgba(32,58,43,0.10)] transition-all duration-300"
                >
                  <div className="h-[2.5px] bg-gradient-to-r from-[#C6A66B] via-[#e0c080] to-[#C6A66B]
                    scale-x-0 group-hover:scale-x-100 transition-transform duration-400 origin-left" />
                  <div className="relative h-44 bg-[#F5EFE6] overflow-hidden">
                    {a.coverImageUrl ? (
                      <Image src={a.coverImageUrl} alt={a.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="font-heading text-[#E6DFD5] text-5xl font-bold">AR</span>
                      </div>
                    )}
                  </div>
                  <div className="h-px bg-[#E6DFD5] group-hover:bg-[#203A2B]/20 transition-colors duration-300" />
                  <div className="p-5 flex flex-col gap-2 flex-1">
                    {a.publishedAt && (
                      <p className="text-[10px] font-body uppercase tracking-[0.15em] text-[#A8B5A0]">{formatDate(a.publishedAt)}</p>
                    )}
                    <h3 className="font-heading text-[15px] font-bold text-[#242824] group-hover:text-[#203A2B] transition-colors leading-snug line-clamp-2">
                      {a.title}
                    </h3>
                    <p className="font-body text-[12px] text-[#777] leading-relaxed line-clamp-2 flex-1">{a.excerpt}</p>
                    <span className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-body font-bold uppercase tracking-[0.12em] text-[#203A2B] group-hover:text-[#315B55] transition-colors">
                      Read More <ArrowRight size={11} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

    </div>
  );
}
