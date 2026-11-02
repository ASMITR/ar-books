import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { requireAdmin } from "@/lib/firebase/auth-server";
import cloudinary from "@/lib/cloudinary";

// GET /api/admin/debug/book?slug=<slug>
// Returns the raw Firestore document for a book and tests whether
// the previewPdfPath resolves to a real Cloudinary asset.
export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    const slug = req.nextUrl.searchParams.get("slug");
    if (!slug) {
      return NextResponse.json({ error: "Pass ?slug=<book-slug>" }, { status: 400 });
    }

    // Query without the published filter so we see drafts too
    const snap = await adminDb
      .collection("books")
      .where("slug", "==", slug)
      .limit(1)
      .get();

    if (snap.empty) {
      return NextResponse.json({ error: "No book found with that slug" }, { status: 404 });
    }

    const doc = snap.docs[0];
    const data = doc.data();

    const previewPdfPath = data.previewPdfPath ?? null;
    const privatePdfPath = data.privatePdfPath ?? null;

    // Try to build and fetch the Cloudinary URL for the preview PDF
    let cloudinaryCheck: { url: string; status: number | null; ok: boolean; error?: string } | null = null;
    if (previewPdfPath) {
      const url = cloudinary.url(previewPdfPath as string, {
        resource_type: "raw",
        type: "upload",
        secure: true,
      });
      try {
        const r = await fetch(url, { method: "HEAD" });
        cloudinaryCheck = { url, status: r.status, ok: r.ok };
      } catch (e) {
        cloudinaryCheck = { url, status: null, ok: false, error: String(e) };
      }
    }

    return NextResponse.json({
      id: doc.id,
      slug: data.slug,
      title: data.title,
      published: data.published,
      previewPdfPath,
      privatePdfPath,
      coverImageUrl: data.coverImageUrl ?? null,
      cloudinaryCheck,
    });
  } catch (err: unknown) {
    if (err instanceof Error && (err.message === "UNAUTHENTICATED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    console.error("[debug/book]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
