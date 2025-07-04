-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create developers table
CREATE TABLE IF NOT EXISTS developers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  logo_url text,
  bio text,
  contact_email text,
  contact_phone text,
  website_url text,
  countries text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create properties table
CREATE TABLE IF NOT EXISTS properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  price decimal(12,2) NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  property_type text NOT NULL CHECK (property_type IN ('apartment', 'house', 'commercial')),
  status text NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'sold', 'pending')),
  location text NOT NULL,
  city text NOT NULL,
  country text NOT NULL,
  size_sqft integer,
  bedrooms integer,
  bathrooms integer,
  amenities text[] DEFAULT '{}',
  featured boolean DEFAULT false,
  video_url text,
  developer_id uuid REFERENCES developers(id),
  images text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create visits table (already exists from previous migration, but ensuring it's complete)
CREATE TABLE IF NOT EXISTS visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES properties(id),
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  preferred_time timestamptz NOT NULL,
  message text,
  payment_status text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid')),
  transaction_id text,
  paid_at timestamptz,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  admin_notes text,
  created_at timestamptz DEFAULT now()
);

-- Create financing_applications table
CREATE TABLE IF NOT EXISTS financing_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES properties(id),
  applicant_name text NOT NULL,
  applicant_email text NOT NULL,
  applicant_phone text NOT NULL,
  monthly_income decimal(10,2),
  currency text,
  employment_status text,
  id_document_url text,
  income_proof_url text,
  status text DEFAULT 'received' CHECK (status IN ('received', 'forwarded', 'approved', 'rejected')),
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Create testimonials table
CREATE TABLE IF NOT EXISTS testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name text NOT NULL,
  client_image_url text,
  content text NOT NULL,
  video_url text,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  country text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz DEFAULT now()
);

-- Create blog_posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  content text NOT NULL,
  excerpt text,
  featured_image_url text,
  category text,
  tags text[] DEFAULT '{}',
  published boolean DEFAULT false,
  seo_title text,
  seo_description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create contact_messages table
CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  country text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  status text DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied')),
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE developers ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE financing_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Developers policies
CREATE POLICY "Public can read developers" ON developers FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Authenticated users can manage developers" ON developers FOR ALL TO authenticated USING (true);

