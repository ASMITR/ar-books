import { notFound } from "next/navigation";
import { adminDb } from "@/lib/firebase/admin";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { formatDate } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import type { Article } from "@/types";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const snap = await adminDb
    .collection("articles")
    .where("slug", "==", slug)
    .where("published", "==", true)
    .limit(1)
    .get();
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
  const snap = await adminDb
    .collection("articles")
    .where("slug", "==", slug)
    .where("published", "==", true)
    .limit(1)
    .get();

  if (snap.empty) notFound();

  const article = { id: snap.docs[0].id, ...snap.docs[0].data() } as Article;

  return (
    <div className="bg-[#FAF9F6] min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <Breadcrumbs
          crumbs={[
            { label: "Home", href: "/" },
            { label: "Articles", href: "/articles" },
            { label: article.title },
          ]}
        />

        <div className="mt-8">
          {article.publishedAt && (
            <p className="text-xs font-body uppercase tracking-wider text-[#777777] mb-3">
              {formatDate(article.publishedAt)}
            </p>
          )}
          <h1 className="font-heading text-4xl lg:text-5xl font-bold text-[#080808] leading-tight mb-6">
            {article.title}
          </h1>
          <p className="font-body text-lg text-[#777777] leading-relaxed mb-8 border-l-4 border-[#FFC928] pl-4">
            {article.excerpt}
          </p>

          {article.coverImageUrl && (
            <div className="relative h-64 sm:h-80 mb-10 overflow-hidden">
              <Image
                src={article.coverImageUrl}
                alt={article.title}
                fill
                className="object-cover"
              />
            </div>
          )}

          <div
            className="font-body text-[#080808] leading-relaxed prose prose-sm max-w-none"
            style={{ whiteSpace: "pre-wrap" }}
          >
            {article.content}
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-[#E9E7E2] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="font-body text-sm text-[#777777]">
            Written by <span className="font-medium text-[#080808]">Asmit Rajaramkar</span>
          </p>
          <Link
            href="/articles"
            className="text-xs font-body font-medium uppercase tracking-wider text-[#777777] hover:text-[#080808] underline"
          >
            ← All Articles
          </Link>
        </div>
      </div>
    </div>
  );
}
