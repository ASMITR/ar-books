import { getPublishedBooks } from "@/lib/firebase/firestore";
import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/ratelimit";

export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  const { allowed, retryAfterMs } = rateLimit(ip, { limit: 30, windowMs: 60_000 });
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) } }
    );
  }
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
