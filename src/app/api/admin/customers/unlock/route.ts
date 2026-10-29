import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/firebase/auth-server";
import { adminUnlockEmail, getLockoutStatus } from "@/lib/auth/lockout";

/**
 * POST /api/admin/customers/unlock
 * Body: { email: string }
 *
 * Admin-only. Clears the lockout for a given email address so the user
 * can attempt to sign in again.
 */
export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const { email } = await req.json();
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Missing email" }, { status: 400 });
    }
    await adminUnlockEmail(email);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    if (err instanceof Error && (err.message === "UNAUTHENTICATED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    console.error("[admin/customers/unlock]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

/**
 * GET /api/admin/customers/unlock?email=...
 *
 * Admin-only. Returns current lockout status for an email.
 */
export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const email = req.nextUrl.searchParams.get("email");
    if (!email) {
      return NextResponse.json({ error: "Missing email" }, { status: 400 });
    }
    const status = await getLockoutStatus(email);
    return NextResponse.json(status);
  } catch (err: unknown) {
    if (err instanceof Error && (err.message === "UNAUTHENTICATED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
