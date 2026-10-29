import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import cloudinary from "@/lib/cloudinary";

export async function GET(req: NextRequest) {
  try {
    const bookId = req.nextUrl.searchParams.get("bookId");
    if (!bookId) {
      return NextResponse.json({ error: "Missing bookId" }, { status: 400 });
    }

    const bookDoc = await adminDb.collection("books").doc(bookId).get();
    if (!bookDoc.exists) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    const { previewPdfPath, published, title } = bookDoc.data()!;
    if (!published || !previewPdfPath) {
      return NextResponse.json({ error: "Preview not available" }, { status: 404 });
    }

    // Build the direct Cloudinary URL for the raw resource (no signing needed —
    // files uploaded as resource_type "raw" without access_mode "authenticated"
    // are publicly reachable via their delivery URL).
    const directUrl = cloudinary.url(previewPdfPath as string, {
      resource_type: "raw",
      type: "upload",
      secure: true,
    });

    // Fetch the PDF from Cloudinary and proxy it through this route so the
    // browser always receives the correct Content-Type / Content-Disposition
    // headers, regardless of what Cloudinary sets on the raw file.
    const upstream = await fetch(directUrl);
    if (!upstream.ok) {
      console.error("[preview] Cloudinary fetch failed", upstream.status, directUrl);
      return NextResponse.json({ error: "Preview unavailable" }, { status: 502 });
    }

    const pdfBuffer = await upstream.arrayBuffer();

    // Sanitise the book title for use as a filename
    const safeTitle = (title as string ?? "preview")
      .replace(/[^a-zA-Z0-9 _-]/g, "")
      .trim()
      .replace(/\s+/g, "_")
      .slice(0, 60);

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        // inline → browser renders in PDF viewer; attachment → force download
        "Content-Disposition": `inline; filename="${safeTitle}_preview.pdf"`,
        "Content-Length": String(pdfBuffer.byteLength),
        // Short cache — 10 min in browser, not stored in shared caches
        "Cache-Control": "private, max-age=600",
      },
    });
  } catch (err) {
    console.error("[downloads/preview]", err);
    return NextResponse.json({ error: "Preview unavailable" }, { status: 500 });
  }
}
