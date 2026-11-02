import { Resend } from "resend";
import { formatINR } from "@/lib/currency";
import type { MembershipSubscription, MembershipPlan } from "@/types/subscription";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM   = process.env.EMAIL_FROM ?? "AR Books <noreply@arbooks.in>";
const BASE   = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.asmitrajaramkarbooks.store";

// ─── Shared email wrapper ─────────────────────────────────────────────────────
function wrap(title: string, body: string): string {
  return `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FAF9F6;">
    <div style="background: #1C3325; padding: 28px 40px; border-bottom: 3px solid #C6A66B;">
      <h1 style="color: #C6A66B; font-size: 20px; margin: 0; letter-spacing: 2px;">AR BOOKS</h1>
      <p style="color: rgba(255,255,255,0.5); font-size: 11px; margin: 4px 0 0; letter-spacing: 1px; text-transform: uppercase;">by Asmit Rajaramkar</p>
    </div>
    <div style="padding: 36px 40px;">
      <h2 style="font-size: 22px; color: #1a1a1a; margin: 0 0 20px;">${title}</h2>
      ${body}
    </div>
    <div style="padding: 20px 40px; background: #1C3325; border-top: 1px solid #2E5040;">
      <p style="color: rgba(255,255,255,0.35); font-size: 12px; margin: 0; line-height: 1.6;">
        &copy; ${new Date().getFullYear()} Asmit Rajaramkar Books. All rights reserved.<br/>
        READ. LEARN. IMAGINE.
      </p>
    </div>
  </div>`;
}

function ctaButton(href: string, label: string): string {
  return `<a href="${href}" style="display: inline-block; background: #203A2B; color: #FFFCF7; font-weight: 700; font-size: 12px; letter-spacing: 1.5px; text-transform: uppercase; padding: 13px 28px; text-decoration: none; margin-top: 20px;">${label} &rarr;</a>`;
}

function planBadge(planName: string): string {
  return `<span style="display: inline-block; background: #C6A66B; color: #1C3325; font-size: 10px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; padding: 4px 10px; border-radius: 2px;">${planName} Member</span>`;
}

// ─── 1. Subscription Activated / Welcome ─────────────────────────────────────
export async function sendSubscriptionActivated(
  sub: MembershipSubscription,
  plan: MembershipPlan
): Promise<void> {
  const body = `
    <p style="color: #555; font-size: 15px; line-height: 1.8; margin: 0 0 20px;">
      Hello ${sub.customerName},<br/><br/>
      Welcome to your <strong>${plan.name}</strong> membership! Your subscription has been activated and you can now explore your exclusive eBook library.
    </p>
    <div style="background: #fff; border: 1px solid #E6DFD5; padding: 20px 24px; margin-bottom: 20px;">
      <p style="margin: 0 0 10px;">${planBadge(plan.name)}</p>
      <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
        <tr><td style="padding: 6px 0; color: #777;">Plan</td><td style="text-align: right; font-weight: 600; color: #1a1a1a;">${plan.name}</td></tr>
        <tr><td style="padding: 6px 0; color: #777;">Monthly amount</td><td style="text-align: right; font-weight: 600; color: #203A2B;">${formatINR(plan.pricePaise)}/month</td></tr>
        <tr><td style="padding: 6px 0; color: #777;">Next renewal</td><td style="text-align: right; font-weight: 600; color: #1a1a1a;">${new Date(sub.currentPeriodEnd).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</td></tr>
      </table>
    </div>
    <p style="color: #555; font-size: 13px; margin: 0 0 4px;"><strong>Your membership includes:</strong></p>
    <ul style="color: #555; font-size: 13px; line-height: 2; padding-left: 20px; margin: 0 0 20px;">
      ${plan.benefits.map((b) => `<li>${b}</li>`).join("")}
    </ul>
    ${ctaButton(`${BASE}/account/membership/library`, "Explore My Library")}
  `;
  await resend.emails.send({
    from: FROM,
    to: sub.customerEmail,
    subject: `Welcome to ${plan.name} Membership — Asmit Rajaramkar Books`,
    html: wrap(`Welcome to AR Books ${plan.name} Membership!`, body),
  });
}

// ─── 2. Subscription Renewed ──────────────────────────────────────────────────
export async function sendSubscriptionRenewed(
  sub: MembershipSubscription,
  plan: MembershipPlan,
  amountPaise: number
): Promise<void> {
  const body = `
    <p style="color: #555; font-size: 15px; line-height: 1.8; margin: 0 0 20px;">
      Hello ${sub.customerName},<br/><br/>
      Your <strong>${plan.name}</strong> membership has been renewed successfully. Your reading access continues uninterrupted.
    </p>
    <div style="background: #fff; border: 1px solid #E6DFD5; padding: 20px 24px; margin-bottom: 20px;">
      <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
        <tr><td style="padding: 6px 0; color: #777;">Amount charged</td><td style="text-align: right; font-weight: 700; color: #203A2B;">${formatINR(amountPaise)}</td></tr>
        <tr><td style="padding: 6px 0; color: #777;">Membership valid until</td><td style="text-align: right; font-weight: 600; color: #1a1a1a;">${new Date(sub.currentPeriodEnd).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</td></tr>
      </table>
    </div>
    ${ctaButton(`${BASE}/account/membership`, "View My Membership")}
  `;
  await resend.emails.send({
    from: FROM,
    to: sub.customerEmail,
    subject: `Membership Renewed — ${plan.name} — Asmit Rajaramkar Books`,
    html: wrap("Your Membership Has Been Renewed", body),
  });
}

