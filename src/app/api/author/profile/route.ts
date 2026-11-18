import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { requireAuthor } from "@/lib/firebase/auth-server";
import { z } from "zod";

const updateSchema = z.object({
  displayName: z.string().min(2).optional(),
  bio: z.string().max(1000).optional(),
  website: z.string().url().optional().or(z.literal("")),
  institution: z.string().optional(),
  socialLinks: z.array(z.object({ platform: z.string(), url: z.string().url() })).optional(),
});

export async function GET() {
  try {
    const user = await requireAuthor();
    const doc = await adminDb.collection("authorProfiles").doc(user.uid).get();
    if (!doc.exists) {
      return NextResponse.json({ error: "Author profile not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: { id: doc.id, ...doc.data() } });
  } catch (err) {
    if (err instanceof Error && (err.message === "UNAUTHENTICATED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireAuthor();
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    await adminDb.collection("authorProfiles").doc(user.uid).update({
      ...parsed.data,
      updatedAt: new Date().toISOString(),
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof Error && (err.message === "UNAUTHENTICATED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
