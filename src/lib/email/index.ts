import { Resend } from "resend";
import type { Order } from "@/types";
import { formatINR } from "@/lib/currency";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM ?? "AR Books <noreply@arbooks.in>";

export async function sendOrderConfirmation(order: Order): Promise<void> {
  const itemsList = order.items
    .map(
      (i) => `
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #E9E7E2; color: #080808; font-size: 14px;">${i.title}</td>
          <td style="padding: 12px 0; border-bottom: 1px solid #E9E7E2; color: #080808; font-size: 14px; text-align: right; font-weight: 600;">${formatINR(i.pricePaise)}</td>
        </tr>`
    )
    .join("");

  await resend.emails.send({
    from: FROM,
    to: order.customerEmail,
    subject: `Order Confirmed — ${order.orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FAF9F6;">

        <!-- Header -->
        <div style="background: #080808; padding: 28px 40px;">
          <h1 style="color: #FFC928; font-size: 22px; margin: 0; letter-spacing: 2px;">AR BOOKS</h1>
          <p style="color: rgba(255,255,255,0.4); font-size: 11px; margin: 4px 0 0; letter-spacing: 1px; text-transform: uppercase;">by Asmit Rajaramkar</p>
        </div>

        <!-- Brand stripe -->
        <div style="height: 4px; background: linear-gradient(to right, #FFC928, #789185, #080808);"></div>

        <!-- Body -->
        <div style="padding: 40px;">
          <h2 style="font-size: 24px; color: #080808; margin: 0 0 8px;">Thank you, ${order.customerName}!</h2>
          <p style="color: #777; font-size: 15px; line-height: 1.7; margin: 0 0 28px;">
            Your order has been confirmed and your eBook(s) are ready to download.
          </p>

          <!-- Order details -->
          <div style="background: #fff; border: 1px solid #E9E7E2; border-radius: 8px; padding: 20px 24px; margin-bottom: 28px;">
            <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #999; margin: 0 0 12px;">Order ${order.orderNumber}</p>
            <table style="width: 100%; border-collapse: collapse;">
              ${itemsList}
              <tr>
                <td style="padding: 14px 0 0; font-size: 14px; font-weight: 700; color: #080808;">Total</td>
                <td style="padding: 14px 0 0; font-size: 16px; font-weight: 700; color: #080808; text-align: right;">${formatINR(order.totalPaise)}</td>
              </tr>
            </table>
          </div>

          <!-- CTA -->
          <a href="${process.env.NEXT_PUBLIC_BASE_URL ?? "https://arbooks.in"}/account/library"
             style="display: inline-block; background: #FFC928; color: #080808; font-weight: 700;
                    font-size: 13px; letter-spacing: 1.5px; text-transform: uppercase;
                    padding: 14px 32px; text-decoration: none;">
            Go to My Library &rarr;
          </a>

          <p style="color: #aaa; font-size: 13px; margin: 28px 0 0; line-height: 1.6;">
            Questions? Reply to this email or contact us at
            <a href="mailto:${process.env.EMAIL_FROM ?? "support@arbooks.in"}" style="color: #789185;">support@arbooks.in</a>.
          </p>
        </div>

        <!-- Footer -->
        <div style="padding: 20px 40px; background: #080808;">
          <p style="color: rgba(255,255,255,0.3); font-size: 12px; margin: 0; line-height: 1.6;">
            &copy; 2025 Asmit Rajaramkar. All rights reserved.<br/>
            All eBooks are digital products. No physical shipping.
          </p>
        </div>

      </div>
    `,
  });
}

