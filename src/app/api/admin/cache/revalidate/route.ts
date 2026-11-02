import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/firebase/auth-server";

const ALL_TAGS = ["books", "categories", "articles", "settings", "offers", "membershipPlans"] as const;

export async function POST() {
  try {
    await requireAdmin();

    for (const tag of ALL_TAGS) {
      revalidateTag(tag, { expire: 0 });
    }

    return NextResponse.json({
      success: true,
      cleared: ALL_TAGS,
      clearedAt: new Date().toISOString(),
    });
  } catch (err: unknown) {
    if (err instanceof Error && (err.message === "UNAUTHENTICATED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    console.error("[cache/revalidate]", err);
    return NextResponse.json({ success: false, error: "Failed to clear cache" }, { status: 500 });
  }
}
