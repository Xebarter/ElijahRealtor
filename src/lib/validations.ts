import { z } from 'zod';

// Property validation schema
export const propertySchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.number().min(1, 'Price must be greater than 0'),
  currency: z.string().min(1, 'Currency is required'),
  property_type: z.enum(['apartment', 'house', 'commercial']),
  status: z.enum(['available', 'sold', 'pending']),
  location: z.string().min(3, 'Location is required'),
  city: z.string().min(2, 'City is required'),
  country: z.string().min(2, 'Country is required'),
  size_sqft: z.number().min(1).optional(),
  bedrooms: z.number().min(0).optional(),
  bathrooms: z.number().min(0).optional(),
  amenities: z.array(z.string()),
  featured: z.boolean(),
  video_tour_url: z.string().url().optional().or(z.literal('')),
  location_url: z.string().url().optional().or(z.literal('')),
  location_coordinates: z.object({
    lat: z.number(),
    lng: z.number()
  }).optional(),
  developer_id: z.string().optional(),
});

// Visit booking validation schema
export const visitBookingSchema = z.object({
  property_id: z.string().min(1, 'Property is required'),
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  preferred_time: z.string().min(1, 'Visit date and time is required'),
  message: z.string().optional(),
});

// Financing application validation schema
export const financingSchema = z.object({
  property_id: z.string().min(1, 'Property is required'),
  applicant_name: z.string().min(2, 'Name is required'),
  applicant_email: z.string().email('Valid email is required'),
  applicant_phone: z.string().min(10, 'Valid phone number is required'),
  monthly_income: z.number().min(1, 'Monthly income is required'),
  currency: z.string().min(1, 'Currency is required'),
  employment_status: z.string().min(2, 'Employment status is required'),
  id_document: z.any().optional(),
  income_proof: z.any().optional(),
});

// Contact form validation schema
export const contactSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  country: z.string().min(2, 'Country is required'),
  subject: z.string().min(5, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

// Developer validation schema
export const developerSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  bio: z.string().optional(),
  contact_email: z.string().email().optional().or(z.literal('')),
  contact_phone: z.string().optional(),
  website_url: z.string().url().optional().or(z.literal('')),
});

// Blog post validation schema
export const blogPostSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  slug: z.string().min(3, 'Slug is required'),
  content: z.string().min(10, 'Content is required'),
  excerpt: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()),
  published: z.boolean(),
  seo_title: z.string().optional(),
  seo_description: z.string().optional(),
});

// Testimonial validation schema
export const testimonialSchema = z.object({
  client_name: z.string().min(2, 'Name is required'),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  rating: z.number().min(1).max(5),
  video_url: z.string().url().optional().or(z.literal('')),
});

// Login validation schema
export const loginSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

// Property filters validation schema
export const propertyFiltersSchema = z.object({
  search: z.string().optional(),
  property_type: z.enum(['apartment', 'house', 'commercial']).optional(),
  min_price: z.number().min(0).optional(),
  max_price: z.number().min(0).optional(),
  location: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  bedrooms: z.number().min(0).optional(),
  bathrooms: z.number().min(0).optional(),
  featured: z.boolean().optional(),
  developer_id: z.string().optional(),
});