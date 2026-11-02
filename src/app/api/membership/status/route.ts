/**
 * GET /api/membership/status
 * Returns the current user's active membership (or null).
 * Used by client components that need to know subscription state.
 */
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/firebase/auth-server";
import { getActiveMembershipForCustomer } from "@/lib/firebase/subscriptions";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ success: true, data: null });
    }
    const membership = await getActiveMembershipForCustomer(user.uid);
    return NextResponse.json({ success: true, data: membership });
  } catch (err) {
    console.error("[membership/status]", err);
    return NextResponse.json({ success: false, error: "Failed to load status" }, { status: 500 });
  }
}
