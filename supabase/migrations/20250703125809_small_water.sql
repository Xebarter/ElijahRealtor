-- Create blog_categories table
CREATE TABLE IF NOT EXISTS blog_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Update blog_posts table with additional fields
ALTER TABLE blog_posts 
ADD COLUMN IF NOT EXISTS author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS author_name text,
ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES blog_categories(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS reading_time_minutes integer,
ADD COLUMN IF NOT EXISTS view_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS meta_title text,
ADD COLUMN IF NOT EXISTS meta_description text,
ADD COLUMN IF NOT EXISTS meta_keywords text[];

-- Create blog_tags table
CREATE TABLE IF NOT EXISTS blog_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

-- Create blog_post_tags junction table
CREATE TABLE IF NOT EXISTS blog_post_tags (
  post_id uuid REFERENCES blog_posts(id) ON DELETE CASCADE,
  tag_id uuid REFERENCES blog_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

-- Create blog_comments table
CREATE TABLE IF NOT EXISTS blog_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  author_name text NOT NULL,
  author_email text NOT NULL,
  content text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_comments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for blog_categories
CREATE POLICY "Public can read blog categories" 
  ON blog_categories FOR SELECT 
  TO anon, authenticated 
  USING (true);

CREATE POLICY "Authenticated users can manage blog categories" 
  ON blog_categories FOR ALL 
  TO authenticated 
  USING (true);

-- Create RLS policies for blog_tags
CREATE POLICY "Public can read blog tags" 
  ON blog_tags FOR SELECT 
  TO anon, authenticated 
  USING (true);

CREATE POLICY "Authenticated users can manage blog tags" 
  ON blog_tags FOR ALL 
  TO authenticated 
  USING (true);

-- Create RLS policies for blog_post_tags
CREATE POLICY "Public can read blog post tags" 
  ON blog_post_tags FOR SELECT 
  TO anon, authenticated 
  USING (true);

CREATE POLICY "Authenticated users can manage blog post tags" 
  ON blog_post_tags FOR ALL 
  TO authenticated 
  USING (true);

-- Create RLS policies for blog_comments
CREATE POLICY "Public can read approved blog comments" 
  ON blog_comments FOR SELECT 
  TO anon, authenticated 
  USING (status = 'approved' OR auth.role() = 'authenticated');

CREATE POLICY "Public can create blog comments" 
  ON blog_comments FOR INSERT 
  TO anon, authenticated 
  WITH CHECK (true);

CREATE POLICY "Authenticated users can manage blog comments" 
  ON blog_comments FOR ALL 
  TO authenticated 
  USING (true);

-- Create storage bucket for blog images if it doesn't exist
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('blog-images', 'blog-images', true)
ON CONFLICT (id) DO NOTHING;

-- Check if policies exist before creating them
DO $$
BEGIN
  -- Check and create "Public can view blog images" policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage' 
    AND policyname = 'Public can view blog images'
  ) THEN
    CREATE POLICY "Public can view blog images" 
      ON storage.objects FOR SELECT 
      USING (bucket_id = 'blog-images');
  END IF;

  -- Check and create "Authenticated users can upload blog images" policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage' 
    AND policyname = 'Authenticated users can upload blog images'
  ) THEN
    CREATE POLICY "Authenticated users can upload blog images" 
      ON storage.objects FOR INSERT 
      TO authenticated 
      WITH CHECK (bucket_id = 'blog-images');
  END IF;

  -- Check and create "Authenticated users can update blog images" policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage' 
    AND policyname = 'Authenticated users can update blog images'
  ) THEN
    CREATE POLICY "Authenticated users can update blog images" 
      ON storage.objects FOR UPDATE 
      TO authenticated 
      USING (bucket_id = 'blog-images');
  END IF;

  -- Check and create "Authenticated users can delete blog images" policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage' 
    AND policyname = 'Authenticated users can delete blog images'
  ) THEN
    CREATE POLICY "Authenticated users can delete blog images" 
      ON storage.objects FOR DELETE 
      TO authenticated 
      USING (bucket_id = 'blog-images');
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS blog_posts_slug_idx ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS blog_posts_category_id_idx ON blog_posts(category_id);
CREATE INDEX IF NOT EXISTS blog_posts_published_idx ON blog_posts(published);
CREATE INDEX IF NOT EXISTS blog_posts_created_at_idx ON blog_posts(created_at);
CREATE INDEX IF NOT EXISTS blog_comments_post_id_idx ON blog_comments(post_id);
CREATE INDEX IF NOT EXISTS blog_comments_status_idx ON blog_comments(status);

