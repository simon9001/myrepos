import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2).max(255),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  password: z.string().min(6),
  role: z.enum(['admin', 'client', 'farmer', 'sponsor', 'buyer']).default('client'),
});

export const loginSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().optional(),
  password: z.string().min(6),
}).refine((data: any) => data.email || data.phone, {
  message: 'Either email or phone must be provided',
});

// Helper for optional UUIDs that might be empty strings from forms
const optionalUuid = z.preprocess(
  (val) => (val === '' ? undefined : val),
  z.string().uuid().optional()
);

export const serviceSchema = z.object({
  name: z.string().min(2).max(255),
  description: z.string().optional(),
  duration_mins: z.number().int().positive(),
  price: z.number().positive(),
  featured_media_id: optionalUuid,
  crops: z.array(z.string().uuid()).optional(),
});

export const bookingSchema = z.object({
  service_id: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  start_time: z.string().regex(/^\d{2}:\d{2}$/),
  user_notes: z.string().optional(),
  payment_phone: z.string().regex(/^(?:254|\+254|0)?(7|1)\d{8}$/, 'Invalid M-Pesa number'),
});

export const cropSchema = z.object({
  name: z.string().min(2).max(255),
  scientific_name: z.string().optional(),
  category: z.string().optional(),
  growing_season: z.string().optional(),
  description: z.string().optional(),
  featured_media_id: optionalUuid,
  media_ids: z.array(z.string().uuid()).optional(),
});

export const projectSchema = z.object({
  name: z.string().min(2).max(255),
  description: z.string().optional(),
  featured_media_id: optionalUuid,
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  status: z.string().optional(),
  media_ids: z.array(z.string().uuid()).optional(),
});

export const testimonialSchema = z.object({
  user_name: z.string().min(2).max(255),
  comment: z.string().min(10),
  rating: z.number().int().min(1).max(5).optional(),
  project_id: optionalUuid,
  user_media_id: optionalUuid,
});

export const tipSchema = z.object({
  title: z.string().min(2).max(255),
  slug: z.string().min(2).max(255).regex(/^[a-z0-9-]+$/),
  content: z.string().min(10),
  excerpt: z.string().optional(),
  featured_media_id: optionalUuid,
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  published_at: z.string().datetime().nullable().optional(),
});

export const mediaSchema = z.object({
  public_id: z.string().min(1),
  url: z.string().url(),
  type: z.enum(['image', 'video', 'document']),
  category: z.enum(['homepage', 'project', 'crop', 'testimonial', 'profile', 'service', 'gallery', 'receipt', 'tip']).optional(),
  alt_text: z.string().optional(),
  description: z.string().optional(),
  file_size: z.number().int().positive().optional(),
  mime_type: z.string().optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  duration: z.number().int().positive().optional(),
});

export const availabilitySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  start_time: z.string().regex(/^\d{2}:\d{2}$/),
  end_time: z.string().regex(/^\d{2}:\d{2}$/),
  is_available: z.boolean().default(true),
});

export const membershipSchema = z.object({
  tier: z.enum(['free', 'premium']),
  payment_phone: z.string().regex(/^(?:254|\+254|0)?(7|1)\d{8}$/, 'Invalid M-Pesa number').optional(),
});

export const sponsorApplicationSchema = z.object({
  company_name: z.string().min(2).max(255),
  registration_number: z.string().optional(),
  tax_pin: z.string().optional(),
  website: z.string().url().optional(),
  contact_email: z.string().email(),
  phone: z.string().optional(),
  description: z.string().min(10),
  product_category: z.string().optional(),
  supporting_documents: z.array(z.string().uuid()).optional(),
});

export const sponsorshipSchema = z.object({
  sponsor_id: z.string().uuid(),
  package_type: z.enum(['banner', 'featured_listing', 'newsletter', 'premium_visibility']),
  tier: z.enum(['standard', 'verified', 'featured', 'strategic']).default('standard'),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  amount: z.number().positive(),
});

export const marketRequestSchema = z.object({
  crop_type: z.string().min(2),
  quantity: z.string().min(1),
  location: z.string().min(2),
  timeline: z.string().min(2),
  quality_requirements: z.string().optional(),
  budget_range: z.string().optional(),
});

export const supplyOfferSchema = z.object({
  quantity: z.string().min(1),
  price: z.number().positive(),
  notes: z.string().optional(),
});

export const marketProductSchema = z.object({
  name: z.string().min(2).max(255),
  crop_type: z.string().min(1).max(100),
  description: z.string().optional(),
  quantity_available: z.string().min(1),
  price: z.number().positive().optional(),
  auction_enabled: z.boolean().default(false),
  starting_bid_price: z.number().positive().optional(),
  auction_end_date: z.string().datetime().optional(),
  harvest_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  status: z.enum(['upcoming', 'harvested', 'in_transit', 'delivered']).default('upcoming'),
  is_organic: z.boolean().default(false),
  attributes: z.record(z.string(), z.any()).optional(),
  images: z.array(z.string().uuid()).optional(),
  is_published: z.boolean().default(false),
});

export const bidSchema = z.object({
  amount: z.number().positive(),
});

export const marketPurchaseSchema = z.object({
  product_id: z.string().uuid(),
  shipping_address: z.string().min(5),
  quantity: z.string().optional(),
});
