-- Add archive support: soft-delete for reservations
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ DEFAULT NULL;

-- Partial index for fast filtering of non-archived reservations
CREATE INDEX IF NOT EXISTS idx_reservations_not_archived
  ON reservations (created_at DESC)
  WHERE archived_at IS NULL;
