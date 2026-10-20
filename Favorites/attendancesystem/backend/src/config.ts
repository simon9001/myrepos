import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  HOST: z.string().default('0.0.0.0'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Supabase
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  SUPABASE_ANON_KEY: z.string().min(1),

  // JWT — tokens issued by this backend
  JWT_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES_IN: z.string().default('24h'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),

  // Primary frontend URL — used when generating invite links, QR codes, etc.
  APP_URL: z.string().url().default('http://localhost:5173'),

  // Comma-separated list of allowed CORS origins. Defaults to APP_URL.
  // Add extra origins here (e.g. staging URL) without changing APP_URL.
  CORS_ORIGINS: z.string().optional(),

  // Resend
  RESEND_API_KEY: z.string().min(1),
  EMAIL_FROM: z.string().email(),
  EMAIL_FROM_NAME: z.string().default('AttendTrack'),

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: z.string().min(1),
  CLOUDINARY_API_KEY: z.string().min(1),
  CLOUDINARY_API_SECRET: z.string().min(1),
  CLOUDINARY_FOLDER: z.string().default('attendance-platform'),

  // Supabase Storage buckets (templates & docs only)
  DOCUMENT_BUCKET: z.string().default('documents'),
  TEMPLATE_BUCKET: z.string().default('templates'),

  OTP_EXPIRES_MINUTES: z.coerce.number().default(10),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:');
  console.error(JSON.stringify(parsed.error.flatten().fieldErrors, null, 2));
  process.exit(1);
}

export const appConfig = parsed.data;
