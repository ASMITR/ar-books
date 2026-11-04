import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { adminDb } from "@/lib/firebase/admin";
import { requireAdmin } from "@/lib/firebase/auth-server";
import { z } from "zod";

const planPatchSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  description: z.string().optional(),
  pricePaise: z.number().int().positive().optional(),
  currency: z.enum(["INR"]).optional(),
  active: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
  razorpayPlanId: z.string().optional(),
  features: z.array(z.string()).optional(),
  allowDownloads: z.boolean().optional(),
  downloadLimitPerMonth: z.number().int().nonnegative().nullable().optional(),
  accessTier: z.string().optional(),
});

interface Params { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    await requireAdmin();
    const { id } = await params;
    const doc = await adminDb.collection("membershipPlans").doc(id).get();
    if (!doc.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: { id: doc.id, ...doc.data() } });
  } catch (err: unknown) {
    if (err instanceof Error && (err.message === "UNAUTHENTICATED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await req.json();
    const parsed = planPatchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid fields" }, { status: 400 });
    }
    // Never allow price change to silently affect existing subscriptions
    // Existing subs store pricePaise at time of creation (immutable snapshot)
    await adminDb.collection("membershipPlans").doc(id).update({
      ...parsed.data,
      updatedAt: new Date().toISOString(),
    });
    revalidateTag("membershipPlans", { expire: 0 });
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    if (err instanceof Error && (err.message === "UNAUTHENTICATED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
