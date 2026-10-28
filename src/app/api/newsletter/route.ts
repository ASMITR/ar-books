import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { adminDb } from "@/lib/firebase/admin";

const subscriptionSchema = z.object({
  email: z.string().trim().email().max(254),
  consent: z.literal(true),
  source: z.enum(["homepage", "footer"]),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  const parsed = subscriptionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Enter a valid email address and confirm your consent to subscribe." },
      { status: 400 },
    );
  }

  if (process.env.DEV_BYPASS === "true") {
    return NextResponse.json(
      { error: "Newsletter signups are unavailable in development mode." },
      { status: 503 },
    );
  }

  const email = parsed.data.email.toLowerCase();
  const subscriberId = createHash("sha256").update(email).digest("hex");
  const subscriberRef = adminDb.collection("newsletterSubscribers").doc(subscriberId);

  try {
    const alreadySubscribed = await adminDb.runTransaction(async (transaction) => {
      const existing = await transaction.get(subscriberRef);
      if (existing.exists) return true;

      const subscribedAt = new Date().toISOString();
      transaction.create(subscriberRef, {
        email,
        subscribedAt,
        consentAt: subscribedAt,
        source: parsed.data.source,
        status: "subscribed",
      });
      return false;
    });

    return NextResponse.json({
      success: true,
      message: alreadySubscribed
        ? "This email is already subscribed."
        : "Thank you for subscribing.",
    });
  } catch (error) {
    console.error("Newsletter signup failed:", error);
    return NextResponse.json(
      { error: "We couldn’t save your subscription. Please try again later." },
      { status: 500 },
    );
  }
}
