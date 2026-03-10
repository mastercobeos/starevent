-- Add rental_days column to reservations
ALTER TABLE reservations
  ADD COLUMN IF NOT EXISTS rental_days INTEGER DEFAULT 1;
