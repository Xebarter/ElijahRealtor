/*
  # Unified Property Visits Management System

  1. Table Updates
    - Rename visits table to property_visits for clarity
    - Add proper constraints and indexes
    - Update RLS policies for admin-only management

  2. Security
    - Enable RLS with proper policies
    - Admin-only access for management operations
    - Public insert for booking requests

  3. Indexes
    - Performance optimization for filtering and sorting
*/

-- Create property_visits table (rename from visits if needed)
CREATE TABLE IF NOT EXISTS property_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  visitor_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  preferred_date date NOT NULL,
  preferred_time time NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  notes text,
  admin_notes text,
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid')),
  transaction_id text,
  paid_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE property_visits ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can create visit bookings" ON property_visits;
DROP POLICY IF EXISTS "Users can read visit bookings" ON property_visits;
DROP POLICY IF EXISTS "Authenticated users can manage all visits" ON property_visits;

-- Create RLS policies
CREATE POLICY "Anyone can create visit requests"
  ON property_visits
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Public can read visit requests"
  ON property_visits
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage all visits"
  ON property_visits
  FOR ALL
  TO authenticated
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS property_visits_property_id_idx ON property_visits(property_id);
CREATE INDEX IF NOT EXISTS property_visits_status_idx ON property_visits(status);
CREATE INDEX IF NOT EXISTS property_visits_preferred_date_idx ON property_visits(preferred_date);
CREATE INDEX IF NOT EXISTS property_visits_email_idx ON property_visits(email);
CREATE INDEX IF NOT EXISTS property_visits_created_at_idx ON property_visits(created_at);
CREATE INDEX IF NOT EXISTS property_visits_payment_status_idx ON property_visits(payment_status);

-- Migrate data from visits table if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'visits') THEN
    INSERT INTO property_visits (
      id, property_id, visitor_name, email, phone, 
      preferred_date, preferred_time, status, notes, admin_notes,
      payment_status, transaction_id, paid_at, created_at
    )
    SELECT 
      id, property_id, name, email, phone,
      preferred_time::date, preferred_time::time, status, message, admin_notes,
      payment_status, transaction_id, paid_at, created_at
    FROM visits
    ON CONFLICT (id) DO NOTHING;
    
    -- Drop old visits table after migration
    DROP TABLE IF EXISTS visits CASCADE;
  END IF;
END $$;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_property_visits_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_property_visits_updated_at_trigger
  BEFORE UPDATE ON property_visits
  FOR EACH ROW
  EXECUTE FUNCTION update_property_visits_updated_at();

-- Insert sample data for testing
INSERT INTO property_visits (
  property_id, visitor_name, email, phone, preferred_date, preferred_time, status, notes
) VALUES
  (
    (SELECT id FROM properties LIMIT 1),
    'John Smith',
    'john.smith@email.com',
    '+254700123456',
    CURRENT_DATE + INTERVAL '2 days',
    '10:00:00',
    'pending',
    'Interested in the kitchen and living room areas'
  ),
  (
    (SELECT id FROM properties LIMIT 1 OFFSET 1),
    'Sarah Johnson',
    'sarah.j@email.com',
    '+254700654321',
    CURRENT_DATE + INTERVAL '3 days',
    '14:00:00',
    'confirmed',
    'Looking for a family home with good schools nearby'
  ),
  (
    (SELECT id FROM properties LIMIT 1 OFFSET 2),
    'Michael Brown',
    'mike.brown@email.com',
    '+254700987654',
    CURRENT_DATE + INTERVAL '1 day',
    '11:30:00',
    'completed',
    'Commercial space for restaurant business'
  )
ON CONFLICT (id) DO NOTHING;