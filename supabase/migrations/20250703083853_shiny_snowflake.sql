/*
  # Create comprehensive testimonials system

  1. New Tables
    - `testimonials` - Store testimonial submissions
      - `id` (uuid, primary key)
      - `client_name` (text, submitter name)
      - `client_title` (text, optional title/role)
      - `content` (text, testimonial message)
      - `media_urls` (jsonb, array of media URLs)
      - `type` (text, testimonial type: text/image/video)
      - `rating` (integer, 1-5 star rating)
      - `country` (text, client location)
      - `status` (text, pending/approved/rejected)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on testimonials table
    - Public can submit testimonials
    - Only authenticated users (admin) can approve/manage
    - Public can read approved testimonials

  3. Storage
    - Create testimonials bucket for media uploads
    - Set up proper RLS policies for secure access
*/

-- Update existing testimonials table structure
ALTER TABLE testimonials 
ADD COLUMN IF NOT EXISTS client_title text,
ADD COLUMN IF NOT EXISTS media_urls jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS type text DEFAULT 'text' CHECK (type IN ('text', 'image', 'video'));

-- Update status column to use proper values
ALTER TABLE testimonials 
DROP CONSTRAINT IF EXISTS testimonials_status_check;

ALTER TABLE testimonials 
ADD CONSTRAINT testimonials_status_check 
CHECK (status IN ('pending', 'approved', 'rejected'));

-- Update default status
ALTER TABLE testimonials 
ALTER COLUMN status SET DEFAULT 'pending';

-- Create storage bucket for testimonial media
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('testimonial-media', 'testimonial-media', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for testimonial media
CREATE POLICY "Public can view testimonial media" 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'testimonial-media');

CREATE POLICY "Anyone can upload testimonial media" 
  ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'testimonial-media');

CREATE POLICY "Authenticated users can manage testimonial media" 
  ON storage.objects FOR ALL 
  TO authenticated 
  USING (bucket_id = 'testimonial-media');

-- Update RLS policies for testimonials
DROP POLICY IF EXISTS "Public can read approved testimonials" ON testimonials;
DROP POLICY IF EXISTS "Anyone can create testimonials" ON testimonials;
DROP POLICY IF EXISTS "Authenticated users can manage testimonials" ON testimonials;

CREATE POLICY "Public can read approved testimonials" 
  ON testimonials FOR SELECT 
  TO anon, authenticated 
  USING (status = 'approved' OR auth.role() = 'authenticated');

CREATE POLICY "Anyone can create testimonials" 
  ON testimonials FOR INSERT 
  TO anon, authenticated 
  WITH CHECK (true);

CREATE POLICY "Authenticated users can manage testimonials" 
  ON testimonials FOR ALL 
  TO authenticated 
  USING (true);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS testimonials_type_idx ON testimonials(type);
CREATE INDEX IF NOT EXISTS testimonials_country_idx ON testimonials(country);

-- Insert sample approved testimonials
INSERT INTO testimonials (id, client_name, client_title, content, rating, country, status, type, media_urls) VALUES
  ('550e8400-e29b-41d4-a716-446655440025', 'Sarah Johnson', 'Property Investor', 'ElijahRealtor helped me find my dream home in Nairobi. Their service was exceptional and the process was smooth from start to finish. The team was professional and always available to answer my questions.', 5, 'Kenya', 'approved', 'text', '[]'::jsonb),
  ('550e8400-e29b-41d4-a716-446655440026', 'Michael Chen', 'Business Owner', 'Professional, reliable, and knowledgeable. I would definitely recommend ElijahRealtor to anyone looking for property in East Africa. They found me the perfect office space for my business.', 5, 'Uganda', 'approved', 'text', '[]'::jsonb),
  ('550e8400-e29b-41d4-a716-446655440027', 'Emma Williams', 'First-time Buyer', 'Great experience working with the team. They understood exactly what I was looking for and delivered beyond expectations. The financing assistance was particularly helpful.', 4, 'Tanzania', 'approved', 'text', '[]'::jsonb),
  ('550e8400-e29b-41d4-a716-446655440028', 'David Okafor', 'Real Estate Developer', 'Excellent service and great properties in Lagos. The team was very professional throughout the entire process. They helped me acquire multiple commercial properties.', 5, 'Nigeria', 'approved', 'text', '[]'::jsonb),
  ('550e8400-e29b-41d4-a716-446655440029', 'Grace Mutindi', 'Family Home Buyer', 'Finding our family home was made so easy by ElijahRealtor. They showed us properties that matched our budget and needs perfectly. We are now happily settled in Karen.', 5, 'Kenya', 'approved', 'text', '[]'::jsonb),
  ('550e8400-e29b-41d4-a716-446655440030', 'James Okello', 'Commercial Investor', 'The commercial property investment advice I received was invaluable. ElijahRealtor helped me identify high-yield properties and guided me through the entire acquisition process.', 4, 'Uganda', 'approved', 'text', '[]'::jsonb)
ON CONFLICT (id) DO NOTHING;