import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

/**
 * POST /api/admin/setup
 *
 * One-time endpoint to create the first admin user.
 * - Blocked permanently once setup is marked complete in Firestore.
 * - Creates a Firebase Auth account with email/password.
 * - Sets the `admin: true` custom claim.
 * - Writes a user doc to `users` collection with role "admin".
 * - Writes `settings/setup` with `{ adminCreated: true }` to seal the endpoint.
 *
 * Body: { name: string; email: string; password: string; setupKey: string }
 */
export async function POST(req: NextRequest) {
  try {
    // ── 1. Check setup hasn't already been completed ──────────────────────────
    const setupDoc = await adminDb.collection("settings").doc("setup").get();
    if (setupDoc.exists && setupDoc.data()?.adminCreated === true) {
      return NextResponse.json(
        { error: "Setup has already been completed." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { name, email, password } = body as {
      name?: string;
      email?: string;
      password?: string;
    };

    // ── 2. Validate inputs ────────────────────────────────────────────────────
    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json({ error: "Name must be at least 2 characters." }, { status: 400 });
    }
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "A valid email address is required." }, { status: 400 });
    }
    if (!password || typeof password !== "string" || password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }

    // ── 3. Create Firebase Auth user ─────────────────────────────────────────
    let uid: string;
    try {
      const userRecord = await adminAuth.createUser({
        displayName: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        emailVerified: true, // admin email is trusted
      });
      uid = userRecord.uid;
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      if (code === "auth/email-already-exists") {
        return NextResponse.json(
          { error: "An account with this email already exists." },
          { status: 409 }
        );
      }
      throw err;
    }

    // ── 4. Grant admin custom claim ──────────────────────────────────────────
    await adminAuth.setCustomUserClaims(uid, { admin: true });

    // ── 5. Write Firestore user doc ──────────────────────────────────────────
    const now = new Date().toISOString();
    await adminDb.collection("users").doc(uid).set({
      displayName: name.trim(),
      email: email.trim().toLowerCase(),
      emailVerified: true,
      role: "admin",
      provider: "password",
      photoURL: null,
      createdAt: now,
      updatedAt: now,
    });

    // ── 6. Seal the setup endpoint ───────────────────────────────────────────
    await adminDb.collection("settings").doc("setup").set({
      adminCreated: true,
      adminUid: uid,
      completedAt: now,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[admin/setup]", err);
    return NextResponse.json({ error: "Setup failed. Please try again." }, { status: 500 });
  }
}

/**
 * GET /api/admin/setup
 * Returns whether setup has already been completed.
 * Used by the setup page to decide whether to show the form or redirect.
 */
export async function GET() {
  try {
    const setupDoc = await adminDb.collection("settings").doc("setup").get();
    const completed = setupDoc.exists && setupDoc.data()?.adminCreated === true;
    return NextResponse.json({ completed });
  } catch (err) {
    console.error("[admin/setup GET]", err);
    return NextResponse.json({ error: "Could not check setup status." }, { status: 500 });
  }
}
