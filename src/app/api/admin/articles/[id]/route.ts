import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { requireAdmin } from "@/lib/firebase/auth-server";
import cloudinary from "@/lib/cloudinary";

interface Params { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await req.json();
    await adminDb.collection("articles").doc(id).update({ ...body, updatedAt: new Date().toISOString() });
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    if (err instanceof Error && (err.message === "UNAUTHENTICATED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    await requireAdmin();
    const { id } = await params;

    // Read the article to get the cover image URL before deletion
    const doc = await adminDb.collection("articles").doc(id).get();
    if (doc.exists) {
      const article = doc.data() as { coverImageUrl?: string };
      // Extract Cloudinary public_id from the URL and delete the asset
      if (article.coverImageUrl) {
        const publicId = extractCloudinaryPublicId(article.coverImageUrl);
        if (publicId) {
          await cloudinary.uploader.destroy(publicId, { resource_type: "image" }).catch(() => null);
        }
      }
    }

    await adminDb.collection("articles").doc(id).delete();
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    if (err instanceof Error && (err.message === "UNAUTHENTICATED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

/**
 * Extracts the Cloudinary public_id from a secure URL.
 * e.g. https://res.cloudinary.com/<cloud>/image/upload/v1234567890/ar-books/covers/abc123
 *      → ar-books/covers/abc123
 */
function extractCloudinaryPublicId(url: string): string | null {
  try {
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[a-z]+)?$/i);
    return match?.[1] ?? null;
  } catch {
    return null;
  }
}
