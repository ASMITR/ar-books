import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { requireAuthenticatedUser } from "@/lib/firebase/auth-server";
import cloudinary from "@/lib/cloudinary";

function isValidId(value: string): boolean {
  return /^[a-zA-Z0-9_-]{1,128}$/.test(value);
}

function sanitizeLog(value: string): string {
  return value.replace(/[\r\n]/g, "_");
}

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuthenticatedUser();
    const bookId = req.nextUrl.searchParams.get("bookId");
    if (!bookId || !isValidId(bookId)) {
      return NextResponse.json({ error: "Missing bookId" }, { status: 400 });
    }

    // Verify entitlement
    const entSnap = await adminDb
      .collection("downloadEntitlements")
      .where("customerId", "==", user.uid)
      .where("productId", "==", bookId)
      .where("status", "==", "active")
      .limit(1)
      .get();

    if (entSnap.empty) {
      return NextResponse.json({ error: "No entitlement found" }, { status: 403 });
    }

    const bookDoc = await adminDb.collection("books").doc(bookId).get();
    if (!bookDoc.exists) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    const { privatePdfPath, privatePdfUrl } = bookDoc.data()!;

    // Log the download
    const { orderId } = entSnap.docs[0].data();
    if (typeof orderId !== "string" || !isValidId(orderId)) {
      return NextResponse.json({ error: "Invalid entitlement" }, { status: 403 });
    }
    await adminDb.collection("downloadLogs").add({
      customerId: user.uid,
      productId: bookId,
      orderId,
      timestamp: new Date().toISOString(),
      outcome: "success",
    });

    // Resolve the Cloudinary public_id from path or URL
    let publicId: string | null = null;
    if (typeof privatePdfPath === "string" && privatePdfPath) {
      publicId = privatePdfPath;
    } else if (typeof privatePdfUrl === "string" && privatePdfUrl.startsWith("https://")) {
      // Extract public_id from URL: .../upload/v.../AR_Books/pdfs/xxx.pdf
      const match = privatePdfUrl.match(/\/upload\/(?:v\d+\/)?(.+)$/);
      publicId = match ? match[1].replace(/\.[^/.]+$/, "") : null;
    }

    if (!publicId) {
      return NextResponse.json({ error: "PDF not available" }, { status: 404 });
    }

    // Short-lived signed URL (1 hour) — redirect so browser downloads directly from Cloudinary
    const signedUrl = cloudinary.url(publicId, {
      resource_type: "raw",
      type: "upload",
      secure: true,
      sign_url: true,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
    });

    return NextResponse.redirect(signedUrl);
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[downloads/secure]", sanitizeLog(err instanceof Error ? err.message : String(err)));
    return NextResponse.json({ error: "Download failed" }, { status: 500 });
  }
}
