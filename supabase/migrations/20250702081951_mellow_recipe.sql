/*
  # Add foreign key constraint for visits table

  1. Changes
    - Add foreign key constraint on visits.property_id referencing properties.id
    - This enables Supabase to understand the relationship between visits and properties tables
    - Allows join queries to work properly in the application

  2. Security
    - No changes to RLS policies needed
    - Existing policies remain intact
*/

-- Add foreign key constraint to link visits to properties
ALTER TABLE visits 
ADD CONSTRAINT visits_property_id_fkey 
FOREIGN KEY (property_id) REFERENCES properties(id);