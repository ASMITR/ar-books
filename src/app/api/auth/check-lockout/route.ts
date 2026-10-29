import { NextRequest, NextResponse } from "next/server";
import { getLockoutStatus } from "@/lib/auth/lockout";

/**
 * POST /api/auth/check-lockout
 * Body: { email: string }
 *
 * Returns the current lockout state for an email so the login page
 * can block the attempt before even hitting Firebase.
 */
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Missing email" }, { status: 400 });
    }
    const status = await getLockoutStatus(email);
    return NextResponse.json(status);
  } catch (err) {
    console.error("[check-lockout]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
