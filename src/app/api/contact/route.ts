import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);
const FROM = process.env.EMAIL_FROM ?? "AR Books <noreply@arbooks.in>";
const TO   = process.env.CONTACT_EMAIL ?? process.env.SUPPORT_EMAIL ?? "support@asmitrajaramkarbooks.store";

export async function POST(req: NextRequest) {
  const { name, email, subject, message } = await req.json();

  if (!name || !email || !subject || !message) {
    return NextResponse.json({ error: "All fields are required." }, { status: 400 });
  }

  await resend.emails.send({
    from: FROM,
    to: TO,
    replyTo: email,
    subject: `[Contact] ${subject}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:#080808;padding:24px 32px;">
          <h1 style="color:#FFC928;font-size:18px;margin:0;letter-spacing:2px;">AR BOOKS — Contact Form</h1>
        </div>
        <div style="padding:32px;background:#FAF9F6;border:1px solid #E9E7E2;">
          <p style="margin:0 0 8px;font-size:13px;color:#999;text-transform:uppercase;letter-spacing:1px;">From</p>
          <p style="margin:0 0 20px;font-size:15px;color:#080808;">${name} &lt;${email}&gt;</p>
          <p style="margin:0 0 8px;font-size:13px;color:#999;text-transform:uppercase;letter-spacing:1px;">Subject</p>
          <p style="margin:0 0 20px;font-size:15px;color:#080808;">${subject}</p>
          <p style="margin:0 0 8px;font-size:13px;color:#999;text-transform:uppercase;letter-spacing:1px;">Message</p>
          <p style="margin:0;font-size:15px;color:#080808;line-height:1.7;white-space:pre-wrap;">${message}</p>
        </div>
      </div>
    `,
  });

  return NextResponse.json({ ok: true });
}
