/**
 * GET /api/membership/download?bookId=xxx
 *
 * Serves a PDF to members. Checks:
 * 1. Authenticated session
 * 2. Active membership with valid billing period
 * 3. Book in membership catalogue with correct tier access
 * 4. Plan allows downloads
 * 5. Book allows downloads
 *
 * Falls back to individual purchase entitlement if member has previously bought the book.
 */
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { requireAuthenticatedUser } from "@/lib/firebase/auth-server";
import { checkMembershipBookAccess, getActiveMembershipForCustomer } from "@/lib/firebase/subscriptions";
import cloudinary from "@/lib/cloudinary";

function sanitizeLog(value: string): string {
  return value.replace(/[\r\n]/g, "_");
}

export async function GET(req: NextRequest) {
  try {
    const user   = await requireAuthenticatedUser();
    const bookId = req.nextUrl.searchParams.get("bookId");
    if (!bookId || !/^[a-zA-Z0-9_-]{1,128}$/.test(bookId)) {
      return NextResponse.json({ error: "Missing bookId" }, { status: 400 });
    }

    // ── 1. Check individual purchase entitlement first ────────────────────────
    const purchaseEntSnap = await adminDb
      .collection("downloadEntitlements")
      .where("customerId", "==", user.uid)
      .where("productId", "==", bookId)
      .where("status", "==", "active")
      .limit(1)
      .get();

    let canDownload = !purchaseEntSnap.empty;
    let accessSource: "purchase" | "membership" = "purchase";

    // ── 2. If not purchased, check membership access ───────────────────────────
    if (!canDownload) {
      const access = await checkMembershipBookAccess(user.uid, bookId);
      if (access.canDownload) {
        canDownload = true;
        accessSource = "membership";
      } else if (access.allowed) {
        // Member can read online but not download
        return NextResponse.json(
          { error: "Your membership plan does not include PDF downloads. Upgrade to Plus or Premium." },
          { status: 403 }
        );
      } else {
        return NextResponse.json({ error: access.reason }, { status: 403 });
      }
    }

    if (!canDownload) {
      return NextResponse.json({ error: "No download access." }, { status: 403 });
    }

    // ── 3. Fetch book and stream PDF ──────────────────────────────────────────
    const bookDoc = await adminDb.collection("books").doc(bookId).get();
    if (!bookDoc.exists) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }
    const { privatePdfPath, title } = bookDoc.data()!;
    if (typeof privatePdfPath !== "string" || !privatePdfPath) {
      return NextResponse.json({ error: "PDF not available" }, { status: 404 });
    }

    const directUrl = cloudinary.url(privatePdfPath as string, {
      resource_type: "raw", type: "upload", secure: true,
    });

    const upstream = await fetch(directUrl);
    if (!upstream.ok) {
      return NextResponse.json({ error: "Download failed" }, { status: 502 });
    }
    const pdfBuffer = await upstream.arrayBuffer();

    // ── 4. Log download ───────────────────────────────────────────────────────
    if (accessSource === "membership") {
      const membership = await getActiveMembershipForCustomer(user.uid);
      if (membership) {
        const safeBookTitle = (typeof title === "string" ? title : "")
          .replace(/[^a-zA-Z0-9 _\-.,!?']/g, "").trim().slice(0, 200) || "unknown";
        const safePeriodStart = typeof membership.subscription.currentPeriodStart === "string"
          ? membership.subscription.currentPeriodStart : null;
        const safePeriodEnd = typeof membership.subscription.currentPeriodEnd === "string"
          ? membership.subscription.currentPeriodEnd : null;
        await adminDb.collection("membershipDownloads").add({
          subscriptionId: membership.subscription.id,
          customerId:     user.uid,
          bookId,
          bookTitle:      safeBookTitle,
          downloadedAt:   new Date().toISOString(),
          periodStart:    safePeriodStart,
          periodEnd:      safePeriodEnd,
        });
      }
    } else {
      const rawOrderId = purchaseEntSnap.docs[0]?.data()?.orderId;
      const safeOrderId = typeof rawOrderId === "string" && /^[a-zA-Z0-9_-]{1,128}$/.test(rawOrderId)
        ? rawOrderId
        : null;
      await adminDb.collection("downloadLogs").add({
        customerId: user.uid,
        productId:  bookId,
        orderId:    safeOrderId,
        timestamp:  new Date().toISOString(),
        outcome:    "success",
      });
    }

    const safeTitle = (typeof title === "string" ? title : "")
      .replace(/[^a-zA-Z0-9 _-]/g, "").trim().replace(/\s+/g, "_").slice(0, 60) || "book";

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type":        "application/pdf",
        "Content-Disposition": `attachment; filename="${safeTitle}.pdf"`,
        "Content-Length":      String(pdfBuffer.byteLength),
        "Cache-Control":       "private, no-store",
      },
    });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[membership/download]", err);
    return NextResponse.json({ error: "Download failed" }, { status: 500 });
  }
}
