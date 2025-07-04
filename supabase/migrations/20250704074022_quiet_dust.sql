/*
  # Property Developers Management System

  1. New Tables
    - Ensure developers table has all necessary fields
    - Add storage bucket for developer logos

  2. Security
    - Enable RLS on developers table
    - Add policies for secure access control
    - Set up storage policies for developer logos

  3. Features
    - Support for developer logos
    - Country tracking for developers
    - Relationship with properties
*/

-- Ensure developers table has all required fields
DO $$
BEGIN
  -- Add logo_url column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'developers' AND column_name = 'logo_url') THEN
    ALTER TABLE developers ADD COLUMN logo_url text;
  END IF;

  -- Add bio column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'developers' AND column_name = 'bio') THEN
    ALTER TABLE developers ADD COLUMN bio text;
  END IF;

  -- Add contact_email column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'developers' AND column_name = 'contact_email') THEN
    ALTER TABLE developers ADD COLUMN contact_email text;
  END IF;

  -- Add contact_phone column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'developers' AND column_name = 'contact_phone') THEN
    ALTER TABLE developers ADD COLUMN contact_phone text;
  END IF;

  -- Add website_url column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'developers' AND column_name = 'website_url') THEN
    ALTER TABLE developers ADD COLUMN website_url text;
  END IF;

  -- Add countries column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'developers' AND column_name = 'countries') THEN
    ALTER TABLE developers ADD COLUMN countries text[] DEFAULT '{}';
  END IF;

  -- Add created_at column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'developers' AND column_name = 'created_at') THEN
    ALTER TABLE developers ADD COLUMN created_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Create storage bucket for developer logos if it doesn't exist
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('developer-logos', 'developer-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DO $$
BEGIN
  -- Drop existing policies for developer-logos bucket
  DROP POLICY IF EXISTS "Public can view developer logos" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated users can upload developer logos" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated users can update developer logos" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated users can delete developer logos" ON storage.objects;
END $$;

-- Create storage policies for developer logos
CREATE POLICY "Public can view developer logos" 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'developer-logos');

CREATE POLICY "Authenticated users can upload developer logos" 
  ON storage.objects FOR INSERT 
  TO authenticated 
  WITH CHECK (bucket_id = 'developer-logos');

CREATE POLICY "Authenticated users can update developer logos" 
  ON storage.objects FOR UPDATE 
  TO authenticated 
  USING (bucket_id = 'developer-logos');

CREATE POLICY "Authenticated users can delete developer logos" 
  ON storage.objects FOR DELETE 
  TO authenticated 
  USING (bucket_id = 'developer-logos');

-- Enable RLS on developers table if not already enabled
ALTER TABLE developers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can read developers" ON developers;
DROP POLICY IF EXISTS "Authenticated users can manage developers" ON developers;

-- Create RLS policies for developers
CREATE POLICY "Public can read developers" 
  ON developers FOR SELECT 
  TO anon, authenticated 
  USING (true);

CREATE POLICY "Authenticated users can manage developers" 
  ON developers FOR ALL 
  TO authenticated 
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS developers_name_idx ON developers(name);
CREATE INDEX IF NOT EXISTS developers_countries_idx ON developers USING gin(countries);

-- Insert sample developers if none exist
INSERT INTO developers (name, bio, contact_email, contact_phone, website_url, countries)
SELECT 
  'Skyline Developers', 
  'Premier luxury property developer with over 15 years of experience across East Africa.', 
  'info@skylinedevelopers.com', 
  '+254 700 123 456', 
  'https://skylinedevelopers.com', 
  ARRAY['Kenya', 'Tanzania', 'Uganda']
WHERE NOT EXISTS (SELECT 1 FROM developers LIMIT 1);

INSERT INTO developers (name, bio, contact_email, contact_phone, website_url, countries)
SELECT 
  'Urban Living Properties', 
  'Specializing in modern urban apartments and commercial spaces in major African cities.', 
  'contact@urbanliving.com', 
  '+254 722 987 654', 
  'https://urbanliving.com', 
  ARRAY['Kenya', 'Nigeria', 'South Africa']
WHERE NOT EXISTS (SELECT 1 FROM developers WHERE name = 'Urban Living Properties');

INSERT INTO developers (name, bio, contact_email, contact_phone, website_url, countries)
SELECT 
  'Continental Estates', 
  'Pan-African property developer focusing on sustainable and eco-friendly developments.', 
  'info@continentalestates.com', 
  '+255 755 123 456', 
  'https://continentalestates.com', 
  ARRAY['Tanzania', 'Rwanda', 'Ghana']
WHERE NOT EXISTS (SELECT 1 FROM developers WHERE name = 'Continental Estates');