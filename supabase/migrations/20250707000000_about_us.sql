-- Migration: Create about_us table for About Us content and images
create table if not exists public.about_us (
  id uuid primary key default gen_random_uuid(),
  section text not null unique, -- 'sales', 'management', 'advisory', 'valuation'
  content text, -- rich text (HTML)
  image_url text
); 