-- Insert sample categories
INSERT INTO blog_categories (name, slug, description) VALUES
  ('Real Estate Tips', 'real-estate-tips', 'Helpful advice for buying, selling, and investing in real estate'),
  ('Market Insights', 'market-insights', 'Analysis and trends in the African real estate market'),
  ('Property Guides', 'property-guides', 'Comprehensive guides to different property types and locations'),
  ('Investment Advice', 'investment-advice', 'Tips and strategies for real estate investment'),
  ('Company News', 'company-news', 'Updates and announcements from ElijahRealtor')
ON CONFLICT (name) DO NOTHING;

-- Insert sample tags
INSERT INTO blog_tags (name, slug) VALUES
  ('Buying', 'buying'),
  ('Selling', 'selling'),
  ('Investment', 'investment'),
  ('First-time Buyers', 'first-time-buyers'),
  ('Luxury Properties', 'luxury-properties'),
  ('Commercial', 'commercial'),
  ('Residential', 'residential'),
  ('Kenya', 'kenya'),
  ('Uganda', 'uganda'),
  ('Tanzania', 'tanzania'),
  ('Nigeria', 'nigeria'),
  ('Financing', 'financing'),
  ('Property Management', 'property-management'),
  ('Market Trends', 'market-trends')
ON CONFLICT (name) DO NOTHING;

