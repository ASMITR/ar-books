import { notFound } from "next/navigation";
import { getCategoryBySlug, getPublishedBooks, getVisibleCategories } from "@/lib/firebase/firestore";
import { BookCard } from "@/components/book/BookCard";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { EmptyState } from "@/components/shared/EmptyState";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sort?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "Category Not Found" };
  return {
    title: category.name,
    description: category.description ?? `Browse ${category.name} eBooks by Asmit Rajaramkar.`,
  };
}

export async function generateStaticParams() {
  const categories = await getVisibleCategories();
  return categories.map((c) => ({ slug: c.slug }));
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { sort } = await searchParams;

  const [category, allBooks] = await Promise.all([
    getCategoryBySlug(slug),
    getPublishedBooks(),
  ]);

  if (!category) notFound();

  let books = allBooks.filter((b) => b.categoryIds.includes(category.id));

  if (sort === "price-asc") books = [...books].sort((a, b) => a.pricePaise - b.pricePaise);
  if (sort === "price-desc") books = [...books].sort((a, b) => b.pricePaise - a.pricePaise);

  return (
    <div className="bg-[#FAF9F6] min-h-screen">
      {/* Header */}
      <div className="bg-[#789185] py-12">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs
            crumbs={[
              { label: "Home", href: "/" },
              { label: "Books", href: "/books" },
              { label: category.name },
            ]}
          />
          <h1 className="font-heading text-5xl font-bold text-white mt-4">{category.name}</h1>
          {category.description && (
            <p className="font-body text-white/70 mt-2 max-w-xl">{category.description}</p>
          )}
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Sort */}
        <div className="flex items-center justify-between mb-8">
          <p className="text-sm text-[#777777] font-body">
            {books.length} book{books.length !== 1 ? "s" : ""}
          </p>
          <form method="GET" className="flex gap-2">
            <select
              name="sort"
              defaultValue={sort ?? ""}
              className="border border-[#E9E7E2] bg-white px-4 py-2 text-sm font-body focus:outline-none focus:border-[#789185]"
            >
              <option value="">Sort: Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
            <button
              type="submit"
              className="bg-[#080808] text-white font-body text-xs font-medium uppercase tracking-wider px-4 py-2 hover:bg-[#789185] transition-colors"
            >
              Sort
            </button>
          </form>
        </div>

        {books.length === 0 ? (
          <EmptyState
            title="No books in this category yet"
            description="Check back soon or browse all books."
            actionLabel="View All Books"
            actionHref="/books"
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {books.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
