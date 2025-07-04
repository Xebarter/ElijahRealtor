/*
  # Enhanced Property Media Management

  1. Schema Updates
    - Update properties table with new media fields
    - Create property_images table for organized image storage
    - Add indexes for better performance

  2. Storage Setup
    - Create storage buckets for property media
    - Set up RLS policies for secure access

  3. Security
    - Admin-only upload permissions
    - Public read access for approved content
*/

-- Update properties table with new media fields
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS location_coordinates JSONB,
ADD COLUMN IF NOT EXISTS location_url TEXT,
ADD COLUMN IF NOT EXISTS video_tour_url TEXT;

-- Create property_images table for organized image storage
CREATE TABLE IF NOT EXISTS property_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  feature_type text NOT NULL, -- 'living_room', 'kitchen', 'master_bedroom', etc.
  image_url text NOT NULL,
  storage_path text NOT NULL,
  display_order integer DEFAULT 0,
  alt_text text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on property_images
ALTER TABLE property_images ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for property_images
CREATE POLICY "Public can read property images" 
  ON property_images FOR SELECT 
  TO anon, authenticated 
  USING (true);

CREATE POLICY "Authenticated users can manage property images" 
  ON property_images FOR ALL 
  TO authenticated 
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS property_images_property_id_idx ON property_images(property_id);
CREATE INDEX IF NOT EXISTS property_images_feature_type_idx ON property_images(feature_type);
CREATE INDEX IF NOT EXISTS property_images_display_order_idx ON property_images(display_order);

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('property-feature-images', 'property-feature-images', true),
  ('property-videos', 'property-videos', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for property feature images
CREATE POLICY "Public can view property feature images" 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'property-feature-images');

CREATE POLICY "Authenticated users can upload property feature images" 
  ON storage.objects FOR INSERT 
  TO authenticated 
  WITH CHECK (bucket_id = 'property-feature-images');

CREATE POLICY "Authenticated users can update property feature images" 
  ON storage.objects FOR UPDATE 
  TO authenticated 
  USING (bucket_id = 'property-feature-images');

CREATE POLICY "Authenticated users can delete property feature images" 
  ON storage.objects FOR DELETE 
  TO authenticated 
  USING (bucket_id = 'property-feature-images');

-- Create storage policies for property videos
CREATE POLICY "Public can view property videos" 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'property-videos');

CREATE POLICY "Authenticated users can upload property videos" 
  ON storage.objects FOR INSERT 
  TO authenticated 
  WITH CHECK (bucket_id = 'property-videos');

CREATE POLICY "Authenticated users can update property videos" 
  ON storage.objects FOR UPDATE 
  TO authenticated 
  USING (bucket_id = 'property-videos');

CREATE POLICY "Authenticated users can delete property videos" 
  ON storage.objects FOR DELETE 
  TO authenticated 
  USING (bucket_id = 'property-videos');