-- Insert sample blog posts
INSERT INTO blog_posts (
  title, 
  slug, 
  content, 
  excerpt, 
  category_id, 
  author_name, 
  published, 
  reading_time_minutes, 
  meta_title, 
  meta_description, 
  meta_keywords,
  created_at
) VALUES
  (
    '10 Tips for First-Time Home Buyers in East Africa', 
    '10-tips-first-time-home-buyers-east-africa',
    '# 10 Tips for First-Time Home Buyers in East Africa

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

Following these tips will help ensure your first home purchase is a successful and rewarding experience.',
    'Essential tips to help first-time buyers navigate the property market successfully across East Africa.',
    (SELECT id FROM blog_categories WHERE slug = 'real-estate-tips'),
    'Elijah Kimani',
    true,
    8,
    '10 Essential Tips for First-Time Home Buyers in East Africa | ElijahRealtor',
    'Expert advice for first-time home buyers in East Africa. Learn the essential tips to make your property purchase smooth and successful.',
    ARRAY['first-time-buyer', 'tips', 'home-buying', 'east-africa'],
    NOW() - INTERVAL '30 days'
  ),
  (
    'The Rise of Luxury Real Estate in Nairobi',
    'rise-luxury-real-estate-nairobi',
    '# The Rise of Luxury Real Estate in Nairobi

Nairobi''s luxury real estate market has experienced significant growth in recent years, attracting both local and international investors. This article explores the factors driving this trend and what it means for the future of Kenya''s property market.

## Growing Demand for High-End Properties

The demand for luxury properties in Nairobi has been steadily increasing, driven by a growing middle and upper class, expatriates, and international investors looking for opportunities in emerging markets. Areas like Karen, Runda, Muthaiga, and Kitisuru have become hotspots for luxury developments, offering exclusive amenities and serene environments away from the bustling city center.

## What Defines Luxury Real Estate in Nairobi?

Luxury properties in Nairobi typically feature:

- Spacious layouts with high-quality finishes
- State-of-the-art security systems
- Smart home technology
- Eco-friendly features like solar power and water recycling
- Premium amenities such as swimming pools, gyms, and landscaped gardens
- Exclusive locations with scenic views

## Investment Potential

The luxury real estate sector in Nairobi offers attractive returns for investors. Despite economic fluctuations, high-end properties have maintained their value and shown appreciation over time. The rental market for luxury homes is also robust, with expatriates and diplomatic missions willing to pay premium rates for quality accommodations.

## Challenges and Considerations

While the luxury market is thriving, potential investors should be aware of:

- Regulatory changes that may affect property ownership
- Infrastructure development in different neighborhoods
- Security considerations
- Property management requirements for rental investments

## Future Outlook

The future looks promising for Nairobi''s luxury real estate market. With continued economic growth, infrastructure improvements, and increasing international interest in Kenya as a business hub, the demand for high-end properties is expected to remain strong.

For those considering entering this market, working with experienced real estate professionals who understand the nuances of luxury property transactions in Kenya is essential for making informed investment decisions.',
    'Explore the booming luxury real estate market in Nairobi and the factors driving its growth as an investment hotspot in East Africa.',
    (SELECT id FROM blog_categories WHERE slug = 'market-insights'),
    'Sarah Odhiambo',
    true,
    6,
    'The Rise of Luxury Real Estate in Nairobi | Market Analysis',
    'Discover why Nairobi is becoming a hotspot for luxury real estate investment. Analysis of market trends, investment potential, and future outlook.',
    ARRAY['luxury-properties', 'nairobi', 'kenya', 'investment', 'market-trends'],
    NOW() - INTERVAL '15 days'
  ),
  (
    'Commercial Property Investment Opportunities in Lagos',
    'commercial-property-investment-lagos',
    '# Commercial Property Investment Opportunities in Lagos

Lagos, Nigeria''s economic powerhouse, offers diverse commercial real estate investment opportunities. This guide explores the current market landscape, high-potential areas, and key considerations for investors.

## Market Overview

Lagos continues to cement its position as Africa''s largest commercial hub, with a growing demand for office spaces, retail centers, and industrial facilities. Despite economic challenges, the commercial property sector has shown resilience, particularly in prime locations like Victoria Island, Ikoyi, and Lekki.

## Prime Investment Sectors

### Office Spaces

The office market in Lagos is evolving rapidly, with increasing demand for:

- Grade A office buildings with modern amenities
- Flexible workspaces and co-working environments
- Green buildings with sustainable features
- Tech-enabled smart offices

### Retail Properties

Retail real estate presents compelling opportunities, especially:

- Shopping malls in affluent neighborhoods
- Neighborhood retail centers serving local communities
- Mixed-use developments combining retail with residential or office spaces

### Industrial and Logistics

With the growth of e-commerce and manufacturing:

- Warehouses and distribution centers
- Light industrial parks
- Logistics facilities near ports and major highways

## High-Potential Areas

1. **Lekki Free Trade Zone**: Rapidly developing with significant government backing
2. **Victoria Island**: Premium commercial district with high rental yields
3. **Ikeja GRA**: Growing commercial center with improving infrastructure
4. **Apapa**: Strategic location for industrial and logistics properties
5. **Mainland Central Business District**: Affordable alternative with improving accessibility

## Investment Considerations

Before investing in Lagos commercial real estate, consider:

- **Title verification**: Ensure proper documentation and clear ownership
- **Infrastructure**: Assess road access, power supply, and internet connectivity
- **Tenant demand**: Research the local market for your property type
- **Property management**: Plan for effective management and maintenance
- **Exit strategy**: Understand potential resale value and liquidity

## Financing Options

Commercial property investments can be financed through:

- Local and international banks offering commercial mortgages
- Real estate investment groups and partnerships
- Private equity firms focusing on African real estate
- Development finance institutions supporting commercial projects

## Conclusion

Lagos offers significant opportunities for commercial real estate investors willing to navigate its unique challenges. With proper research, due diligence, and local expertise, investors can achieve attractive returns in Africa''s largest city and economic hub.',
    'A comprehensive guide to commercial real estate investment opportunities in Lagos, Nigeria, covering market trends, prime locations, and key considerations for investors.',
    (SELECT id FROM blog_categories WHERE slug = 'investment-advice'),
    'Oluwaseun Adeyemi',
    true,
    10,
    'Commercial Property Investment Guide: Lagos, Nigeria | ElijahRealtor',
    'Explore lucrative commercial real estate investment opportunities in Lagos. Expert analysis of the market, prime locations, and investment strategies.',
    ARRAY['commercial', 'lagos', 'nigeria', 'investment', 'office-space', 'retail'],
    NOW() - INTERVAL '7 days'
  )
