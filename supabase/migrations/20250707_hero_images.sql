-- Hero Images Table for homepage slideshow
create table if not exists hero_images (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  caption text,
  "order" int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now())
); 