import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { requireAuthenticatedUser } from "@/lib/firebase/auth-server";
import { getSignedDownloadUrl } from "@/lib/cloudinary";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuthenticatedUser();
    const bookId = req.nextUrl.searchParams.get("bookId");
    if (!bookId) return NextResponse.json({ error: "Missing bookId" }, { status: 400 });

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
    if (!bookDoc.exists) return NextResponse.json({ error: "Book not found" }, { status: 404 });

    const { privatePdfPath } = bookDoc.data()!;
    if (!privatePdfPath) return NextResponse.json({ error: "PDF not available" }, { status: 404 });

    const url = getSignedDownloadUrl(privatePdfPath, 3600);

    await adminDb.collection("downloadLogs").add({
      customerId: user.uid,
      productId: bookId,
      orderId: entSnap.docs[0].data().orderId,
      timestamp: new Date().toISOString(),
      outcome: "success",
    });

    return NextResponse.redirect(url);
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[downloads/secure]", err);
    return NextResponse.json({ error: "Download failed" }, { status: 500 });
  }
}
