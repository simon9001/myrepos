import { adminDb } from './supabase';
import { AppError } from './errors';
import { appConfig } from '../config';
import { uploadDataUrl } from './cloudinary';

// ─── Signatures → Cloudinary ──────────────────────────────────────────────────
// Stored under: {folder}/signatures/{orgId}/{eventId}/{recordId}
// Returns the Cloudinary secure_url (CDN URL).

export async function uploadSignature(opts: {
  orgId: string;
  eventId: string;
  recordId: string;
  dataUrl: string;
}): Promise<string> {
  const folder   = `${appConfig.CLOUDINARY_FOLDER}/signatures/${opts.orgId}/${opts.eventId}`;
  const publicId = opts.recordId;

  const result = await uploadDataUrl(opts.dataUrl, {
    folder,
    public_id:     publicId,
    // Preserve exact pixel data — no lossy compression on legal signatures
    quality:       'auto:best',
    // Allow SVG in addition to raster formats
    resource_type: 'image',
  });

  return result.secure_url;
}

// ─── Attendance photos → Cloudinary ──────────────────────────────────────────
// Stored under: {folder}/photos/{orgId}/{eventId}/{recordId}

export async function uploadPhoto(opts: {
  orgId: string;
  eventId: string;
  recordId: string;
  dataUrl: string;
}): Promise<string> {
  const folder   = `${appConfig.CLOUDINARY_FOLDER}/photos/${opts.orgId}/${opts.eventId}`;
  const publicId = opts.recordId;

  const result = await uploadDataUrl(opts.dataUrl, {
    folder,
    public_id: publicId,
    quality:   'auto',
    fetch_format: 'auto',
  });

  return result.secure_url;
}

// ─── Generated documents (PDF / DOCX) → Supabase Storage ─────────────────────
// Cloudinary is optimised for images; binary office files stay in Supabase Storage.

export async function uploadDocument(opts: {
  orgId: string;
  meetingId: string;
  filename: string;
  buffer: Buffer;
  mimeType: string;
}): Promise<string> {
  const path = `${opts.orgId}/${opts.meetingId}/${opts.filename}`;

  const { error } = await adminDb.storage
    .from(appConfig.DOCUMENT_BUCKET)
    .upload(path, opts.buffer, { contentType: opts.mimeType, upsert: true });

  if (error) throw new AppError('Failed to store document.', 500);

  const { data } = adminDb.storage
    .from(appConfig.DOCUMENT_BUCKET)
    .getPublicUrl(path);

  return data.publicUrl;
}

// ─── Word templates → Supabase Storage (download for docxtemplater) ──────────

export async function downloadTemplate(fileUrl: string): Promise<Buffer> {
  const url = new URL(fileUrl);
  const pathParts = url.pathname.split(`/object/public/${appConfig.TEMPLATE_BUCKET}/`);
  if (pathParts.length < 2) throw new AppError('Invalid template URL.', 400);

  const { data, error } = await adminDb.storage
    .from(appConfig.TEMPLATE_BUCKET)
    .download(pathParts[1]);

  if (error || !data) throw new AppError('Failed to load template file.', 500);
  return Buffer.from(await data.arrayBuffer());
}

// ─── Template uploads → Supabase Storage ─────────────────────────────────────

export async function uploadTemplateFile(opts: {
  orgId: string;
  filename: string;
  buffer: Buffer;
  mimeType: string;
}): Promise<string> {
  const path = `${opts.orgId}/${Date.now()}_${opts.filename}`;

  const { error } = await adminDb.storage
    .from(appConfig.TEMPLATE_BUCKET)
    .upload(path, opts.buffer, { contentType: opts.mimeType, upsert: false });

  if (error) throw new AppError('Failed to upload template file.', 500);

  const { data } = adminDb.storage
    .from(appConfig.TEMPLATE_BUCKET)
    .getPublicUrl(path);

  return data.publicUrl;
}
