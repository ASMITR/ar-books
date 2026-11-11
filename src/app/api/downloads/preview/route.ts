import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import cloudinary from "@/lib/cloudinary";

export async function GET(req: NextRequest) {
  try {
    const bookId = req.nextUrl.searchParams.get("bookId");
    if (!bookId || !/^[a-zA-Z0-9_-]{1,128}$/.test(bookId)) {
      return NextResponse.json({ error: "Missing bookId" }, { status: 400 });
    }

    const bookDoc = await adminDb.collection("books").doc(bookId).get();
    if (!bookDoc.exists) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    const { previewPdfPath, previewPdfUrl, published } = bookDoc.data()!;

    if (!published) {
      return NextResponse.json({ error: "Preview not available" }, { status: 404 });
    }

    if (!previewPdfPath && !previewPdfUrl) {
      return NextResponse.json({ error: "Preview not available" }, { status: 404 });
    }

    let publicId: string | null = null;
    if (typeof previewPdfPath === "string" && previewPdfPath) {
      publicId = previewPdfPath;
    } else if (typeof previewPdfUrl === "string" && previewPdfUrl.startsWith("https://")) {
      const match = previewPdfUrl.match(/\/upload\/(?:v\d+\/)?(.+)$/);
      publicId = match ? match[1].replace(/\.[^/.]+$/, "") : null;
    }

    if (!publicId) {
      return NextResponse.json({ error: "Preview unavailable" }, { status: 404 });
    }

    // Proxy preview PDF — never expose the Cloudinary URL
    const signedUrl = cloudinary.url(publicId, {
      resource_type: "raw",
      type: "upload",
      secure: true,
      sign_url: true,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
    });

    const upstream = await fetch(signedUrl);
    if (!upstream.ok) {
      return NextResponse.json({ error: "Preview unavailable" }, { status: 404 });
    }

    return new NextResponse(upstream.body, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "inline",
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[downloads/preview]", err instanceof Error ? err.message : String(err));
    return NextResponse.json({ error: "Preview unavailable" }, { status: 500 });
  }
}