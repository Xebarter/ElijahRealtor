// Database types
export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string; // USD, KES, UGX, TZS, etc.
  property_type: 'apartment' | 'house' | 'commercial';
  status: 'available' | 'sold' | 'pending';
  location: string;
  city: string;
  country: string;
  size_sqft?: number;
  bedrooms?: number;
  bathrooms?: number;
  amenities: string[];
  featured: boolean;
  video_url?: string; // Legacy field
  video_tour_url?: string; // New video tour field
  location_coordinates?: { lat: number; lng: number };
  location_url?: string;
  developer_id?: string;
  images: string[]; // Legacy field
  created_at: string;
  updated_at: string;
  developer?: Developer;
  property_images?: PropertyImage[];
}

export interface PropertyImage {
  id: string;
  property_id: string;
  feature_type: string;
  image_url: string;
  storage_path: string;
  display_order: number;
  alt_text?: string;
  created_at: string;
}

export interface Developer {
  id: string;
  name: string;
  logo_url?: string;
  bio?: string;
  contact_email?: string;
  contact_phone?: string;
  website_url?: string;
  countries: string[]; // Countries where developer operates
  created_at: string;
}

export interface Visit {
  id: string;
  property_id: string;
  name: string;
  email: string;
  phone: string;
  preferred_time: string;
  message?: string;
  payment_status: 'pending' | 'paid';
  transaction_id?: string;
  paid_at?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  admin_notes?: string;
  created_at: string;
  property?: Property;
}

export interface VisitBooking {
  id: string;
  property_id: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  visit_date: string;
  visit_time: string;
  status: 'pending' | 'confirmed' | 'paid' | 'cancelled';
  payment_reference?: string;
  payment_amount?: number;
  currency?: string;
  notes?: string;
  created_at: string;
  property?: Property;
}

export interface FinancingApplication {
  id: string;
  property_id: string;
  applicant_name: string;
  applicant_email: string;
  applicant_phone: string;
  monthly_income?: number;
  currency?: string;
  employment_status?: string;
  id_document_url?: string;
  income_proof_url?: string;
  status: 'received' | 'forwarded' | 'approved' | 'rejected';
  notes?: string;
  created_at: string;
  property?: Property;
}

export interface Testimonial {
  id: string;
  client_name: string;
  client_title?: string;
  client_image_url?: string;
  content: string;
  media_urls?: string[];
  type: 'text' | 'image' | 'video';
  rating: number;
  country?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featured_image_url?: string;
  category?: string;
  tags: string[];
  published: boolean;
  seo_title?: string;
  seo_description?: string;
  created_at: string;
  updated_at: string;
}

export interface SiteSetting {
  id: string;
  key: string;
  value: string;
  updated_at: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'replied';
  created_at: string;
}

// Form types
export interface PropertyForm {
  title: string;
  description: string;
  price: number;
  currency: string;
  property_type: 'apartment' | 'house' | 'commercial';
  status: 'available' | 'sold' | 'pending';
  location: string;
  city: string;
  country: string;
  size_sqft?: number;
  bedrooms?: number;
  bathrooms?: number;
  amenities: string[];
  featured: boolean;
  video_tour_url?: string;
  location_coordinates?: { lat: number; lng: number };
  location_url?: string;
  developer_id?: string;
}

export interface VisitBookingForm {
  property_id: string;
  name: string;
  email: string;
  phone: string;
  preferred_time: string;
  message?: string;
}

export interface FinancingForm {
  property_id: string;
  applicant_name: string;
  applicant_email: string;
  applicant_phone: string;
  monthly_income: number;
  currency: string;
  employment_status: string;
  id_document: File;
  income_proof: File;
}

export interface ContactForm {
  name: string;
  email: string;
  phone: string;
  country: string;
  subject: string;
  message: string;
}

export interface TestimonialForm {
  client_name: string;
  client_title?: string;
  content: string;
  rating: number;
  country?: string;
  type: 'text' | 'image' | 'video';
  media_files?: File[];
}

// UI types
export interface PropertyFilters {
  search?: string;
  property_type?: string;
  min_price?: number;
  max_price?: number;
  location?: string;
  city?: string;
  country?: string;
  bedrooms?: number;
  bathrooms?: number;
  featured?: boolean;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  data: T;
  meta?: PaginationMeta;
  error?: string;
}

// Auth types
export interface User {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
}

// Payment types
export interface PaymentData {
  amount: number;
  currency: string;
  reference: string;
  description: string;
  callback_url: string;
  notification_id: string;
}

export interface PaymentResponse {
  status: 'success' | 'failed' | 'pending';
  transaction_id?: string;
  payment_url?: string;
  message?: string;
}

// Country and Currency types
export interface Country {
  code: string;
  name: string;
  currency: string;
  flag: string;
}

export interface Currency {
  code: string;
  name: string;
  symbol: string;
}

// Dashboard Analytics
export interface DashboardStats {
  totalProperties: number;
  activeListings: number;
  soldProperties: number;
  pendingBookings: number;
  financingApplications: number;
  monthlyRevenue: number;
  conversionRate: number;
  propertiesByCountry: { country: string; count: number }[];
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  type: 'property_added' | 'booking_created' | 'application_submitted' | 'property_sold' | 'contact_received';
  description: string;
  timestamp: string;
  country?: string;
}

// Property Feature Types
export const PROPERTY_FEATURES = [
  { value: 'exterior', label: 'Exterior' },
  { value: 'living_room', label: 'Living Room' },
  { value: 'kitchen', label: 'Kitchen' },
  { value: 'master_bedroom', label: 'Master Bedroom' },
  { value: 'bedroom', label: 'Bedroom' },
  { value: 'bathroom', label: 'Bathroom' },
  { value: 'dining_room', label: 'Dining Room' },
  { value: 'balcony', label: 'Balcony' },
  { value: 'garden', label: 'Garden' },
  { value: 'garage', label: 'Garage' },
  { value: 'pool', label: 'Swimming Pool' },
  { value: 'gym', label: 'Gym' },
  { value: 'office', label: 'Office/Study' },
  { value: 'laundry', label: 'Laundry Room' },
  { value: 'storage', label: 'Storage' },
  { value: 'other', label: 'Other' }
] as const;

export type PropertyFeatureType = typeof PROPERTY_FEATURES[number]['value'];

// Media Upload Types
export interface MediaUploadProgress {
  feature: string;
  fileName: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
}

export interface FeatureImageGroup {
  feature: PropertyFeatureType;
  images: PropertyImage[];
}