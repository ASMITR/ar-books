import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { requireAdmin } from "@/lib/firebase/auth-server";

export async function GET() {
  try {
    await requireAdmin();
    const snap = await adminDb.collection("articles").orderBy("createdAt", "desc").get();
    return NextResponse.json({ success: true, data: snap.docs.map((d) => ({ id: d.id, ...d.data() })) });
  } catch (err: unknown) {
    if (err instanceof Error && (err.message === "UNAUTHENTICATED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    if (!body.title || !body.slug || !body.content) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }
    const now = new Date().toISOString();
    const ref = adminDb.collection("articles").doc();
    await ref.set({
      title: body.title,
      slug: body.slug,
      excerpt: body.excerpt ?? "",
      content: body.content,
      coverImageUrl: body.coverImageUrl ?? null,
      published: body.published ?? false,
      publishedAt: body.published ? now : null,
      createdAt: now,
      updatedAt: now,
    });
    return NextResponse.json({ success: true, data: { id: ref.id } }, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof Error && (err.message === "UNAUTHENTICATED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
