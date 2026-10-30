import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { sendWelcomeEmail } from "@/lib/email";

/**
 * POST /api/auth/register
 *
 * Called immediately after a new Firebase account is created on the client.
 * - Verifies the ID token
 * - Confirms the account is brand-new (< 2 min old)
 * - Writes a user document to Firestore `users` collection
 * - Sends a welcome email via Resend
 *
 * Body: { idToken: string }
 */
export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json();
    if (!idToken || typeof idToken !== "string") {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    const decoded = await adminAuth.verifyIdToken(idToken);
    const userRecord = await adminAuth.getUser(decoded.uid);

    const createdAt = new Date(userRecord.metadata.creationTime).getTime();
    const ageMs = Date.now() - createdAt;
    const TWO_MINUTES = 2 * 60 * 1000;

    if (ageMs > TWO_MINUTES) {
      return NextResponse.json({ skipped: true });
    }

    const email = userRecord.email;
    const name = userRecord.displayName ?? "there";

    if (!email) {
      return NextResponse.json({ error: "No email on account" }, { status: 422 });
    }

    // ── Write user document to Firestore so it appears in the admin dashboard ──
    const now = new Date().toISOString();
    await adminDb
      .collection("users")
      .doc(userRecord.uid)
      .set(
        {
          displayName: userRecord.displayName ?? null,
          email,
          emailVerified: userRecord.emailVerified ?? false,
          photoURL: userRecord.photoURL ?? null,
          role: "member",
          createdAt: now,
          updatedAt: now,
          provider: userRecord.providerData?.[0]?.providerId ?? "password",
        },
        { merge: true }
      );

    // Non-fatal — don't block the registration flow
    sendWelcomeEmail(email, name).catch((e) =>
      console.error("[auth/register] welcome email failed:", e)
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[auth/register]", err);
    return NextResponse.json({ error: "Registration post-processing failed" }, { status: 500 });
  }
}
