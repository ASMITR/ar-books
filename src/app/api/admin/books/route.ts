import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { requireAdmin } from "@/lib/firebase/auth-server";
import { bookSchema } from "@/lib/validations";

export async function GET() {
  try {
    await requireAdmin();
    const snap = await adminDb.collection("books").orderBy("createdAt", "desc").get();
    const books = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ success: true, data: books });
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
    const parsed = bookSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.flatten() }, { status: 400 });
    }

    const now = new Date().toISOString();
    const ref = adminDb.collection("books").doc();
    await ref.set({
      ...parsed.data,
      author: "Asmit Rajaramkar",
      currency: "INR",
      coverImageUrl: body.coverImageUrl ?? null,
      coverImagePath: body.coverImagePath ?? null,
      privatePdfPath: body.privatePdfPath ?? null,
      previewPdfPath: body.previewPdfPath ?? null,
      whatYouLearn: body.whatYouLearn ?? [],
      targetAudience: body.targetAudience ?? null,
      tableOfContents: body.tableOfContents ?? [],
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