-- Properties policies
CREATE POLICY "Public can read available properties" ON properties FOR SELECT TO anon, authenticated USING (status = 'available' OR auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage properties" ON properties FOR ALL TO authenticated USING (true);

-- Visits policies (already created in previous migration)
DROP POLICY IF EXISTS "Anyone can create visit bookings" ON visits;
DROP POLICY IF EXISTS "Users can read visit bookings" ON visits;
DROP POLICY IF EXISTS "Authenticated users can manage all visits" ON visits;

CREATE POLICY "Anyone can create visit bookings" ON visits FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Users can read visit bookings" ON visits FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Authenticated users can manage all visits" ON visits FOR ALL TO authenticated USING (true);

-- Financing applications policies
CREATE POLICY "Anyone can create financing applications" ON financing_applications FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can manage financing applications" ON financing_applications FOR ALL TO authenticated USING (true);

-- Testimonials policies
CREATE POLICY "Public can read approved testimonials" ON testimonials FOR SELECT TO anon, authenticated USING (status = 'approved' OR auth.role() = 'authenticated');
CREATE POLICY "Anyone can create testimonials" ON testimonials FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can manage testimonials" ON testimonials FOR ALL TO authenticated USING (true);

-- Blog posts policies
CREATE POLICY "Public can read published blog posts" ON blog_posts FOR SELECT TO anon, authenticated USING (published = true OR auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage blog posts" ON blog_posts FOR ALL TO authenticated USING (true);

-- Contact messages policies
CREATE POLICY "Anyone can create contact messages" ON contact_messages FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can read contact messages" ON contact_messages FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage contact messages" ON contact_messages FOR ALL TO authenticated USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS properties_status_idx ON properties(status);
CREATE INDEX IF NOT EXISTS properties_featured_idx ON properties(featured);
CREATE INDEX IF NOT EXISTS properties_country_idx ON properties(country);
CREATE INDEX IF NOT EXISTS properties_city_idx ON properties(city);
CREATE INDEX IF NOT EXISTS properties_property_type_idx ON properties(property_type);
CREATE INDEX IF NOT EXISTS properties_price_idx ON properties(price);
CREATE INDEX IF NOT EXISTS properties_created_at_idx ON properties(created_at);

CREATE INDEX IF NOT EXISTS visits_property_id_idx ON visits(property_id);
CREATE INDEX IF NOT EXISTS visits_payment_status_idx ON visits(payment_status);
CREATE INDEX IF NOT EXISTS visits_status_idx ON visits(status);
CREATE INDEX IF NOT EXISTS visits_preferred_time_idx ON visits(preferred_time);
CREATE INDEX IF NOT EXISTS visits_created_at_idx ON visits(created_at);

CREATE INDEX IF NOT EXISTS financing_applications_property_id_idx ON financing_applications(property_id);
CREATE INDEX IF NOT EXISTS financing_applications_status_idx ON financing_applications(status);
CREATE INDEX IF NOT EXISTS financing_applications_created_at_idx ON financing_applications(created_at);

CREATE INDEX IF NOT EXISTS testimonials_status_idx ON testimonials(status);
CREATE INDEX IF NOT EXISTS testimonials_rating_idx ON testimonials(rating);
CREATE INDEX IF NOT EXISTS testimonials_created_at_idx ON testimonials(created_at);

CREATE INDEX IF NOT EXISTS blog_posts_published_idx ON blog_posts(published);
CREATE INDEX IF NOT EXISTS blog_posts_slug_idx ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS blog_posts_created_at_idx ON blog_posts(created_at);

CREATE INDEX IF NOT EXISTS contact_messages_status_idx ON contact_messages(status);
CREATE INDEX IF NOT EXISTS contact_messages_created_at_idx ON contact_messages(created_at);

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('property-images', 'property-images', true),
  ('developer-logos', 'developer-logos', true),
  ('testimonial-images', 'testimonial-images', true),
  ('blog-images', 'blog-images', true),
  ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
CREATE POLICY "Public can view property images" ON storage.objects FOR SELECT USING (bucket_id = 'property-images');
CREATE POLICY "Authenticated users can upload property images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'property-images');
CREATE POLICY "Authenticated users can update property images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'property-images');
CREATE POLICY "Authenticated users can delete property images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'property-images');

CREATE POLICY "Public can view developer logos" ON storage.objects FOR SELECT USING (bucket_id = 'developer-logos');
CREATE POLICY "Authenticated users can upload developer logos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'developer-logos');
CREATE POLICY "Authenticated users can update developer logos" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'developer-logos');
CREATE POLICY "Authenticated users can delete developer logos" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'developer-logos');

CREATE POLICY "Public can view testimonial images" ON storage.objects FOR SELECT USING (bucket_id = 'testimonial-images');
CREATE POLICY "Anyone can upload testimonial images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'testimonial-images');

CREATE POLICY "Public can view blog images" ON storage.objects FOR SELECT USING (bucket_id = 'blog-images');
CREATE POLICY "Authenticated users can upload blog images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'blog-images');
CREATE POLICY "Authenticated users can update blog images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'blog-images');
CREATE POLICY "Authenticated users can delete blog images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'blog-images');

CREATE POLICY "Authenticated users can manage documents" ON storage.objects FOR ALL TO authenticated USING (bucket_id = 'documents');

