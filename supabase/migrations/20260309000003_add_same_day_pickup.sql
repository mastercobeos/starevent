-- Add same-day pickup fee columns to reservations
ALTER TABLE reservations
  ADD COLUMN IF NOT EXISTS same_day_pickup BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS same_day_pickup_fee NUMERIC(10,2) DEFAULT 0;
