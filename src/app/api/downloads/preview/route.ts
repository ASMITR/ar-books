import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { getSignedDownloadUrl } from "@/lib/cloudinary";

export async function GET(req: NextRequest) {
  try {
    const bookId = req.nextUrl.searchParams.get("bookId");
    if (!bookId) return NextResponse.json({ error: "Missing bookId" }, { status: 400 });

    const bookDoc = await adminDb.collection("books").doc(bookId).get();
    if (!bookDoc.exists) return NextResponse.json({ error: "Book not found" }, { status: 404 });

    const { previewPdfPath, published } = bookDoc.data()!;
    if (!published || !previewPdfPath) {
      return NextResponse.json({ error: "Preview not available" }, { status: 404 });
    }

    const url = getSignedDownloadUrl(previewPdfPath, 1800);
    return NextResponse.redirect(url);
  } catch (err) {
    console.error("[downloads/preview]", err);
    return NextResponse.json({ error: "Preview unavailable" }, { status: 500 });
  }
}
