import { NextResponse } from "next/server";
import { getActiveMembershipPlans } from "@/lib/firebase/subscriptions";

// GET /api/membership/plans — public, returns active plans
export async function GET() {
  try {
    const plans = await getActiveMembershipPlans();
    return NextResponse.json({ success: true, data: plans });
  } catch (err) {
    console.error("[membership/plans]", err);
    return NextResponse.json({ success: false, error: "Failed to load plans" }, { status: 500 });
  }
}
