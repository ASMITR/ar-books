import { NextRequest, NextResponse } from "next/server";
import { recordSuccessfulLogin } from "@/lib/auth/lockout";

/**
 * POST /api/auth/record-success
 * Body: { email: string }
 *
 * Called after a successful login to reset the attempt counter.
 */
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Missing email" }, { status: 400 });
    }
    await recordSuccessfulLogin(email);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[record-success]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
