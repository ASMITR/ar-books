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
    if (!bookId || !/^[a-zA-Z0-9_-]{1,128}$/.test(bookId)) {
      return NextResponse.json({ error: "Missing bookId" }, { status: 400 });
    }

    // Verify the customer has a paid entitlement
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

    const { privatePdfPath, title } = bookDoc.data()!;
    if (typeof privatePdfPath !== "string" || !privatePdfPath) {
      return NextResponse.json({ error: "PDF not available" }, { status: 404 });
    }

    // Build direct Cloudinary URL and proxy it with correct PDF headers
    const directUrl = cloudinary.url(privatePdfPath as string, {
      resource_type: "raw",
      type: "upload",
      secure: true,
    });

    const upstream = await fetch(directUrl);
    if (!upstream.ok) {
      const safeUrl = new URL(directUrl).origin;
      console.error("[secure] Cloudinary fetch failed", upstream.status, safeUrl);
      return NextResponse.json({ error: "Download failed" }, { status: 502 });
    }

    const pdfBuffer = await upstream.arrayBuffer();

    const safeTitle = (typeof title === "string" ? title : "")
      .replace(/[^a-zA-Z0-9 _-]/g, "")
      .trim()
      .replace(/\s+/g, "_")
      .slice(0, 60) || "book";

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

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${safeTitle}.pdf"`,
        "Content-Length": String(pdfBuffer.byteLength),
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[downloads/secure]", sanitizeLog(err instanceof Error ? err.message : String(err)));
    return NextResponse.json({ error: "Download failed" }, { status: 500 });
  }
}
