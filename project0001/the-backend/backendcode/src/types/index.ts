export type UserRole = 'admin' | 'client' | 'farmer' | 'sponsor' | 'buyer';
export type BookingStatus = 'pending' | 'paid' | 'confirmed' | 'completed' | 'cancelled';
export type PaymentStatus = 'pending' | 'success' | 'failed';
export type NotificationType = 'booking_confirmation' | 'reminder' | 'payment_receipt';
export type MediaType = 'image' | 'video' | 'document';
export type MediaCategory = 'homepage' | 'project' | 'crop' | 'testimonial' | 'profile' | 'service' | 'gallery' | 'receipt' | 'tip';
export type TipStatus = 'draft' | 'published' | 'archived';

export interface User {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  password_hash?: string;
  role: UserRole;
  profile_media_id?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  duration_mins: number;
  price: number;
  featured_media_id?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Crop {
  id: string;
  name: string;
  description?: string;
  featured_media_id?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  featured_media_id?: string;
  start_date?: Date;
  end_date?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface Booking {
  id: string;
  user_id: string;
  admin_id?: string;
  service_id: string;
  date: Date;
  start_time: string;
  end_time: string;
  status: BookingStatus;
  meeting_link?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Payment {
  id: string;
  booking_id: string;
  amount: number;
  status: PaymentStatus;
  transaction_id?: string;
  receipt_media_id?: string;
  paid_at?: Date;
}

export interface Media {
  id: string;
  public_id: string;
  url: string;
  type: MediaType;
  category?: MediaCategory;
  alt_text?: string;
  description?: string;
  file_size?: number;
  mime_type?: string;
  width?: number;
  height?: number;
  duration?: number;
  uploaded_by?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  message: string;
  sent_at?: Date;
  read: boolean;
}

export interface Tip {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featured_media_id?: string;
  author_id?: string;
  status: TipStatus;
  published_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface Testimonial {
  id: string;
  user_name: string;
  comment: string;
  rating?: number;
  project_id?: string;
  user_media_id?: string;
  created_at: Date;
}

export interface AuthTokenPayload {
  userId: string;
  role: UserRole;
  email?: string;
  phone?: string;
}
export interface CloudinaryUploadResult {
  public_id: string;
  url: string;
  secure_url: string;
  format: string;
  resource_type: string;
  bytes: number;
  width?: number;
  height?: number;
  duration?: number;
  created_at?: string;
  tags?: string[];
  folder?: string;
}

export interface MediaUploadResponse {
  media: Media;
  cloudinary_info?: CloudinaryUploadResult;
}

export interface MediaWithCloudinaryInfo extends Media {
  cloudinary_info?: CloudinaryUploadResult;
}

export interface Membership {
  id: string;
  user_id: string;
  tier: 'free' | 'premium';
  start_date: Date;
  expiry_date?: Date;
  payment_status: 'pending' | 'paid' | 'failed';
  transaction_reference?: string;
  created_at: Date;
  updated_at: Date;
}

export type SponsorApplicationStatus = 'pending' | 'under_review' | 'approved' | 'rejected';
export type SponsorshipStatus = 'pending_payment' | 'active' | 'expired' | 'cancelled';
export type SponsorTier = 'standard' | 'verified' | 'featured' | 'strategic';

export interface SponsorApplication {
  id: string;
  user_id: string;
  company_name: string;
  registration_number?: string;
  tax_pin?: string;
  website?: string;
  contact_email: string;
  phone?: string;
  description: string;
  product_category?: string;
  supporting_documents?: string[];
  status: SponsorApplicationStatus;
  reviewed_by?: string;
  reviewed_at?: Date;
  admin_notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Sponsorship {
  id: string;
  sponsor_id: string;
  package_type?: string;
  tier: SponsorTier;
  start_date: string;
  end_date: string;
  amount: number;
  payment_status: string;
  status: SponsorshipStatus;
  created_at: Date;
}

export interface MarketRequest {
  id: string;
  buyer_id: string;
  crop_type: string;
  quantity: string;
  location: string;
  timeline: string;
  quality_requirements?: string;
  budget_range?: string;
  status: 'open' | 'matched' | 'confirmed' | 'completed';
  created_at: Date;
  updated_at: Date;
}

export interface SupplyOffer {
  id: string;
  request_id: string;
  farmer_id: string;
  quantity: string;
  price: number;
  notes?: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: Date;
}

export interface RevenueLog {
  id: string;
  sponsor_id: string;
  type: 'subscription' | 'commission' | 'ads';
  amount: number;
  transaction_ref?: string;
  created_at: Date;
}

export interface CommissionLog {
  id: string;
  request_id: string;
  farmer_id: string;
  amount: number;
  percentage: number;
  created_at: Date;
}

export type MarketProductStatus = 'upcoming' | 'harvested' | 'in_transit' | 'delivered';
export type MarketAuctionStatus = 'active' | 'ended' | 'won' | 'awaiting_payment' | 'confirmed';

export interface MarketProduct {
  id: string;
  name: string;
  crop_type: string;
  description?: string;
  quantity_available: string;
  price?: number;
  auction_enabled: boolean;
  starting_bid_price?: number;
  auction_end_date?: string;
  harvest_date?: string;
  status: MarketProductStatus;
  is_organic: boolean;
  attributes?: Record<string, any>;
  images?: string[];
  is_published: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface MarketBid {
  id: string;
  product_id: string;
  user_id: string;
  amount: number;
  created_at: Date;
}

export interface MarketOrder {
  id: string;
  product_id?: string;
  user_id: string;
  bid_id?: string;
  order_type: 'direct' | 'auction';
  amount: number;
  payment_status: string;
  delivery_status: MarketProductStatus;
  auction_status?: MarketAuctionStatus;
  shipping_address?: string;
  created_at: Date;
  updated_at: Date;
}
