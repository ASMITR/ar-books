import { Resend } from "resend";
import type { Order } from "@/types";
import { formatINR } from "@/lib/currency";

// Lazy init — the Resend constructor throws if the API key is undefined,
// which breaks Vercel's build-time page data collection. Initialize only
// on first use (at request time when env vars are available).
let _resend: Resend | null = null;
function getResend() {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY!);
  return _resend;
}

const FROM = process.env.EMAIL_FROM ?? "AR Books <noreply@arbooks.in>";

export async function sendOrderConfirmation(order: Order): Promise<void> {
  const itemsList = order.items
    .map(
      (i) => `
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #E9E7E2; color: #080808; font-size: 14px;">${i.title}</td>
          <td style="padding: 12px 0; border-bottom: 1px solid #E9E7E2; color: #080808; font-size: 14px; text-align: right; font-weight: 600;">${formatINR(i.priceRupees)}</td>
        </tr>`
    )
    .join("");

  await getResend().emails.send({
    from: FROM,
    to: order.customerEmail,
    subject: `Order Confirmed — ${order.orderNumber}`,
    text: `Hi ${order.customerName}, your order ${order.orderNumber} is confirmed. Total: ${formatINR(order.totalRupees)}. Download your books at ${process.env.NEXT_PUBLIC_BASE_URL ?? "https://arbooks.in"}/account/library`,
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
                <td style="padding: 14px 0 0; font-size: 16px; font-weight: 700; color: #080808; text-align: right;">${formatINR(order.totalRupees)}</td>
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
  await getResend().emails.send({
    from: FROM,
    to: email,
    subject: "Verify your AR Books email address",
    text: `Hi ${name}, verify your AR Books email by visiting: ${verificationLink} — This link expires in 24 hours.`,
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
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.asmitrajaramkarbooks.store";
  const instagramUrl = "https://www.instagram.com/asmitrajaramkarbooks/";
  const websiteUrl = baseUrl;

  await getResend().emails.send({
    from: FROM,
    to: email,
    subject: "Welcome to AR Books — Your account is ready",
    text: `Welcome to AR Books, ${name}! Your account is ready. Browse books at ${process.env.NEXT_PUBLIC_BASE_URL ?? "https://arbooks.in"}/books`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FAF9F6;">

        <!-- Header -->
        <div style="background: #080808; padding: 32px 40px; text-align: center;">
          <img src="${baseUrl}/Horizontal_Logo.png" alt="AR Books" width="160" style="display: inline-block; filter: brightness(0) invert(1);" />
          <p style="color: rgba(255,255,255,0.35); font-size: 11px; margin: 8px 0 0; letter-spacing: 1.5px; text-transform: uppercase;">by Asmit Rajaramkar</p>
        </div>

        <!-- Brand stripe -->
        <div style="height: 4px; background: linear-gradient(to right, #FFC928, #789185, #080808);"></div>

        <!-- Welcome hero -->
        <div style="background: #fff; padding: 40px 40px 32px; text-align: center; border-bottom: 1px solid #E9E7E2;">
          <div style="width: 56px; height: 56px; background: #FFC928; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 26px; margin-bottom: 16px;">👋</div>
          <h1 style="font-size: 26px; color: #080808; margin: 0 0 8px; font-weight: 700;">Welcome, ${name}!</h1>
          <p style="color: #777; font-size: 15px; line-height: 1.7; margin: 0; max-width: 420px; display: inline-block;">
            Your AR Books account is ready. Dive into a world of stories, knowledge, and ideas — all in one place.
          </p>
        </div>

        <!-- Quick access buttons -->
        <div style="padding: 32px 40px; background: #FAF9F6;">
          <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #999; margin: 0 0 16px; text-align: center;">Quick Access</p>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 0 6px 0 0; width: 50%;">
                <a href="${baseUrl}/books"
                   style="display: block; background: #FFC928; color: #080808; font-weight: 700;
                          font-size: 12px; letter-spacing: 1.5px; text-transform: uppercase;
                          padding: 14px 16px; text-decoration: none; text-align: center;">
                  📚 Browse Books
                </a>
              </td>
              <td style="padding: 0 0 0 6px; width: 50%;">
                <a href="${baseUrl}/account/library"
                   style="display: block; background: #080808; color: #fff; font-weight: 700;
                          font-size: 12px; letter-spacing: 1.5px; text-transform: uppercase;
                          padding: 14px 16px; text-decoration: none; text-align: center;">
                  🗂️ My Library
                </a>
              </td>
            </tr>
            <tr>
              <td style="padding: 12px 6px 0 0; width: 50%;">
                <a href="${baseUrl}/account/orders"
                   style="display: block; background: #fff; color: #080808; font-weight: 700;
                          font-size: 12px; letter-spacing: 1.5px; text-transform: uppercase;
                          padding: 14px 16px; text-decoration: none; text-align: center;
                          border: 1px solid #E9E7E2;">
                  🧾 My Orders
                </a>
              </td>
              <td style="padding: 12px 0 0 6px; width: 50%;">
                <a href="${baseUrl}/account/dashboard"
                   style="display: block; background: #fff; color: #080808; font-weight: 700;
                          font-size: 12px; letter-spacing: 1.5px; text-transform: uppercase;
                          padding: 14px 16px; text-decoration: none; text-align: center;
                          border: 1px solid #E9E7E2;">
                  👤 My Account
                </a>
              </td>
            </tr>
          </table>
        </div>

        <!-- What you get -->
        <div style="padding: 0 40px 32px;">
          <div style="background: #fff; border: 1px solid #E9E7E2; padding: 24px;">
            <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #999; margin: 0 0 16px;">What you get</p>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 9px 0; border-bottom: 1px solid #F0EEE9; color: #080808; font-size: 14px;">📖 Instant access to all purchased eBooks</td></tr>
              <tr><td style="padding: 9px 0; border-bottom: 1px solid #F0EEE9; color: #080808; font-size: 14px;">⬇️ Download your books anytime, anywhere</td></tr>
              <tr><td style="padding: 9px 0; border-bottom: 1px solid #F0EEE9; color: #080808; font-size: 14px;">🔔 Early access to new releases &amp; exclusive offers</td></tr>
              <tr><td style="padding: 9px 0; color: #080808; font-size: 14px;">🔒 All your orders &amp; downloads in one place</td></tr>
            </table>
          </div>
        </div>

        <!-- Author card -->
        <div style="margin: 0 40px 32px; background: #080808; padding: 28px 32px;">
          <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: rgba(255,255,255,0.35); margin: 0 0 12px;">From the Author</p>
          <p style="color: rgba(255,255,255,0.85); font-size: 14px; line-height: 1.8; margin: 0 0 20px; font-style: italic;">
            &ldquo;Thank you for joining AR Books. Every book here is written with heart — I hope they inspire, challenge, and stay with you long after the last page.&rdquo;
          </p>
          <p style="color: #FFC928; font-size: 14px; font-weight: 700; margin: 0 0 16px;">— Asmit Rajaramkar</p>
          <table style="border-collapse: collapse;">
            <tr>
              <td style="padding-right: 12px;">
                <a href="${websiteUrl}" style="display: inline-block; background: #FFC928; color: #080808; font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; padding: 9px 18px; text-decoration: none;">🌐 Website</a>
              </td>
              <td>
                <a href="${instagramUrl}" style="display: inline-block; background: transparent; color: #fff; font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; padding: 9px 18px; text-decoration: none; border: 1px solid rgba(255,255,255,0.2);">📸 Instagram</a>
              </td>
            </tr>
          </table>
        </div>

        <!-- Footer -->
        <div style="padding: 24px 40px; background: #080808; text-align: center;">
          <p style="color: rgba(255,255,255,0.3); font-size: 12px; margin: 0 0 8px; line-height: 1.6;">
            Questions? <a href="mailto:support@arbooks.in" style="color: #789185;">support@arbooks.in</a>
          </p>
          <p style="color: rgba(255,255,255,0.2); font-size: 11px; margin: 0; line-height: 1.6;">
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
  await getResend().emails.send({
    from: FROM,
    to: email,
    subject: `Payment Failed — Order ${orderNumber}`,
    text: `Hi ${name}, your payment for order ${orderNumber} could not be processed. Please try again at ${process.env.NEXT_PUBLIC_BASE_URL ?? "https://arbooks.in"}/cart`,
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

