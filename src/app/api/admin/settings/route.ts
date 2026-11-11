import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { adminDb } from "@/lib/firebase/admin";
import { requireAdmin } from "@/lib/firebase/auth-server";
import { z } from "zod";

const settingsSchema = z.object({
  storeName: z.string().min(1).max(100).optional(),
  supportEmail: z.string().email().optional(),
  taxPercent: z.number().min(0).max(100).optional(),
  currency: z.enum(["INR"]).optional(),
  razorpayEnabled: z.boolean().optional(),
  maintenanceMode: z.boolean().optional(),
  announcementBar: z.string().max(300).optional(),
  announcementBarEnabled: z.boolean().optional(),
});

export async function GET() {
  try {
    await requireAdmin();
    const doc = await adminDb.collection("settings").doc("store").get();
    return NextResponse.json({ success: true, data: doc.exists ? doc.data() : {} });
  } catch (err: unknown) {
    if (err instanceof Error && (err.message === "UNAUTHENTICATED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const parsed = settingsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid settings" }, { status: 400 });
    }
    await adminDb
      .collection("settings")
      .doc("store")
      .set({ ...parsed.data, updatedAt: new Date().toISOString() }, { merge: true });
    revalidateTag("settings", "default");
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    if (err instanceof Error && (err.message === "UNAUTHENTICATED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