-- Insert sample data
INSERT INTO developers (id, name, bio, contact_email, contact_phone, website_url, countries) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Premier Developments Ltd', 'Leading property developer with over 20 years of experience in luxury residential and commercial properties across East Africa.', 'info@premierdevelopments.com', '+254 700 123 456', 'https://premierdevelopments.com', ARRAY['Kenya', 'Uganda', 'Tanzania']),
  ('550e8400-e29b-41d4-a716-446655440002', 'Urban Living Properties', 'Specialized in modern urban living solutions and sustainable development practices across multiple African markets.', 'contact@urbanliving.com', '+254 700 654 321', 'https://urbanliving.com', ARRAY['Kenya', 'Tanzania', 'Rwanda']),
  ('550e8400-e29b-41d4-a716-446655440003', 'Continental Estates', 'Pan-African real estate developer focusing on luxury residential and commercial properties.', 'info@continentalestates.com', '+256 700 123 456', 'https://continentalestates.com', ARRAY['Uganda', 'Nigeria', 'Ghana', 'South Africa'])
ON CONFLICT (id) DO NOTHING;

INSERT INTO properties (id, title, description, price, currency, property_type, status, location, city, country, size_sqft, bedrooms, bathrooms, amenities, featured, developer_id, images) VALUES
  ('550e8400-e29b-41d4-a716-446655440011', 'Modern Downtown Apartment', 'Luxurious 2-bedroom apartment in the heart of downtown with stunning city views and modern amenities.', 750000, 'KES', 'apartment', 'available', 'Westlands', 'Nairobi', 'Kenya', 1200, 2, 2, ARRAY['Gym', 'Swimming Pool', 'Parking', 'Security', 'Elevator'], true, '550e8400-e29b-41d4-a716-446655440001', ARRAY['https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg', 'https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg']),
  ('550e8400-e29b-41d4-a716-446655440012', 'Spacious Family Villa', 'Beautiful 4-bedroom villa perfect for families, featuring a large garden and modern kitchen.', 1250000, 'KES', 'house', 'available', 'Karen', 'Nairobi', 'Kenya', 2500, 4, 3, ARRAY['Garden', 'Garage', 'Fireplace', 'Study Room', 'Servant Quarter'], true, '550e8400-e29b-41d4-a716-446655440002', ARRAY['https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg', 'https://images.pexels.com/photos/1396132/pexels-photo-1396132.jpeg']),
  ('550e8400-e29b-41d4-a716-446655440013', 'Commercial Office Space', 'Prime commercial office space in business district, ideal for corporate headquarters.', 2000000, 'KES', 'commercial', 'available', 'Westlands', 'Nairobi', 'Kenya', 3000, null, null, ARRAY['Conference Room', 'Reception Area', 'Parking', 'High Speed Internet', 'Generator'], false, '550e8400-e29b-41d4-a716-446655440001', ARRAY['https://images.pexels.com/photos/380769/pexels-photo-380769.jpeg']),
  ('550e8400-e29b-41d4-a716-446655440014', 'Luxury Kampala Penthouse', 'Stunning penthouse with panoramic views of Kampala city, featuring premium finishes.', 850000000, 'UGX', 'apartment', 'available', 'Kololo', 'Kampala', 'Uganda', 1800, 3, 3, ARRAY['Rooftop Terrace', 'Gym', 'Concierge', 'Parking', 'Security'], true, '550e8400-e29b-41d4-a716-446655440003', ARRAY['https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg']),
  ('550e8400-e29b-41d4-a716-446655440015', 'Dar es Salaam Beachfront Villa', 'Exclusive beachfront villa with private beach access and stunning ocean views.', 1500000000, 'TZS', 'house', 'available', 'Msimbazi', 'Dar es Salaam', 'Tanzania', 3500, 5, 4, ARRAY['Private Beach', 'Swimming Pool', 'Garden', 'Garage', 'Security'], true, '550e8400-e29b-41d4-a716-446655440002', ARRAY['https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg']),
  ('550e8400-e29b-41d4-a716-446655440016', 'Lagos Commercial Complex', 'Modern commercial complex in Victoria Island, perfect for businesses and retail.', 500000000, 'NGN', 'commercial', 'available', 'Victoria Island', 'Lagos', 'Nigeria', 5000, null, null, ARRAY['Retail Spaces', 'Office Suites', 'Parking', 'Security', 'Generator'], false, '550e8400-e29b-41d4-a716-446655440001', ARRAY['https://images.pexels.com/photos/380769/pexels-photo-380769.jpeg'])
