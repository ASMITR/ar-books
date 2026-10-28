import { getPublishedBooks } from "@/lib/firebase/firestore";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim().toLowerCase() ?? "";

  if (q.length < 2) return NextResponse.json({ books: [] });

  const all = await getPublishedBooks();
  const books = all.filter(
    (b) =>
      b.title.toLowerCase().includes(q) ||
      (b.subtitle ?? "").toLowerCase().includes(q) ||
      b.description.toLowerCase().includes(q) ||
      b.author.toLowerCase().includes(q)
  ).slice(0, 8);

  return NextResponse.json({ books });
}
