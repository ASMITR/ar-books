import { NextRequest, NextResponse } from "next/server";
import { requireAuthor } from "@/lib/firebase/auth-server";
import cloudinary from "@/lib/cloudinary";

/** Author-scoped folders — keyed by asset type */
const FOLDERS: Record<string, { folder: string; resource_type: "image" | "raw" }> = {
  cover:   { folder: "AR_Books/author_covers",    resource_type: "image" },
  pdf:     { folder: "AR_Books/author_pdfs",      resource_type: "raw"   },
  preview: { folder: "AR_Books/author_previews",  resource_type: "raw"   },
  banner:  { folder: "AR_Books/author_banners",   resource_type: "image" },
};

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuthor();

    const { type } = await req.json();
    if (!type || !(type in FOLDERS)) {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    const { folder, resource_type } = FOLDERS[type];

    const timestamp = Math.round(Date.now() / 1000);
    // Scope uploads to a per-author sub-folder so assets are isolated
    const scopedFolder = `${folder}/${user.uid}`;

    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder: scopedFolder, use_filename: true, unique_filename: true },
      process.env.CLOUDINARY_API_SECRET!
    );

    return NextResponse.json({
      signature,
      timestamp,
      folder: scopedFolder,
      use_filename: true,
      unique_filename: true,
      resource_type,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
    });
  } catch (err) {
    if (err instanceof Error && (err.message === "UNAUTHENTICATED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to generate signature" }, { status: 500 });
  }
}
