/**
 * GET /api/store-config
 *
 * Returns the publicly-safe subset of store settings that the client-side
 * checkout UI needs (e.g. taxPercent to show an estimated tax line).
 * Does NOT expose sensitive fields.
 */
import { NextResponse } from "next/server";
import { getStoreSettings } from "@/lib/firebase/firestore";

export async function GET() {
  const settings = await getStoreSettings();
  return NextResponse.json({
    success: true,
    data: {
      taxPercent: settings?.taxPercent ?? 0,
      currency:   settings?.currency   ?? "INR",
    },
  });
}
