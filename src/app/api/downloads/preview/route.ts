import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import cloudinary from "@/lib/cloudinary";

function sanitizeLog(value: string): string {
  return value.replace(/[\r\n]/g, "_");
}

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

    const { previewPdfPath, previewPdfUrl, published, title } = bookDoc.data()!;

    if (!published) {
      return NextResponse.json({ error: "Preview not available" }, { status: 404 });
    }

    if (!previewPdfPath && !previewPdfUrl) {
      return NextResponse.json({ error: "Preview not available" }, { status: 404 });
    }

    // Prefer the stored secureUrl — it's already correct and needs no reconstruction.
    // Fall back to building it from the public_id for older documents that predate
    // the previewPdfUrl field.
    const directUrl = (previewPdfUrl as string | undefined) ??
      cloudinary.url(previewPdfPath as string, {
        resource_type: "raw",
        type: "upload",
        secure: true,
      });

    const upstream = await fetch(directUrl);
    if (!upstream.ok) {
      const safeUrl = new URL(directUrl).origin;
      console.error("[preview] Cloudinary fetch failed", upstream.status, safeUrl);
      return NextResponse.json({ error: "Preview unavailable" }, { status: 502 });
    }

    const pdfBuffer = await upstream.arrayBuffer();

    const safeTitle = (title as string ?? "preview")
      .replace(/[^a-zA-Z0-9 _-]/g, "")
      .trim()
      .replace(/\s+/g, "_")
      .slice(0, 60);

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${safeTitle}_preview.pdf"`,
        "Content-Length": String(pdfBuffer.byteLength),
        "Cache-Control": "private, max-age=600",
      },
    });
  } catch (err) {
    console.error("[downloads/preview]", sanitizeLog(err instanceof Error ? err.message : String(err)));
    return NextResponse.json({ error: "Preview unavailable" }, { status: 500 });
  }
}
