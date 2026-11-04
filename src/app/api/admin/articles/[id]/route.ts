import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { adminDb } from "@/lib/firebase/admin";
import { requireAdmin } from "@/lib/firebase/auth-server";
import cloudinary from "@/lib/cloudinary";
import { z } from "zod";

const articlePatchSchema = z.object({
  title: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  excerpt: z.string().optional(),
  content: z.string().optional(),
  coverImageUrl: z.string().url().nullable().optional(),
  published: z.boolean().optional(),
  publishedAt: z.string().nullable().optional(),
});

interface Params { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await req.json();
    const parsed = articlePatchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid fields" }, { status: 400 });
    }
    await adminDb.collection("articles").doc(id).update({ ...parsed.data, updatedAt: new Date().toISOString() });
    revalidateTag("articles", { expire: 0 });
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

    const doc = await adminDb.collection("articles").doc(id).get();
    if (doc.exists) {
      const article = doc.data() as { coverImageUrl?: string };
      if (article.coverImageUrl) {
        const publicId = extractCloudinaryPublicId(article.coverImageUrl);
        if (publicId) {
          await cloudinary.uploader.destroy(publicId, { resource_type: "image" }).catch(() => null);
        }
      }
    }

    await adminDb.collection("articles").doc(id).delete();
    revalidateTag("articles", { expire: 0 });
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    if (err instanceof Error && (err.message === "UNAUTHENTICATED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

function extractCloudinaryPublicId(url: string): string | null {
  try {
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[a-z]+)?$/i);
    return match?.[1] ?? null;
  } catch {
    return null;
  }
}
