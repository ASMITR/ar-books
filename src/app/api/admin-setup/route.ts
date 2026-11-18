import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { adminSetupSchema } from "@/lib/validations";
import { rateLimit } from "@/lib/ratelimit";

const setupRef = adminDb.collection("adminSetup").doc("initialAdmin");
const adminUsersQuery = adminDb.collection("users").where("role", "==", "admin").limit(1);

function isValidSetupKey(suppliedKey: string, configuredKey: string): boolean {
  const supplied = Buffer.from(suppliedKey);
  const configured = Buffer.from(configuredKey);
  return supplied.length === configured.length && timingSafeEqual(supplied, configured);
}

function errorCode(error: unknown): string {
  if (typeof error === "object" && error !== null && "code" in error) {
    return String(error.code);
  }
  return error instanceof Error ? error.name : "UnknownError";
}

export async function POST(req: NextRequest) {
  if (req.headers.get("origin") !== req.nextUrl.origin) {
    return NextResponse.json({ error: "Request not allowed" }, { status: 403 });
  }

  if (!req.headers.get("content-type")?.includes("application/json")) {
    return NextResponse.json({ error: "Invalid request" }, { status: 415 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const { allowed, retryAfterMs } = rateLimit(ip, { limit: 3, windowMs: 60_000 });
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many setup attempts. Try again shortly." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) } }
    );
  }

  const setupSecret = process.env.ADMIN_SETUP_SECRET;
  if (!setupSecret || Buffer.byteLength(setupSecret) < 32) {
    return NextResponse.json({ error: "Admin setup is not configured." }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = adminSetupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid setup details." },
      { status: 400 }
    );
  }

  if (!isValidSetupKey(parsed.data.setupKey, setupSecret)) {
    return NextResponse.json({ error: "Invalid setup key." }, { status: 403 });
  }

  try {
    const reserved = await adminDb.runTransaction(async (transaction) => {
      const [setup, admins] = await Promise.all([
        transaction.get(setupRef),
        transaction.get(adminUsersQuery),
      ]);
      if (setup.exists || !admins.empty) return false;

      transaction.create(setupRef, {
        status: "provisioning",
        startedAt: new Date().toISOString(),
      });
      return true;
    });

    if (!reserved) {
      return NextResponse.json(
        { error: "Admin setup has already been completed." },
        { status: 409 }
      );
    }

    let uid: string | null = null;
    try {
      const user = await adminAuth.createUser({
        email: parsed.data.email,
        password: parsed.data.password,
        displayName: parsed.data.displayName,
      });
      uid = user.uid;

      await adminAuth.setCustomUserClaims(uid, { admin: true });

      const now = new Date().toISOString();
      await adminDb.collection("users").doc(uid).set({
        displayName: user.displayName,
        email: user.email,
        emailVerified: user.emailVerified,
        photoURL: user.photoURL ?? null,
        role: "admin",
        provider: "password",
        createdAt: now,
        updatedAt: now,
      });

      await setupRef.update({
        status: "complete",
        uid,
        completedAt: now,
      });

      return NextResponse.json({ success: true });
    } catch (error) {
      let cleanupFailed = false;
      if (uid) {
        try {
          await adminAuth.deleteUser(uid);
        } catch (cleanupError) {
          cleanupFailed = true;
          console.error("[admin-setup] Account cleanup failed:", errorCode(cleanupError));
        }
        try {
          await adminDb.collection("users").doc(uid).delete();
        } catch (cleanupError) {
          cleanupFailed = true;
          console.error("[admin-setup] Profile cleanup failed:", errorCode(cleanupError));
        }
      }

      try {
        if (cleanupFailed) {
          await setupRef.update({ status: "needs_recovery" });
        } else {
          await setupRef.delete();
        }
      } catch (cleanupError) {
        console.error("[admin-setup] Setup lock cleanup failed:", errorCode(cleanupError));
      }

      throw error;
    }
  } catch (error) {
    console.error("[admin-setup] Provisioning failed:", errorCode(error));
    return NextResponse.json({ error: "Admin setup failed. Please try again." }, { status: 500 });
  }
}
