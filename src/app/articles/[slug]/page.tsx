import { notFound } from "next/navigation";
import { adminDb } from "@/lib/firebase/admin";
import { getPublishedArticles } from "@/lib/firebase/firestore";
import { formatDate } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Calendar, User } from "lucide-react";
import type { Metadata } from "next";
import type { Article } from "@/types";

interface Props { params: Promise<{ slug: string }>; }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const snap = await adminDb.collection("articles").where("slug", "==", slug).where("published", "==", true).limit(1).get();
  if (snap.empty) return { title: "Article Not Found" };
  const article = snap.docs[0].data() as Article;
  return {
    title: article.title,
    description: article.excerpt,
    openGraph: { images: article.coverImageUrl ? [article.coverImageUrl] : [] },
  };
}

export default async function ArticleDetailPage({ params }: Props) {
  const { slug } = await params;
  const snap = await adminDb.collection("articles").where("slug", "==", slug).where("published", "==", true).limit(1).get();
  if (snap.empty) notFound();

  const article = { id: snap.docs[0].id, ...snap.docs[0].data() } as Article;
  const allArticles = await getPublishedArticles();
  const related = allArticles.filter((a) => a.id !== article.id).slice(0, 3);

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="bg-[#FAF9F6] border-b border-[#E9E7E2]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <Link
            href="/articles"
            className="inline-flex items-center gap-2 text-xs font-body uppercase tracking-wider text-[#777777] hover:text-[#080808] transition-colors mb-8"
          >
            <ArrowLeft size={12} /> All Articles
          </Link>

          <div className="max-w-3xl">
            <div className="flex items-center gap-4 mb-4">
              {article.publishedAt && (
                <span className="inline-flex items-center gap-1.5 text-xs font-body text-[#777777]">
                  <Calendar size={11} /> {formatDate(article.publishedAt)}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 text-xs font-body text-[#777777]">
                <User size={11} /> Asmit Rajaramkar
              </span>
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-[#080808] leading-tight mb-5">
              {article.title}
            </h1>
            <p className="font-body text-lg text-[#777777] leading-relaxed border-l-4 border-[#FFC928] pl-5">
              {article.excerpt}
            </p>
          </div>
        </div>
      </section>

      {/* ── Cover Image ──────────────────────────────────────────────────── */}
      {article.coverImageUrl && (
        <div className="w-full bg-[#E9E7E2] overflow-hidden" style={{ maxHeight: 480 }}>
          <div className="max-w-[1440px] mx-auto relative h-64 sm:h-80 lg:h-[480px]">
            <Image
              src={article.coverImageUrl}
              alt={article.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      )}

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <section className="bg-white py-12 lg:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div
            className="font-body text-[#333] leading-[1.85] text-base sm:text-[17px] prose prose-sm max-w-none
              prose-headings:font-heading prose-headings:text-[#080808] prose-headings:font-bold
              prose-p:text-[#444] prose-p:leading-[1.85]
              prose-a:text-[#789185] prose-a:underline
              prose-strong:text-[#080808]
              prose-blockquote:border-l-4 prose-blockquote:border-[#FFC928] prose-blockquote:pl-5 prose-blockquote:text-[#777777] prose-blockquote:not-italic"
            style={{ whiteSpace: "pre-wrap" }}
          >
            {article.content}
          </div>

          {/* ── Author Card ──────────────────────────────────────────────── */}
          <div className="mt-14 pt-8 border-t border-[#E9E7E2] flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#789185]/10 border border-[#E9E7E2] flex items-center justify-center shrink-0">
              <User size={20} className="text-[#789185]" />
            </div>
            <div>
              <p className="text-[11px] font-body uppercase tracking-wider text-[#777777] mb-0.5">Written by</p>
              <p className="font-heading text-base font-bold text-[#080808]">Asmit Rajaramkar</p>
            </div>
            <Link
              href="/about"
              className="ml-auto text-xs font-body font-bold uppercase tracking-wider text-[#080808] border-b-2 border-[#FFC928] pb-0.5 hover:text-[#789185] transition-colors shrink-0"
            >
              About the Author
            </Link>
          </div>
        </div>
      </section>

      {/* ── Related Articles ─────────────────────────────────────────────── */}
      {related.length > 0 && (
        <section className="bg-[#FAF9F6] py-14 lg:py-20">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between gap-4 mb-8">
              <div>
                <p className="text-xs font-body uppercase tracking-[0.2em] text-[#789185] mb-2">Keep Reading</p>
                <h2 className="font-heading text-3xl font-bold text-[#080808]">More Articles</h2>
              </div>
              <Link
                href="/articles"
                className="inline-flex items-center gap-2 text-xs font-body font-bold uppercase tracking-wider text-[#080808] border-b-2 border-[#FFC928] pb-1 hover:text-[#789185] transition-colors shrink-0"
              >
                All Articles <ArrowRight size={12} />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {related.map((a) => (
                <Link
                  key={a.id}
                  href={`/articles/${a.slug}`}
                  className="group bg-white border border-[#E9E7E2] flex flex-col hover:shadow-md hover:border-[#789185] transition-all duration-200 overflow-hidden"
                >
                  <div className="relative h-44 bg-[#E9E7E2] overflow-hidden">
                    {a.coverImageUrl ? (
                      <Image src={a.coverImageUrl} alt={a.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full bg-[#789185]/10 flex items-center justify-center">
                        <span className="font-heading text-[#789185]/40 text-4xl font-bold">AR</span>
                      </div>
                    )}
                  </div>
                  <div className="p-5 flex flex-col gap-2 flex-1">
                    {a.publishedAt && (
                      <p className="text-[11px] font-body uppercase tracking-wider text-[#777777]">{formatDate(a.publishedAt)}</p>
                    )}
                    <h3 className="font-heading text-lg font-bold text-[#080808] group-hover:text-[#789185] transition-colors leading-tight line-clamp-2">
                      {a.title}
                    </h3>
                    <p className="font-body text-sm text-[#777777] leading-relaxed line-clamp-2 flex-1">{a.excerpt}</p>
                    <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-body font-bold uppercase tracking-wider text-[#789185] group-hover:text-[#080808] transition-colors">
                      Read More <ArrowRight size={11} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="bg-[#080808] py-14">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-xs font-body uppercase tracking-[0.2em] text-[#789185] mb-2">The Collection</p>
            <h2 className="font-heading text-3xl font-bold text-white">Enjoyed this article?</h2>
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
