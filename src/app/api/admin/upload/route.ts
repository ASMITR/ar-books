import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/firebase/auth-server";
import { uploadToCloudinary } from "@/lib/cloudinary";

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();

    const form = await req.formData();
    const file = form.get("file") as File | null;
    const type = form.get("type") as string | null; // "cover" | "pdf" | "preview"

    if (!file || !type) {
      return NextResponse.json({ success: false, error: "Missing file or type" }, { status: 400 });
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
    console.error("[admin/upload]", err);
    return NextResponse.json({ success: false, error: "Upload failed" }, { status: 500 });
  }
}
