import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/firebase/auth-server";
import cloudinary from "@/lib/cloudinary";

const FOLDERS: Record<string, string> = {
  cover: "AR_Books/covers",
  pdf: "AR_Books/pdfs",
  preview: "AR_Books/pdfs",
};

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();

    const { type } = await req.json();
    if (!type || !(type in FOLDERS)) {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    const timestamp = Math.round(Date.now() / 1000);
    const folder = FOLDERS[type];
    const resource_type = type === "cover" ? "image" : "raw";

    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder, use_filename: true, unique_filename: true },
      process.env.CLOUDINARY_API_SECRET!
    );

    return NextResponse.json({
      signature,
      timestamp,
      folder,
      use_filename: true,
      unique_filename: true,
      resource_type,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
    });
  } catch (err: unknown) {
    if (err instanceof Error && (err.message === "UNAUTHENTICATED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to generate signature" }, { status: 500 });
  }
}
