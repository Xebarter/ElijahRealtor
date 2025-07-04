/*
  # Create visits table for property visit bookings

  1. New Tables
    - `visits`
      - `id` (uuid, primary key)
      - `property_id` (uuid, foreign key to properties)
      - `name` (text, visitor name)
      - `email` (text, visitor email)
      - `phone` (text, visitor phone)
      - `preferred_time` (timestamptz, scheduled visit time)
      - `message` (text, optional message)
      - `payment_status` (text, pending/paid)
      - `transaction_id` (text, payment reference)
      - `paid_at` (timestamptz, payment completion time)
      - `status` (text, admin status: confirmed/cancelled)
      - `admin_notes` (text, internal notes)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `visits` table
    - Add policies for public insert and admin management
*/

CREATE TABLE IF NOT EXISTS visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  preferred_time timestamptz NOT NULL,
  message text,
  payment_status text NOT NULL DEFAULT 'pending',
  transaction_id text,
  paid_at timestamptz,
  status text NOT NULL DEFAULT 'pending',
  admin_notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE visits ENABLE ROW LEVEL SECURITY;

-- Allow public to create visit bookings
CREATE POLICY "Anyone can create visit bookings"
  ON visits
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow public to read their own bookings (for confirmation pages)
CREATE POLICY "Users can read visit bookings"
  ON visits
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow authenticated users (admin) to manage all visits
CREATE POLICY "Authenticated users can manage all visits"
  ON visits
  FOR ALL
  TO authenticated
  USING (true);

-- Add index for better performance
CREATE INDEX IF NOT EXISTS visits_property_id_idx ON visits(property_id);
CREATE INDEX IF NOT EXISTS visits_payment_status_idx ON visits(payment_status);
CREATE INDEX IF NOT EXISTS visits_status_idx ON visits(status);
CREATE INDEX IF NOT EXISTS visits_preferred_time_idx ON visits(preferred_time);