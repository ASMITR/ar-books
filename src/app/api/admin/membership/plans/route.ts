import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { adminDb } from "@/lib/firebase/admin";
import { requireAdmin } from "@/lib/firebase/auth-server";
import { z } from "zod";

const planSchema = z.object({
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

export async function GET() {
  try {
    await requireAdmin();
    const snap = await adminDb.collection("membershipPlans").orderBy("sortOrder", "asc").get();
    return NextResponse.json({ success: true, data: snap.docs.map((d) => ({ id: d.id, ...d.data() })) });
  } catch (err: unknown) {
    if (err instanceof Error && (err.message === "UNAUTHENTICATED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const parsed = planSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid fields" }, { status: 400 });
    }
    const now  = new Date().toISOString();
    const ref  = adminDb.collection("membershipPlans").doc();
    await ref.set({ ...parsed.data, createdAt: now, updatedAt: now });
    revalidateTag("membershipPlans", { expire: 0 });
    return NextResponse.json({ success: true, data: { id: ref.id } }, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof Error && (err.message === "UNAUTHENTICATED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
