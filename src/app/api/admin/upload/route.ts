import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/firebase/auth-server";
import { uploadToCloudinary } from "@/lib/cloudinary";

const ALLOWED_MIME: Record<string, string[]> = {
  cover: ["image/jpeg", "image/png", "image/webp"],
  pdf: ["application/pdf"],
  preview: ["application/pdf"],
};
const MAX_SIZE: Record<string, number> = {
  cover: 5 * 1024 * 1024,   // 5 MB
  pdf: 100 * 1024 * 1024,   // 100 MB
  preview: 20 * 1024 * 1024, // 20 MB
};

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();

    const form = await req.formData();
    const file = form.get("file") as File | null;
    const type = form.get("type") as string | null; // "cover" | "pdf" | "preview"

    if (!file || !type || !(type in ALLOWED_MIME)) {
      return NextResponse.json({ success: false, error: "Missing file or invalid type" }, { status: 400 });
    }

    if (!ALLOWED_MIME[type].includes(file.type)) {
      return NextResponse.json({ success: false, error: "File type not allowed" }, { status: 415 });
    }

    if (file.size > MAX_SIZE[type]) {
      return NextResponse.json({ success: false, error: "File too large" }, { status: 413 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const isImage = type === "cover";

    const { publicId, secureUrl } = await uploadToCloudinary(buffer, {
      folder: isImage ? "ar-books/covers" : "ar-books/pdfs",
      resource_type: isImage ? "image" : "raw",
    });

    return NextResponse.json({ success: true, data: { publicId, secureUrl } });
  } catch (err: unknown) {
    if (err instanceof Error && (err.message === "UNAUTHENTICATED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    const safeErr = (err instanceof Error ? err.message : String(err)).replace(/[\r\n]/g, " ");
    console.error("[admin/upload]", safeErr);
    return NextResponse.json({ success: false, error: "Upload failed" }, { status: 500 });
  }
}
