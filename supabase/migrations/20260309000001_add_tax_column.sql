-- Add tax_amount column to reservations table
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS tax_amount NUMERIC(10,2) DEFAULT 0;