export async function sendEmailVerificationLink(
  email: string,
  name: string,
  verificationLink: string
): Promise<void> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "https://arbooks.in";
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Verify your AR Books email address",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FAF9F6;">

        <!-- Header -->
        <div style="background: #080808; padding: 28px 40px;">
          <h1 style="color: #FFC928; font-size: 22px; margin: 0; letter-spacing: 2px;">AR BOOKS</h1>
          <p style="color: rgba(255,255,255,0.4); font-size: 11px; margin: 4px 0 0; letter-spacing: 1px; text-transform: uppercase;">by Asmit Rajaramkar</p>
        </div>

        <!-- Brand stripe -->
        <div style="height: 4px; background: linear-gradient(to right, #FFC928, #789185, #080808);"></div>

        <!-- Body -->
        <div style="padding: 40px;">
          <h2 style="font-size: 24px; color: #080808; margin: 0 0 8px;">Verify your email</h2>
          <p style="color: #777; font-size: 15px; line-height: 1.7; margin: 0 0 28px;">
            Hi ${name}, click the button below to verify your email address for your AR Books account.
            This link expires in <strong style="color: #080808;">24 hours</strong>.
          </p>

          <!-- CTA -->
          <a href="${verificationLink}"
             style="display: inline-block; background: #FFC928; color: #080808; font-weight: 700;
                    font-size: 13px; letter-spacing: 1.5px; text-transform: uppercase;
                    padding: 14px 32px; text-decoration: none;">
            Verify Email Address &rarr;
          </a>

          <p style="color: #aaa; font-size: 13px; margin: 28px 0 0; line-height: 1.6;">
            If you didn&apos;t request this, you can safely ignore this email.<br/>
            Or paste this link into your browser:<br/>
            <a href="${verificationLink}" style="color: #789185; word-break: break-all; font-size: 12px;">${verificationLink}</a>
          </p>

          <p style="color: #aaa; font-size: 13px; margin: 20px 0 0; line-height: 1.6;">
            Questions? Contact us at
            <a href="mailto:support@arbooks.in" style="color: #789185;">support@arbooks.in</a>.
          </p>
        </div>

        <!-- Footer -->
        <div style="padding: 20px 40px; background: #080808;">
          <p style="color: rgba(255,255,255,0.3); font-size: 12px; margin: 0; line-height: 1.6;">
            &copy; 2025 Asmit Rajaramkar. All rights reserved.<br/>
            All eBooks are digital products. No physical shipping.
          </p>
        </div>

      </div>
    `,
  });
}

export async function sendWelcomeEmail(
  email: string,
  name: string
): Promise<void> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://arbooks.in";
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Welcome to AR Books 🎉",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FAF9F6;">

        <!-- Header -->
        <div style="background: #080808; padding: 28px 40px;">
          <h1 style="color: #FFC928; font-size: 22px; margin: 0; letter-spacing: 2px;">AR BOOKS</h1>
          <p style="color: rgba(255,255,255,0.4); font-size: 11px; margin: 4px 0 0; letter-spacing: 1px; text-transform: uppercase;">by Asmit Rajaramkar</p>
        </div>

        <!-- Brand stripe -->
        <div style="height: 4px; background: linear-gradient(to right, #FFC928, #789185, #080808);"></div>

        <!-- Body -->
        <div style="padding: 40px;">
          <h2 style="font-size: 24px; color: #080808; margin: 0 0 8px;">Welcome, ${name}!</h2>
          <p style="color: #777; font-size: 15px; line-height: 1.7; margin: 0 0 24px;">
            Your account is all set. You can now browse our library, purchase eBooks,
            and access everything you buy instantly from your personal library.
          </p>

          <!-- Feature list -->
          <div style="background: #fff; border: 1px solid #E9E7E2; border-radius: 8px; padding: 20px 24px; margin-bottom: 28px;">
            <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #999; margin: 0 0 16px;">What you get</p>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #E9E7E2; color: #080808; font-size: 14px;">📚 Instant access to all purchased eBooks</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #E9E7E2; color: #080808; font-size: 14px;">⬇️ Download your books anytime, anywhere</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #E9E7E2; color: #080808; font-size: 14px;">🔔 Be the first to know about new releases & offers</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #080808; font-size: 14px;">🔒 Your orders and downloads — all in one place</td>
              </tr>
            </table>
          </div>

          <!-- CTA -->
          <a href="${baseUrl}/books"
             style="display: inline-block; background: #FFC928; color: #080808; font-weight: 700;
                    font-size: 13px; letter-spacing: 1.5px; text-transform: uppercase;
                    padding: 14px 32px; text-decoration: none;">
            Browse Books &rarr;
          </a>

          <p style="color: #aaa; font-size: 13px; margin: 28px 0 0; line-height: 1.6;">
            Questions? Reply to this email or reach us at
            <a href="mailto:support@arbooks.in" style="color: #789185;">support@arbooks.in</a>.
          </p>
        </div>

        <!-- Footer -->
        <div style="padding: 20px 40px; background: #080808;">
          <p style="color: rgba(255,255,255,0.3); font-size: 12px; margin: 0; line-height: 1.6;">
            &copy; 2025 Asmit Rajaramkar. All rights reserved.<br/>
            All eBooks are digital products. No physical shipping.
          </p>
        </div>

      </div>
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
    subject: `Payment Failed — Order ${orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FAF9F6;">

        <div style="background: #080808; padding: 28px 40px;">
          <h1 style="color: #FFC928; font-size: 22px; margin: 0; letter-spacing: 2px;">AR BOOKS</h1>
          <p style="color: rgba(255,255,255,0.4); font-size: 11px; margin: 4px 0 0; letter-spacing: 1px; text-transform: uppercase;">by Asmit Rajaramkar</p>
        </div>

        <div style="height: 4px; background: linear-gradient(to right, #FFC928, #789185, #080808);"></div>

        <div style="padding: 40px;">
          <h2 style="font-size: 22px; color: #080808; margin: 0 0 8px;">Payment unsuccessful</h2>
          <p style="color: #777; font-size: 15px; line-height: 1.7; margin: 0 0 24px;">
            Hi ${name}, your payment for order <strong style="color: #080808;">${orderNumber}</strong> could not be processed. Please try again.
          </p>
          <a href="${process.env.NEXT_PUBLIC_BASE_URL ?? "https://arbooks.in"}/cart"
             style="display: inline-block; background: #080808; color: #fff; font-weight: 700;
                    font-size: 13px; letter-spacing: 1.5px; text-transform: uppercase;
                    padding: 14px 32px; text-decoration: none;">
            Try Again &rarr;
          </a>
          <p style="color: #aaa; font-size: 13px; margin: 28px 0 0;">
            Need help? Contact us at <a href="mailto:support@arbooks.in" style="color: #789185;">support@arbooks.in</a>.
          </p>
        </div>

        <div style="padding: 20px 40px; background: #080808;">
          <p style="color: rgba(255,255,255,0.3); font-size: 12px; margin: 0;">
            &copy; 2025 Asmit Rajaramkar. All rights reserved.
          </p>
        </div>

      </div>
    `,
  });
}

