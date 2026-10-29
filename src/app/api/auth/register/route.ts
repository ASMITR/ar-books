import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";
import { sendWelcomeEmail } from "@/lib/email";

/**
 * POST /api/auth/register
 *
 * Called immediately after a new Firebase account is created on the client.
 * Verifies the ID token, confirms the account is brand-new (creationTime ≈ lastSignInTime),
 * and sends a welcome email via Resend.
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

    // Fetch the full user record to check account age
    const userRecord = await adminAuth.getUser(decoded.uid);
    const createdAt = new Date(userRecord.metadata.creationTime).getTime();
    const now = Date.now();
    const ageMs = now - createdAt;

    // Only send welcome email for genuinely new accounts (created within the last 2 minutes)
    // This prevents re-sending if the client somehow calls this endpoint again later.
    const TWO_MINUTES = 2 * 60 * 1000;
    if (ageMs > TWO_MINUTES) {
      return NextResponse.json({ skipped: true });
    }

    const email = userRecord.email;
    const name = userRecord.displayName ?? "there";

    if (!email) {
      return NextResponse.json({ error: "No email on account" }, { status: 422 });
    }

    await sendWelcomeEmail(email, name);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[auth/register] welcome email failed:", err);
    // Non-fatal — don't block the registration flow
    return NextResponse.json({ error: "Email send failed" }, { status: 500 });
  }
}
