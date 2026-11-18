import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { requireAuthor } from "@/lib/firebase/auth-server";
import { authorSeriesSchema } from "@/lib/validations";
import { writeAuditLog } from "@/lib/audit";
import { createNotification, getAdminUids } from "@/lib/notifications";
import cloudinary from "@/lib/cloudinary";

interface Params { params: Promise<{ id: string }> }

function handleErr(err: unknown) {
  if (err instanceof Error && (err.message === "UNAUTHENTICATED" || err.message === "FORBIDDEN")) {
    return NextResponse.json({ error: err.message }, { status: 403 });
  }
  return NextResponse.json({ error: "Internal error" }, { status: 500 });
}

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const user = await requireAuthor();
    const { id } = await params;
    const doc = await adminDb.collection("series").doc(id).get();
    if (!doc.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const data = doc.data()!;
    if (data.authorUid !== user.uid) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    return NextResponse.json({ success: true, data: { id: doc.id, ...data } });
  } catch (err) { return handleErr(err); }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const user = await requireAuthor();
    const { id } = await params;

    const doc = await adminDb.collection("series").doc(id).get();
    if (!doc.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const data = doc.data()!;
    if (data.authorUid !== user.uid) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });

    const editableStatuses = ["draft", "changes_requested"];
    if (!editableStatuses.includes(data.submissionStatus as string)) {
      return NextResponse.json(
        { error: `Series in "${data.submissionStatus}" status cannot be edited.` },
        { status: 400 }
      );
    }

    const body = await req.json();
    const parsed = authorSeriesSchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    // Cloudinary asset replacements
    const deletions: Promise<unknown>[] = [];
    if (body.coverImagePath && data.coverImagePath && data.coverImagePath !== body.coverImagePath) {
      deletions.push(cloudinary.uploader.destroy(data.coverImagePath as string, { resource_type: "image" }).catch(() => null));
    }
    if (body.bannerImagePath && data.bannerImagePath && data.bannerImagePath !== body.bannerImagePath) {
      deletions.push(cloudinary.uploader.destroy(data.bannerImagePath as string, { resource_type: "image" }).catch(() => null));
    }
    if (deletions.length) await Promise.all(deletions);

    await doc.ref.update({
      ...parsed.data,
      ...(body.coverImageUrl !== undefined && { coverImageUrl: body.coverImageUrl }),
      ...(body.coverImagePath !== undefined && { coverImagePath: body.coverImagePath }),
      ...(body.bannerImageUrl !== undefined && { bannerImageUrl: body.bannerImageUrl }),
      ...(body.bannerImagePath !== undefined && { bannerImagePath: body.bannerImagePath }),
      updatedAt: new Date().toISOString(),
    });

    writeAuditLog({
      actorUid: user.uid,
      actorEmail: user.email ?? "",
      actorRole: "author",
      action: "series_updated",
      resourceType: "series",
      resourceId: id,
      resourceTitle: data.name as string,
    }).catch(() => {});

    return NextResponse.json({ success: true });
  } catch (err) { return handleErr(err); }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const user = await requireAuthor();
    const { id } = await params;

    const doc = await adminDb.collection("series").doc(id).get();
    if (!doc.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const data = doc.data()!;
    if (data.authorUid !== user.uid) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });

    if (data.submissionStatus !== "draft") {
      return NextResponse.json(
        { error: "Only draft series can be deleted by authors." },
        { status: 400 }
      );
    }

    const deletions: Promise<unknown>[] = [];
    if (data.coverImagePath) deletions.push(cloudinary.uploader.destroy(data.coverImagePath as string, { resource_type: "image" }).catch(() => null));
    if (data.bannerImagePath) deletions.push(cloudinary.uploader.destroy(data.bannerImagePath as string, { resource_type: "image" }).catch(() => null));
    await Promise.all(deletions);

    await doc.ref.delete();
    writeAuditLog({ actorUid: user.uid, actorEmail: user.email ?? "", actorRole: "author", action: "series_deleted", resourceType: "series", resourceId: id, resourceTitle: data.name as string }).catch(() => {});

    return NextResponse.json({ success: true });
  } catch (err) { return handleErr(err); }
}
