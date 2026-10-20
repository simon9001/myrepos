import { Resend } from 'resend';
import { appConfig } from '../config';

const resend = new Resend(appConfig.RESEND_API_KEY);

const FROM = `${appConfig.EMAIL_FROM_NAME} <${appConfig.EMAIL_FROM}>`;

// ─── Base send ────────────────────────────────────────────────────────────────

interface EmailPayload {
  to: string | string[];
  subject: string;
  text: string;
  html?: string;
}

export async function sendEmail(payload: EmailPayload): Promise<void> {
  const to = Array.isArray(payload.to) ? payload.to : [payload.to];

  const { error } = await resend.emails.send({
    from:    FROM,
    to,
    subject: payload.subject,
    text:    payload.text,
    html:    payload.html ?? payload.text,
  });

  if (error) {
    console.error('[resend] Send failed:', error);
    throw new Error(`Email delivery failed: ${error.message}`);
  }
}

// ─── Invitation email ─────────────────────────────────────────────────────────

export async function sendInvitationEmail(opts: {
  to: string;
  recipientName: string;
  orgName: string;
  eventTitle: string;
  eventDate: string;
  attendanceUrl: string;
}): Promise<void> {
  await sendEmail({
    to:      opts.to,
    subject: `You are invited: ${opts.eventTitle}`,
    text: [
      `Dear ${opts.recipientName},`,
      ``,
      `You have been invited to sign attendance for:`,
      `${opts.eventTitle} — ${opts.eventDate}`,
      ``,
      `Sign here: ${opts.attendanceUrl}`,
      ``,
      `Regards,`,
      opts.orgName,
    ].join('\n'),
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
        <p>Dear <strong>${opts.recipientName}</strong>,</p>
        <p>You have been invited to sign attendance for:</p>
        <h2 style="color:#1E3A5F;margin:8px 0">${opts.eventTitle}</h2>
        <p style="color:#555"><strong>Date:</strong> ${opts.eventDate}</p>
        <p style="margin-top:24px">
          <a href="${opts.attendanceUrl}"
             style="background:#1E3A5F;color:#fff;padding:12px 28px;border-radius:6px;
                    text-decoration:none;font-weight:600;display:inline-block">
            Sign Attendance
          </a>
        </p>
        <hr style="margin-top:40px;border:none;border-top:1px solid #eee"/>
        <p style="color:#aaa;font-size:12px">${opts.orgName} · Powered by ${appConfig.EMAIL_FROM_NAME}</p>
      </div>`,
  });
}

// ─── Reminder email ───────────────────────────────────────────────────────────

export async function sendReminderEmail(opts: {
  to: string;
  recipientName: string;
  orgName: string;
  eventTitle: string;
  attendanceUrl: string;
}): Promise<void> {
  await sendEmail({
    to:      opts.to,
    subject: `Reminder: Sign attendance for ${opts.eventTitle}`,
    text: [
      `Hello ${opts.recipientName},`,
      ``,
      `Attendance for "${opts.eventTitle}" is still open.`,
      `Please sign here: ${opts.attendanceUrl}`,
      ``,
      opts.orgName,
    ].join('\n'),
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
        <p>Hello <strong>${opts.recipientName}</strong>,</p>
        <p>This is a reminder — attendance for <strong>${opts.eventTitle}</strong> is still open.</p>
        <p style="margin-top:24px">
          <a href="${opts.attendanceUrl}"
             style="background:#F0A500;color:#fff;padding:12px 28px;border-radius:6px;
                    text-decoration:none;font-weight:600;display:inline-block">
            Sign Attendance Now
          </a>
        </p>
        <hr style="margin-top:40px;border:none;border-top:1px solid #eee"/>
        <p style="color:#aaa;font-size:12px">${opts.orgName} · Powered by ${appConfig.EMAIL_FROM_NAME}</p>
      </div>`,
  });
}

// ─── OTP email ────────────────────────────────────────────────────────────────

export async function sendOtpEmail(opts: {
  to: string;
  code: string;
  expiresMinutes: number;
}): Promise<void> {
  await sendEmail({
    to:      opts.to,
    subject: `${opts.code} is your ${appConfig.EMAIL_FROM_NAME} verification code`,
    text:    `Your verification code is: ${opts.code}\n\nExpires in ${opts.expiresMinutes} minutes.`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;text-align:center">
        <h2 style="color:#1E3A5F">Verification Code</h2>
        <p style="color:#555;margin-bottom:24px">Use the code below to verify your identity.</p>
        <div style="background:#f4f7ff;border-radius:12px;padding:24px;display:inline-block">
          <span style="font-size:2.5rem;font-weight:700;letter-spacing:12px;color:#1E3A5F">
            ${opts.code}
          </span>
        </div>
        <p style="color:#aaa;font-size:13px;margin-top:20px">
          Expires in ${opts.expiresMinutes} minutes. Do not share this code.
        </p>
      </div>`,
  });
}

// ─── Password reset email ─────────────────────────────────────────────────────

export async function sendPasswordResetEmail(opts: {
  to: string;
  name: string;
  resetUrl: string;
}): Promise<void> {
  await sendEmail({
    to:      opts.to,
    subject: `Reset your ${appConfig.EMAIL_FROM_NAME} password`,
    text:    `Hi ${opts.name},\n\nReset your password here:\n${opts.resetUrl}\n\nThis link expires in 1 hour.`,
    html: `
      <div style="font-family:sans-serif;max-width:540px;margin:0 auto;padding:32px">
        <h2 style="color:#1E3A5F">Reset your password</h2>
        <p>Hi <strong>${opts.name}</strong>,</p>
        <p>We received a request to reset your password. Click the button below to continue.</p>
        <p style="margin-top:24px">
          <a href="${opts.resetUrl}"
             style="background:#1E3A5F;color:#fff;padding:12px 28px;border-radius:6px;
                    text-decoration:none;font-weight:600;display:inline-block">
            Reset Password
          </a>
        </p>
        <p style="color:#aaa;font-size:12px;margin-top:24px">
          This link expires in 1 hour. If you didn't request a reset, ignore this email.
        </p>
      </div>`,
  });
}