ON CONFLICT (slug) DO NOTHING;

-- Link posts to tags
DO $$
DECLARE
  first_post_id uuid;
  second_post_id uuid;
  third_post_id uuid;
  tag_id uuid;
BEGIN
  -- Get post IDs
  SELECT id INTO first_post_id FROM blog_posts WHERE slug = '10-tips-first-time-home-buyers-east-africa';
  SELECT id INTO second_post_id FROM blog_posts WHERE slug = 'rise-luxury-real-estate-nairobi';
  SELECT id INTO third_post_id FROM blog_posts WHERE slug = 'commercial-property-investment-lagos';
  
  -- Link first post to tags
  SELECT id INTO tag_id FROM blog_tags WHERE slug = 'first-time-buyers';
  IF first_post_id IS NOT NULL AND tag_id IS NOT NULL THEN
    INSERT INTO blog_post_tags (post_id, tag_id) VALUES (first_post_id, tag_id) ON CONFLICT DO NOTHING;
  END IF;
  
  SELECT id INTO tag_id FROM blog_tags WHERE slug = 'buying';
  IF first_post_id IS NOT NULL AND tag_id IS NOT NULL THEN
    INSERT INTO blog_post_tags (post_id, tag_id) VALUES (first_post_id, tag_id) ON CONFLICT DO NOTHING;
  END IF;
  
  SELECT id INTO tag_id FROM blog_tags WHERE slug = 'kenya';
  IF first_post_id IS NOT NULL AND tag_id IS NOT NULL THEN
    INSERT INTO blog_post_tags (post_id, tag_id) VALUES (first_post_id, tag_id) ON CONFLICT DO NOTHING;
  END IF;
  
  -- Link second post to tags
  SELECT id INTO tag_id FROM blog_tags WHERE slug = 'luxury-properties';
  IF second_post_id IS NOT NULL AND tag_id IS NOT NULL THEN
    INSERT INTO blog_post_tags (post_id, tag_id) VALUES (second_post_id, tag_id) ON CONFLICT DO NOTHING;
  END IF;
  
  SELECT id INTO tag_id FROM blog_tags WHERE slug = 'kenya';
  IF second_post_id IS NOT NULL AND tag_id IS NOT NULL THEN
    INSERT INTO blog_post_tags (post_id, tag_id) VALUES (second_post_id, tag_id) ON CONFLICT DO NOTHING;
  END IF;
  
  SELECT id INTO tag_id FROM blog_tags WHERE slug = 'investment';
  IF second_post_id IS NOT NULL AND tag_id IS NOT NULL THEN
    INSERT INTO blog_post_tags (post_id, tag_id) VALUES (second_post_id, tag_id) ON CONFLICT DO NOTHING;
  END IF;
  
  -- Link third post to tags
  SELECT id INTO tag_id FROM blog_tags WHERE slug = 'commercial';
  IF third_post_id IS NOT NULL AND tag_id IS NOT NULL THEN
    INSERT INTO blog_post_tags (post_id, tag_id) VALUES (third_post_id, tag_id) ON CONFLICT DO NOTHING;
  END IF;
  
  SELECT id INTO tag_id FROM blog_tags WHERE slug = 'nigeria';
  IF third_post_id IS NOT NULL AND tag_id IS NOT NULL THEN
    INSERT INTO blog_post_tags (post_id, tag_id) VALUES (third_post_id, tag_id) ON CONFLICT DO NOTHING;
  END IF;
  
  SELECT id INTO tag_id FROM blog_tags WHERE slug = 'investment';
  IF third_post_id IS NOT NULL AND tag_id IS NOT NULL THEN
    INSERT INTO blog_post_tags (post_id, tag_id) VALUES (third_post_id, tag_id) ON CONFLICT DO NOTHING;
  END IF;
END $$;