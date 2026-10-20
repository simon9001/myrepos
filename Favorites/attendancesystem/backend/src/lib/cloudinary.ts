import { v2 as cloudinary } from 'cloudinary';
import type { UploadApiOptions, UploadApiResponse } from 'cloudinary';
import { appConfig } from '../config';
import { AppError } from './errors';

// Configure once at module load — safe across cluster workers (each worker
// has its own process, so there is no shared state).
cloudinary.config({
  cloud_name: appConfig.CLOUDINARY_CLOUD_NAME,
  api_key:    appConfig.CLOUDINARY_API_KEY,
  api_secret: appConfig.CLOUDINARY_API_SECRET,
  secure:     true,
});

// ─── Upload a base64 data URL (signatures, photos) ───────────────────────────
// Cloudinary accepts `data:<mime>;base64,<data>` strings directly.

export async function uploadDataUrl(
  dataUrl: string,
  options: UploadApiOptions,
): Promise<UploadApiResponse> {
  // Validate MIME and size before hitting the network
  const match = dataUrl.match(/^data:([a-z]+\/[a-z+.-]+);base64,(.+)$/i);
  if (!match) throw new AppError('The image you uploaded is not valid. Please try again.', 400);

  const allowedMimes = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp'];
  if (!allowedMimes.includes(match[1])) {
    throw new AppError('This image type is not supported. Please use PNG or JPEG.', 400);
  }

  const sizeBytes = Math.ceil((match[2].length * 3) / 4);
  if (sizeBytes > 5 * 1024 * 1024) {
    throw new AppError('The image is too large. Maximum allowed size is 5 MB.', 413);
  }

  try {
    return await cloudinary.uploader.upload(dataUrl, {
      resource_type: 'image',
      overwrite:     false,
      ...options,
    });
  } catch (err) {
    throw new AppError('We could not upload your image. Please try again.', 500);
  }
}

// ─── Upload a raw Buffer (QR code PNG) ───────────────────────────────────────

export async function uploadBuffer(
  buffer: Buffer,
  options: UploadApiOptions,
): Promise<UploadApiResponse> {
  return new Promise<UploadApiResponse>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: 'image', ...options },
      (error, result) => {
        if (error || !result) {
          reject(new AppError('We could not upload your image. Please try again.', 500));
        } else {
          resolve(result);
        }
      },
    );
    stream.end(buffer);
  });
}

// ─── Delete an asset by public_id ────────────────────────────────────────────

export async function deleteAsset(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
}

export { cloudinary };