// ─── 3. Payment Failed ────────────────────────────────────────────────────────
export async function sendSubscriptionPaymentFailed(
  sub: MembershipSubscription,
  plan: MembershipPlan
): Promise<void> {
  const body = `
    <p style="color: #555; font-size: 15px; line-height: 1.8; margin: 0 0 20px;">
      Hello ${sub.customerName},<br/><br/>
      We were unable to process your <strong>${plan.name}</strong> membership renewal payment. Your access will continue during the grace period while we retry.
    </p>
    <div style="background: #FFF5F5; border: 1px solid #FECACA; padding: 16px 20px; margin-bottom: 20px; border-radius: 4px;">
      <p style="color: #B91C1C; font-size: 13px; margin: 0; font-weight: 600;">Action required: Please ensure your payment method is valid to avoid interruption to your membership.</p>
    </div>
    ${ctaButton(`${BASE}/account/membership`, "Manage My Membership")}
  `;
  await resend.emails.send({
    from: FROM,
    to: sub.customerEmail,
    subject: `Payment Failed — ${plan.name} Membership — Asmit Rajaramkar Books`,
    html: wrap("Membership Payment Failed", body),
  });
}

// ─── 4. Subscription Cancelled ───────────────────────────────────────────────
export async function sendSubscriptionCancelled(
  sub: MembershipSubscription,
  plan: MembershipPlan
): Promise<void> {
  const accessUntil = new Date(sub.currentPeriodEnd).toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric",
  });
  const body = `
    <p style="color: #555; font-size: 15px; line-height: 1.8; margin: 0 0 20px;">
      Hello ${sub.customerName},<br/><br/>
      Your <strong>${plan.name}</strong> membership has been cancelled as requested.
      ${sub.cancelAtPeriodEnd
        ? `You will continue to have full access to your membership benefits until <strong>${accessUntil}</strong>.`
        : "Your access has ended."
      }
    </p>
    <p style="color: #555; font-size: 13px;">We hope to see you again. You can reactivate your membership at any time from our membership page.</p>
    ${ctaButton(`${BASE}/membership`, "Explore Membership Plans")}
  `;
  await resend.emails.send({
    from: FROM,
    to: sub.customerEmail,
    subject: `Membership Cancelled — Asmit Rajaramkar Books`,
    html: wrap("Your Membership Has Been Cancelled", body),
  });
}

// ─── 5. Renewal Reminder (3 days before) ─────────────────────────────────────
export async function sendRenewalReminder(
  sub: MembershipSubscription,
  plan: MembershipPlan
): Promise<void> {
  const renewDate = new Date(sub.currentPeriodEnd).toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric",
  });
  const body = `
    <p style="color: #555; font-size: 15px; line-height: 1.8; margin: 0 0 20px;">
      Hello ${sub.customerName},<br/><br/>
      Your <strong>${plan.name}</strong> membership renews on <strong>${renewDate}</strong>. ${formatINR(plan.pricePaise)} will be automatically charged to your saved payment method.
    </p>
    <p style="color: #555; font-size: 13px;">No action is needed. If you wish to change your plan or cancel, please do so before the renewal date.</p>
    ${ctaButton(`${BASE}/account/membership`, "Manage My Membership")}
  `;
  await resend.emails.send({
    from: FROM,
    to: sub.customerEmail,
    subject: `Membership Renews in 3 Days — ${plan.name} — Asmit Rajaramkar Books`,
    html: wrap("Your Membership is Renewing Soon", body),
  });
}

// ─── 6. Plan Upgraded ─────────────────────────────────────────────────────────
export async function sendSubscriptionUpgraded(
  sub: MembershipSubscription,
  oldPlanName: string,
  newPlan: MembershipPlan
): Promise<void> {
  const body = `
    <p style="color: #555; font-size: 15px; line-height: 1.8; margin: 0 0 20px;">
      Hello ${sub.customerName},<br/><br/>
      Your membership has been upgraded from <strong>${oldPlanName}</strong> to <strong>${newPlan.name}</strong>. You now have access to all ${newPlan.name} benefits.
    </p>
    <ul style="color: #555; font-size: 13px; line-height: 2; padding-left: 20px; margin: 0 0 20px;">
      ${newPlan.benefits.map((b) => `<li>${b}</li>`).join("")}
    </ul>
    ${ctaButton(`${BASE}/account/membership/library`, "Explore New Books")}
  `;
  await resend.emails.send({
    from: FROM,
    to: sub.customerEmail,
    subject: `Membership Upgraded to ${newPlan.name} — Asmit Rajaramkar Books`,
    html: wrap(`Welcome to ${newPlan.name} Membership!`, body),
  });
}
