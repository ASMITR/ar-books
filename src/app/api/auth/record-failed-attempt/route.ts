import { NextRequest, NextResponse } from "next/server";
import { recordFailedAttempt } from "@/lib/auth/lockout";

/**
 * POST /api/auth/record-failed-attempt
 * Body: { email: string }
 *
 * Called by the login page after Firebase rejects credentials.
 * Increments the attempt counter and applies the appropriate lockout rule.
 * Returns the updated lockout status so the UI can display the correct message.
 */
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Missing email" }, { status: 400 });
    }
    const status = await recordFailedAttempt(email);
    return NextResponse.json(status);
  } catch (err) {
    console.error("[record-failed-attempt]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
