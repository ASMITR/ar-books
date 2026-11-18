import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { adminDb } from "@/lib/firebase/admin";
import { requireAdmin } from "@/lib/firebase/auth-server";
import { writeAuditLog } from "@/lib/audit";
import { createNotification } from "@/lib/notifications";
import { z } from "zod";

interface Params { params: Promise<{ id: string }> }

function sanitizeLog(v: string) { return v.replace(/[\r\n]/g, "_"); }
function handleErr(err: unknown) {
  if (err instanceof Error && (err.message === "UNAUTHENTICATED" || err.message === "FORBIDDEN")) {
    return NextResponse.json({ error: err.message }, { status: 403 });
  }
  return NextResponse.json({ error: "Internal error" }, { status: 500 });
}

const actionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("approve"),
    resourceType: z.enum(["book", "series"]),
  }),
  z.object({
    action: z.literal("reject"),
    resourceType: z.enum(["book", "series"]),
    reason: z.string().min(1, "Rejection reason is required"),
  }),
  z.object({
    action: z.literal("request_changes"),
    resourceType: z.enum(["book", "series"]),
    comment: z.string().min(1, "Comment is required"),
  }),
  z.object({
    action: z.literal("publish"),
    resourceType: z.enum(["book", "series"]),
    // Owner sets final price at publish time for books
    priceRupees: z.number().positive().optional(),
    originalPriceRupees: z.number().positive().optional(),
  }),
  z.object({
    action: z.literal("unpublish"),
    resourceType: z.enum(["book", "series"]),
  }),
  z.object({
    action: z.literal("set_price"),
    resourceType: z.literal("book"),
    priceRupees: z.number().positive("Price must be positive"),
    originalPriceRupees: z.number().positive().optional(),
  }),
]);

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;

    const body = await req.json();
    const parsed = actionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.flatten() }, { status: 400 });
    }

    const { action, resourceType } = parsed.data;
    const collection = resourceType === "book" ? "books" : "series";

    const doc = await adminDb.collection(collection).doc(id).get();
    if (!doc.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const data = doc.data()!;
    const now = new Date().toISOString();
    const authorUid = data.authorUid as string | undefined;
    const resourceTitle = (resourceType === "book" ? data.title : data.name) as string;

    let update: Record<string, unknown> = { updatedAt: now };
    let approvalAction: string = action;
    let notificationType: string;
    let notificationTitle: string;
    let notificationMessage: string;

    switch (action) {
      case "approve": {
        // Can only approve pending books/series
        if (data.submissionStatus !== "pending_approval") {
          return NextResponse.json(
            { error: `Cannot approve a ${resourceType} in "${data.submissionStatus}" status.` },
            { status: 400 }
          );
        }
        update = { ...update, submissionStatus: "approved", ownerFeedback: null };
        notificationType = resourceType === "book" ? "book_approved" : "series_approved";
        notificationTitle = `Your ${resourceType} was approved`;
        notificationMessage = `"${resourceTitle}" has been approved. The owner will set the final price and publish it soon.`;
        break;
      }

      case "reject": {
        const { reason } = parsed.data as { action: "reject"; resourceType: string; reason: string };
        if (!["pending_approval", "changes_requested"].includes(data.submissionStatus as string)) {
          return NextResponse.json({ error: `Cannot reject in "${data.submissionStatus}" status.` }, { status: 400 });
        }
        update = { ...update, submissionStatus: "rejected", ownerFeedback: reason };
        approvalAction = "rejected";
        notificationType = resourceType === "book" ? "book_rejected" : "series_rejected";
        notificationTitle = `Your ${resourceType} was not accepted`;
        notificationMessage = `"${resourceTitle}" was rejected. Reason: ${reason}`;
        break;
      }

      case "request_changes": {
        const { comment } = parsed.data as { action: "request_changes"; resourceType: string; comment: string };
        if (data.submissionStatus !== "pending_approval") {
          return NextResponse.json({ error: `Cannot request changes on a ${resourceType} in "${data.submissionStatus}" status.` }, { status: 400 });
        }
        update = { ...update, submissionStatus: "changes_requested", ownerFeedback: comment };
        approvalAction = "changes_requested";
        notificationType = resourceType === "book" ? "book_changes_requested" : "series_changes_requested";
        notificationTitle = `Changes requested for your ${resourceType}`;
        notificationMessage = `"${resourceTitle}" needs some changes: ${comment}`;
        break;
      }

      case "publish": {
        // Must be approved first (or admin overrides to publish directly)
        if (!["approved", "unpublished"].includes(data.submissionStatus as string)) {
          return NextResponse.json(
            { error: `Only approved or unpublished ${resourceType}s can be published.` },
            { status: 400 }
          );
        }

        const publishData = parsed.data as { action: "publish"; resourceType: string; priceRupees?: number; originalPriceRupees?: number };

        if (resourceType === "book") {
          if (!publishData.priceRupees && !data.priceRupees) {
            return NextResponse.json({ error: "Set the final price before publishing." }, { status: 422 });
          }
          update = {
            ...update,
            submissionStatus: "published",
            published: true,
            ...(publishData.priceRupees && { priceRupees: publishData.priceRupees }),
            ...(publishData.originalPriceRupees && { originalPriceRupees: publishData.originalPriceRupees }),
          };
        } else {
          update = { ...update, submissionStatus: "published", visible: true };
        }

        notificationType = resourceType === "book" ? "book_published" : "series_published";
        notificationTitle = `Your ${resourceType} is live!`;
        notificationMessage = `"${resourceTitle}" has been published and is now available to customers.`;
        break;
      }

      case "unpublish": {
        if (!["published"].includes(data.submissionStatus as string)) {
          return NextResponse.json({ error: "Only published resources can be unpublished." }, { status: 400 });
        }
        update = {
          ...update,
          submissionStatus: "unpublished",
          ...(resourceType === "book" ? { published: false } : { visible: false }),
        };
        notificationType = resourceType === "book" ? "book_unpublished" : "series_published";
        notificationTitle = `Your ${resourceType} has been unpublished`;
        notificationMessage = `"${resourceTitle}" has been taken offline. Contact the owner for details.`;
        break;
      }

      case "set_price": {
        if (resourceType !== "book") {
          return NextResponse.json({ error: "Price can only be set for books." }, { status: 400 });
        }
        const { priceRupees, originalPriceRupees } = parsed.data as { action: "set_price"; resourceType: "book"; priceRupees: number; originalPriceRupees?: number };
        update = {
          ...update,
          priceRupees,
          ...(originalPriceRupees !== undefined && { originalPriceRupees }),
        };
        notificationType = "price_updated";
        notificationTitle = "Price updated for your book";
        notificationMessage = `The final price for "${resourceTitle}" has been set to ₹${priceRupees}.`;
        break;
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    await adminDb.collection(collection).doc(id).update(update);

    // Write approval record
    const approvalRef = adminDb.collection("approvalRecords").doc();
    await approvalRef.set({
      resourceType,
      resourceId: id,
      action: approvalAction,
      actorUid: admin.uid,
      actorRole: "admin",
      snapshotTitle: resourceTitle,
      comment: (parsed.data as Record<string, unknown>).comment
        ?? (parsed.data as Record<string, unknown>).reason
        ?? null,
      ...(action === "set_price" || action === "publish"
        ? { priceRupees: (parsed.data as Record<string, unknown>).priceRupees ?? null }
        : {}),
      createdAt: now,
    });

    // Notify author if the book/series belongs to one
    if (authorUid) {
      createNotification({
        recipientUid: authorUid,
        type: notificationType as import("@/types").NotificationType,
        title: notificationTitle,
        message: notificationMessage,
        resourceType,
        resourceId: id,
        resourceTitle,
      }).catch(() => {});
    }

    // Bust public catalogue cache for publish/unpublish/set_price
    if (["publish", "unpublish", "set_price"].includes(action)) {
      revalidateTag(resourceType === "book" ? "books" : "series", "default");
    }

    writeAuditLog({
      actorUid: admin.uid,
      actorEmail: admin.email ?? "",
      actorRole: "admin",
      action: `${resourceType}_${approvalAction}`,
      resourceType,
      resourceId: id,
      resourceTitle,
      newValues: update,
    }).catch(() => {});

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[approvals/POST]", sanitizeLog(err instanceof Error ? err.message : String(err)));
    return handleErr(err);
  }
}
