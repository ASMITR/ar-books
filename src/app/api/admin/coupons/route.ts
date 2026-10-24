import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { requireAdmin } from "@/lib/firebase/auth-server";

export async function GET() {
  try {
    await requireAdmin();
    const snap = await adminDb.collection("coupons").orderBy("code").get();
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
    if (!body.code || !body.discountType || !body.discountValue) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }
    const ref = adminDb.collection("coupons").doc();
    await ref.set({
      code: body.code.toUpperCase(),
      discountType: body.discountType,
      discountValue: body.discountValue,
      usageLimit: body.usageLimit ?? null,
      usageCount: 0,
      expiresAt: body.expiresAt ?? null,
      enabled: body.enabled ?? true,
      createdAt: new Date().toISOString(),
    });
    return NextResponse.json({ success: true, data: { id: ref.id } }, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof Error && (err.message === "UNAUTHENTICATED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
