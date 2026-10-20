import QRCode from 'qrcode';
import { adminDb } from './supabase';
import { AppError } from './errors';
import { appConfig } from '../config';
import { uploadBuffer } from './cloudinary';
import { randomBytes } from 'crypto';

// ─── Generate QR PNG buffer ───────────────────────────────────────────────────

export async function generateQrBuffer(url: string): Promise<Buffer> {
  return QRCode.toBuffer(url, {
    type: 'png',
    width: 400,
    margin: 2,
    errorCorrectionLevel: 'M',
    color: { dark: '#1E3A5F', light: '#FFFFFF' },
  });
}

// ─── Upload QR buffer to Cloudinary and return secure_url ────────────────────

async function uploadQrToCloudinary(opts: {
  orgId: string;
  subfolder: string;
  code: string;
  buffer: Buffer;
}): Promise<string> {
  const folder   = `${appConfig.CLOUDINARY_FOLDER}/qr/${opts.orgId}/${opts.subfolder}`;
  const publicId = opts.code;

  const result = await uploadBuffer(opts.buffer, {
    folder,
    public_id:     publicId,
    resource_type: 'image',
    overwrite:     true,
  });

  return result.secure_url;
}

// ─── Create QR code for a meeting ────────────────────────────────────────────

export async function createMeetingQr(opts: {
  orgId: string;
  meetingId: string;
  expiresAt: string | null;
}): Promise<{ code: string; qrImageUrl: string }> {
  const code          = randomBytes(24).toString('hex');
  const attendanceUrl = `${appConfig.APP_URL}/attend/qr/${code}`;
  const buffer        = await generateQrBuffer(attendanceUrl);

  const qrImageUrl = await uploadQrToCloudinary({
    orgId:     opts.orgId,
    subfolder: opts.meetingId,
    code,
    buffer,
  });

  // Deactivate any previously active QR for this meeting
  await adminDb
    .from('qr_codes')
    .update({ is_active: false })
    .eq('meeting_id', opts.meetingId)
    .eq('is_active', true);

  const { error } = await adminDb.from('qr_codes').insert({
    organization_id: opts.orgId,
    meeting_id:      opts.meetingId,
    code,
    qr_image_url:    qrImageUrl,
    is_active:       true,
    expires_at:      opts.expiresAt,
  });

  if (error) throw new AppError('Failed to create QR code record.', 500);

  return { code, qrImageUrl };
}

// ─── Create QR code for a training session ───────────────────────────────────

export async function createSessionQr(opts: {
  orgId: string;
  sessionId: string;
  expiresAt: string | null;
}): Promise<{ code: string; qrImageUrl: string }> {
  const code          = randomBytes(24).toString('hex');
  const attendanceUrl = `${appConfig.APP_URL}/attend/qr/${code}`;
  const buffer        = await generateQrBuffer(attendanceUrl);

  const qrImageUrl = await uploadQrToCloudinary({
    orgId:     opts.orgId,
    subfolder: `sessions/${opts.sessionId}`,
    code,
    buffer,
  });

  await adminDb
    .from('qr_codes')
    .update({ is_active: false })
    .eq('training_session_id', opts.sessionId)
    .eq('is_active', true);

  const { error } = await adminDb.from('qr_codes').insert({
    organization_id:     opts.orgId,
    training_session_id: opts.sessionId,
    code,
    qr_image_url:        qrImageUrl,
    is_active:           true,
    expires_at:          opts.expiresAt,
  });

  if (error) throw new AppError('Failed to create QR code record.', 500);

  return { code, qrImageUrl };
}

// ─── Resolve a QR code to its event ──────────────────────────────────────────

export async function resolveQrCode(code: string): Promise<{
  type: 'meeting' | 'session';
  id: string;
  organizationId: string;
}> {
  const { data, error } = await adminDb
    .from('qr_codes')
    .select('meeting_id, training_session_id, organization_id, is_active, expires_at')
    .eq('code', code)
    .single();

  if (error || !data) throw new AppError('QR code not found.', 404);
  if (!data.is_active) throw new AppError('This QR code has expired.', 410);

  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    await adminDb.from('qr_codes').update({ is_active: false }).eq('code', code);
    throw new AppError('This QR code has expired.', 410);
  }

  // Atomic scan count increment via DB function
  await adminDb.rpc('increment_qr_scan_count', { qr_code: code });

  if (data.meeting_id) {
    return { type: 'meeting', id: data.meeting_id, organizationId: data.organization_id };
  }
  return { type: 'session', id: data.training_session_id!, organizationId: data.organization_id };
}
