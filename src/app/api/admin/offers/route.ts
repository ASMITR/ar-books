import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { requireAdmin } from "@/lib/firebase/auth-server";
import { z } from "zod";
import type { OfferType, OfferStatus, OfferEligibility } from "@/types";

const offerSchema = z.object({
  internalName: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  bannerImageUrl: z.string().optional(),
  offerType: z.enum(["percent", "flat", "buy_x_get_y", "bundle", "first_order", "combo", "category", "product_specific"] as [OfferType, ...OfferType[]]),
  couponCode: z.string().optional().transform((v) => v ? v.toUpperCase().trim() : undefined),
  startAt: z.string().min(1),
  endAt: z.string().optional(),
  status: z.enum(["draft", "scheduled", "active", "paused", "expired"] as [OfferStatus, ...OfferStatus[]]),
  priority: z.number().int().default(0),

  discountType: z.enum(["percent", "flat"]),
  discountValue: z.number().positive(),
  maxDiscountPaise: z.number().int().positive().optional(),
  buyX: z.number().int().positive().optional(),
  getY: z.number().int().positive().optional(),

  minCartValuePaise: z.number().int().nonnegative().optional(),
  minItemCount: z.number().int().positive().optional(),
  applicableBookIds: z.array(z.string()).optional(),
  applicableCategoryIds: z.array(z.string()).optional(),
  customerEligibility: z.enum(["all", "new_customers", "existing_customers"] as [OfferEligibility, ...OfferEligibility[]]).default("all"),
  usageLimitTotal: z.number().int().positive().optional(),
  usageLimitPerCustomer: z.number().int().positive().optional(),
  stackable: z.boolean().default(false),

  showOnHomepage: z.boolean().default(true),
  showOnProductPages: z.boolean().default(true),
  showInCart: z.boolean().default(true),
  showOnCheckout: z.boolean().default(true),
  showInAnnouncementBar: z.boolean().default(false),
  displayCouponPublicly: z.boolean().default(true),
  ctaText: z.string().optional(),
  badgeLabel: z.string().optional(),
});

export async function GET() {
  try {
    const user = await requireAdmin();
    const snap = await adminDb
      .collection("offers")
      .orderBy("createdAt", "desc")
      .get();
    const offers = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    void user;
    return NextResponse.json({ success: true, data: offers });
  } catch (err: unknown) {
    if (err instanceof Error && (err.message === "UNAUTHENTICATED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAdmin();
    let body: unknown;
    try { body = await req.json(); } catch {
      return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
    }

    const parsed = offerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const ref = adminDb.collection("offers").doc();
    await ref.set({
      ...parsed.data,
      usageCount: 0,
      createdAt: now,
      updatedAt: now,
      createdBy: user.uid,
    });

    return NextResponse.json({ success: true, data: { id: ref.id } }, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof Error && (err.message === "UNAUTHENTICATED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    console.error("[admin/offers POST]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