ON CONFLICT (id) DO NOTHING;

INSERT INTO testimonials (id, client_name, content, rating, country, status) VALUES
  ('550e8400-e29b-41d4-a716-446655440021', 'Sarah Johnson', 'ElijahRealtor helped me find my dream home in Nairobi. Their service was exceptional and the process was smooth from start to finish.', 5, 'Kenya', 'approved'),
  ('550e8400-e29b-41d4-a716-446655440022', 'Michael Chen', 'Professional, reliable, and knowledgeable. I would definitely recommend ElijahRealtor to anyone looking for property in East Africa.', 5, 'Uganda', 'approved'),
  ('550e8400-e29b-41d4-a716-446655440023', 'Emma Williams', 'Great experience working with the team. They understood exactly what I was looking for and delivered beyond expectations.', 4, 'Tanzania', 'approved'),
  ('550e8400-e29b-41d4-a716-446655440024', 'David Okafor', 'Excellent service and great properties in Lagos. The team was very professional throughout the entire process.', 5, 'Nigeria', 'approved')
ON CONFLICT (id) DO NOTHING;

INSERT INTO blog_posts (id, title, slug, content, excerpt, category, tags, published, seo_title, seo_description) VALUES
  ('550e8400-e29b-41d4-a716-446655440031', '10 Tips for First-Time Home Buyers in East Africa', '10-tips-first-time-home-buyers-east-africa', '# 10 Tips for First-Time Home Buyers in East Africa

Buying your first home is an exciting milestone, but it can also be overwhelming. Here are essential tips to help you navigate the property market successfully across East Africa.

## 1. Understand Your Budget
Before you start looking at properties, determine how much you can afford. Consider not just the purchase price, but also additional costs like legal fees, stamp duty, and moving expenses.

## 2. Get Pre-approved for Financing
Having a pre-approval letter from a bank or financial institution shows sellers that you''re a serious buyer and can help speed up the purchase process.

## 3. Research the Location
Location is crucial in real estate. Research the neighborhood, check for amenities like schools, hospitals, and shopping centers, and consider future development plans.

## 4. Work with a Reputable Agent
A good real estate agent can guide you through the process, help you find suitable properties, and negotiate on your behalf.

## 5. Get a Property Inspection
Always have a professional inspection done before finalizing your purchase to identify any potential issues with the property.

## 6. Understand the Legal Process
Familiarize yourself with the legal requirements for property purchase in your country, including title verification and registration processes.

## 7. Consider Future Resale Value
Think about the property''s potential for appreciation and how easy it would be to sell in the future.

## 8. Don''t Rush the Decision
Take your time to view multiple properties and compare them before making a decision.

## 9. Factor in Maintenance Costs
Consider ongoing costs like property taxes, insurance, utilities, and maintenance when budgeting for your new home.

## 10. Plan for the Unexpected
Set aside an emergency fund for unexpected repairs or changes in your financial situation.

Following these tips will help ensure your first home purchase is a successful and rewarding experience.', 'Essential tips to help first-time buyers navigate the property market successfully across East Africa.', 'Buying Guide', ARRAY['first-time-buyer', 'tips', 'home-buying', 'east-africa'], true, '10 Essential Tips for First-Time Home Buyers in East Africa | ElijahRealtor', 'Expert advice for first-time home buyers in East Africa. Learn the essential tips to make your property purchase smooth and successful.')
ON CONFLICT (id) DO NOTHING;