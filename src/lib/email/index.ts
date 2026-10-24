import { Resend } from "resend";
import type { Order } from "@/types";
import { formatINR } from "@/lib/currency";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM ?? "AR Books <noreply@arbooks.in>";

export async function sendOrderConfirmation(order: Order): Promise<void> {
  const itemsList = order.items
    .map((i) => `<li>${i.title} — ${formatINR(i.pricePaise)}</li>`)
    .join("");

  await resend.emails.send({
    from: FROM,
    to: order.customerEmail,
    subject: `Order Confirmed — ${order.orderNumber}`,
    html: `
      <h2>Thank you for your purchase, ${order.customerName}!</h2>
      <p>Order: <strong>${order.orderNumber}</strong></p>
      <ul>${itemsList}</ul>
      <p>Total: <strong>${formatINR(order.totalPaise)}</strong></p>
      <p>Sign in to your account to download your eBook(s) from My Library.</p>
      <p>— Asmit Rajaramkar</p>
    `,
  });
}

export async function sendPaymentFailureEmail(
  email: string,
  name: string,
  orderNumber: string
): Promise<void> {
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: `Payment Issue — Order ${orderNumber}`,
    html: `
      <p>Hi ${name},</p>
      <p>Your payment for order <strong>${orderNumber}</strong> could not be processed.</p>
      <p>Please try again or contact support.</p>
    `,
  });
}
