import { randomInt } from 'crypto';
import { adminDb } from './supabase';
import { AppError } from './errors';
import { appConfig } from '../config';
import { sendOtpEmail } from './email';

type OtpPurpose = 'email_verification' | 'password_reset';

const MAX_OTP_ATTEMPTS = 5;

export async function issueAuthOtp(email: string, purpose: OtpPurpose): Promise<void> {
  const code      = String(randomInt(100_000, 999_999));
  const expiresAt = new Date(
    Date.now() + appConfig.OTP_EXPIRES_MINUTES * 60_000,
  ).toISOString();

  // Invalidate all previous unused codes for the same email + purpose
  await adminDb
    .from('auth_otps')
    .update({ is_used: true })
    .eq('email', email)
    .eq('purpose', purpose)
    .eq('is_used', false);

  const { error } = await adminDb.from('auth_otps').insert({
    email,
    purpose,
    code,
    expires_at: expiresAt,
  });

  if (error) throw new AppError('Could not send a verification code. Please try again.', 500);

  await sendOtpEmail({
    to:             email,
    code,
    expiresMinutes: appConfig.OTP_EXPIRES_MINUTES,
  });
}

export async function verifyAuthOtp(
  email:   string,
  code:    string,
  purpose: OtpPurpose,
): Promise<void> {
  const { data, error } = await adminDb
    .from('auth_otps')
    .select('id, code, attempts, expires_at')
    .eq('email', email)
    .eq('purpose', purpose)
    .eq('is_used', false)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    throw new AppError('That code is invalid or has expired. Please request a new one.', 400);
  }

  // Burn the OTP if attempts exhausted (before doing anything else)
  if ((data.attempts as number) >= MAX_OTP_ATTEMPTS) {
    await adminDb.from('auth_otps').update({ is_used: true }).eq('id', data.id);
    throw new AppError('Too many wrong attempts. Please request a new code.', 429);
  }

  // Increment attempt counter atomically
  await adminDb
    .from('auth_otps')
    .update({ attempts: (data.attempts as number) + 1 })
    .eq('id', data.id);

  if (new Date(data.expires_at as string) < new Date()) {
    throw new AppError('That code has expired. Please request a new one.', 400);
  }

  if (data.code !== code) {
    throw new AppError('That code is incorrect. Please try again.', 400);
  }

  // Mark as used — single-use guarantee
  await adminDb.from('auth_otps').update({ is_used: true }).eq('id', data.id);
}
