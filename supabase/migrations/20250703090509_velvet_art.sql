/*
  # Fix testimonial media upload functionality

  1. Storage Setup
    - Create testimonial-media bucket if it doesn't exist
    - Add storage policies with proper checks for existing policies

  2. Table Updates
    - Add new columns to testimonials table if they don't exist
    - Add indexes for better performance

  3. Security
    - Public read access for testimonial media
    - Public upload access for testimonial submissions
    - Admin management access
*/

-- Create storage bucket for testimonial media if it doesn't exist
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('testimonial-media', 'testimonial-media', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist and recreate them
DO $$
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Public can view testimonial media" ON storage.objects;
  DROP POLICY IF EXISTS "Anyone can upload testimonial media" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated users can manage testimonial media" ON storage.objects;
END $$;

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

-- Update testimonials table with new fields if they don't exist
DO $$
BEGIN
  -- Add client_title column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'testimonials' AND column_name = 'client_title') THEN
    ALTER TABLE testimonials ADD COLUMN client_title text;
  END IF;

  -- Add media_urls column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'testimonials' AND column_name = 'media_urls') THEN
    ALTER TABLE testimonials ADD COLUMN media_urls jsonb DEFAULT '[]'::jsonb;
  END IF;

  -- Add type column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'testimonials' AND column_name = 'type') THEN
    ALTER TABLE testimonials ADD COLUMN type text DEFAULT 'text' CHECK (type IN ('text', 'image', 'video'));
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS testimonials_type_idx ON testimonials(type);
CREATE INDEX IF NOT EXISTS testimonials_country_idx ON testimonials(country);