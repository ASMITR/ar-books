import "server-only";
import Razorpay from "razorpay";

// Fallbacks prevent the constructor from throwing during Vercel's build-time
// page data collection, when env vars aren't injected. At runtime the real
// keys are always present.
export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID ?? "build-placeholder",
  key_secret: process.env.RAZORPAY_KEY_SECRET ?? "build-placeholder",
});

export { verifyPaymentSignature, verifyWebhookSignature } from "./utils";
export { formatINR } from "@/lib/currency";
