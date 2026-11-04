import "server-only";
import crypto from "crypto";

export function verifyPaymentSignature(params: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}): boolean {
  const body = `${params.razorpayOrderId}|${params.razorpayPaymentId}`;
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest("hex");
  return timingSafeHexEqual(expected, params.razorpaySignature);
}

export function verifyWebhookSignature(body: string, signature: string): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return false;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");
  return timingSafeHexEqual(expected, signature);
}

function timingSafeHexEqual(expected: string, actual: string): boolean {
  const a = Buffer.from(expected, "hex");
  const valid = /^[\da-f]{64}$/i.test(actual);
  const b = valid ? Buffer.from(actual, "hex") : Buffer.alloc(32);
  return crypto.timingSafeEqual(a, b) && valid;
}
