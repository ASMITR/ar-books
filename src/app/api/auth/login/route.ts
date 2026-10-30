import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json();
    if (!idToken) return NextResponse.json({ error: "Missing token" }, { status: 400 });

    const decoded = await adminAuth.verifyIdToken(idToken);
    const userRecord = await adminAuth.getUser(decoded.uid);

    const expiresIn = 60 * 60 * 24 * 7 * 1000; // 7 days
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

    // ── Upsert user doc — ensures every user appears in the admin dashboard
    //    even if they registered before the Firestore write was added.
    if (userRecord.email) {
      const now = new Date().toISOString();
      await adminDb
        .collection("users")
        .doc(userRecord.uid)
        .set(
          {
            displayName: userRecord.displayName ?? null,
            email: userRecord.email,
            emailVerified: userRecord.emailVerified ?? false,
            photoURL: userRecord.photoURL ?? null,
            role: "member",
            updatedAt: now,
            lastLoginAt: now,
            provider: userRecord.providerData?.[0]?.providerId ?? "password",
            // Only set createdAt if the document doesn't already have it
          },
          { merge: true }
        )
        .catch((e) => console.error("[auth/login] user doc upsert failed:", e));

      // Set createdAt only if doc is new (merge won't overwrite existing fields,
      // but set() with merge does overwrite — so we do a conditional set via update fallback)
      const docRef = adminDb.collection("users").doc(userRecord.uid);
      const snap = await docRef.get();
      if (!snap.exists || !snap.data()?.createdAt) {
        await docRef.set(
          { createdAt: new Date(userRecord.metadata.creationTime).toISOString() },
          { merge: true }
        ).catch(() => {});
      }
    }

    const res = NextResponse.json({ success: true });
    res.cookies.set("session", sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: expiresIn / 1000,
      path: "/",
    });
    return res;
  } catch (err) {
    console.error("[auth/login]", err);
    return NextResponse.json({ error: "Authentication failed" }, { status: 401 });
  }
}
