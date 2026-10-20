import { adminDb } from './supabase';
import { AppError } from './errors';
import { appConfig } from '../config';
import { sendEmail } from './email';
import { randomInt } from 'crypto';

export function generateOtpCode(): string {
  // Cryptographically random 6-digit OTP
  return String(randomInt(100_000, 999_999));
}

export async function issueOtp(
  invitationId: string,
  contact: string,
  contactType: 'email' | 'phone',
): Promise<void> {
  const code = generateOtpCode();
  const expiresAt = new Date(
    Date.now() + appConfig.OTP_EXPIRES_MINUTES * 60 * 1000,
  ).toISOString();

  // Invalidate any previous unused OTPs for this invitation
  await adminDb
    .from('otp_verifications')
    .update({ is_used: true })
    .eq('invitation_id', invitationId)
    .eq('is_used', false);

  const { error } = await adminDb.from('otp_verifications').insert({
    invitation_id: invitationId,
    contact,
    contact_type: contactType,
    otp_code: code,
    expires_at: expiresAt,
  });

  if (error) throw new AppError('Failed to create OTP.', 500);

  if (contactType === 'email') {
    await sendEmail({
      to: contact,
      subject: 'Your attendance verification code',
      text: `Your verification code is: ${code}\n\nIt expires in ${appConfig.OTP_EXPIRES_MINUTES} minutes.`,
      html: `<p>Your verification code is: <strong style="font-size:1.5rem">${code}</strong></p>
             <p>It expires in ${appConfig.OTP_EXPIRES_MINUTES} minutes.</p>`,
    });
  }
  // SMS would be handled here via a third-party provider (Twilio, Africa's Talking, etc.)
}

export async function verifyOtp(
  invitationId: string,
  code: string,
): Promise<boolean> {
  const { data, error } = await adminDb
    .from('otp_verifications')
    .select('id, otp_code, expires_at, attempts')
    .eq('invitation_id', invitationId)
    .eq('is_used', false)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) return false;

  // Max 5 attempts before the OTP is burned
  if (data.attempts >= 5) {
    await adminDb
      .from('otp_verifications')
      .update({ is_used: true })
      .eq('id', data.id);
    throw new AppError('Too many incorrect attempts. Request a new code.', 429);
  }

  // Increment attempts atomically
  await adminDb
    .from('otp_verifications')
    .update({ attempts: data.attempts + 1 })
    .eq('id', data.id);

  if (new Date(data.expires_at) < new Date()) {
    throw new AppError('Verification code has expired. Request a new one.', 400);
  }

  if (data.otp_code !== code) return false;

  // Mark as used
  await adminDb
    .from('otp_verifications')
    .update({ is_used: true, verified_at: new Date().toISOString() })
    .eq('id', data.id);

  return true;
}
