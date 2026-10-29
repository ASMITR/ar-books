/**
 * GET /api/offers
 * Public endpoint — returns currently active, publicly displayable offers.
 */

import { NextResponse } from "next/server";
import { getActivePublicOffers } from "@/lib/firebase/firestore";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const offers = await getActivePublicOffers();
    return NextResponse.json({ success: true, data: offers });
  } catch (err) {
    console.error("[/api/offers]", err);
    return NextResponse.json({ success: false, error: "Failed to load offers" }, { status: 500 });
  }
}
