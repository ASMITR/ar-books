import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";
import { sendEmailVerificationLink } from "@/lib/email";
import { getSessionUser } from "@/lib/firebase/auth-server";

/**
 * POST /api/auth/send-verification
 *
 * Generates a Firebase email verification link via Admin SDK and sends it
 * through Resend with the branded AR Books template.
 * Requires the user to be logged in (reads their session cookie).
 */
export async function POST() {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    if (sessionUser.emailVerified) {
      return NextResponse.json({ error: "Email already verified" }, { status: 400 });
    }

    const email = sessionUser.email;
    if (!email) {
      return NextResponse.json({ error: "No email on account" }, { status: 422 });
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ??
      process.env.NEXT_PUBLIC_APP_URL ??
      "https://arbooks.in";

    // Generate the verification link via Firebase Admin SDK
    const verificationLink = await adminAuth.generateEmailVerificationLink(email, {
      url: `${baseUrl}/account/dashboard`,
    });

    const name = sessionUser.displayName ?? "there";
    await sendEmailVerificationLink(email, name, verificationLink);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[auth/send-verification]", err);
    return NextResponse.json({ error: "Failed to send verification email" }, { status: 500 });
  }
}
