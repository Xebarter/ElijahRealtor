-- Add apartment-specific fields to properties table
ALTER TABLE properties
  ADD COLUMN apartment_units integer,
  ADD COLUMN apartment_monthly_income decimal(12,2),
  ADD COLUMN apartment_occupancy_rate decimal(5,2),
  ADD COLUMN apartment_projected_roi decimal(5,2),
  ADD COLUMN apartment_notes text; 