-- ============================================================
-- Migration: Reservation System Upgrade
-- Adds: split payments, contracts, stock holds, notifications,
--        idempotency, audit log, and state machine enforcement
-- ============================================================

-- 1. ALTER reservations table: add new columns
-- -----------------------------------------------------------
ALTER TABLE reservations
  ADD COLUMN IF NOT EXISTS first_name           TEXT,
  ADD COLUMN IF NOT EXISTS last_name            TEXT,
  ADD COLUMN IF NOT EXISTS phone_1              TEXT,
  ADD COLUMN IF NOT EXISTS phone_2              TEXT,
  ADD COLUMN IF NOT EXISTS property_type        TEXT,
  ADD COLUMN IF NOT EXISTS installation_required BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS installation_details TEXT,
  ADD COLUMN IF NOT EXISTS event_start_time     TIME,
  ADD COLUMN IF NOT EXISTS event_end_time       TIME,
  ADD COLUMN IF NOT EXISTS special_notes        TEXT,
  ADD COLUMN IF NOT EXISTS language             TEXT DEFAULT 'en',
  ADD COLUMN IF NOT EXISTS delivery_fee         NUMERIC(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS delivery_miles       NUMERIC(6,1),
  ADD COLUMN IF NOT EXISTS subtotal             NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS deposit_amount       NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS balance_amount       NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS balance_due_date     DATE,
  ADD COLUMN IF NOT EXISTS updated_at           TIMESTAMPTZ DEFAULT NOW();

-- Migrate existing data: split client_name into first/last
UPDATE reservations
SET first_name = split_part(COALESCE(client_name, 'Unknown'), ' ', 1),
    last_name  = CASE
      WHEN position(' ' in COALESCE(client_name, '')) > 0
      THEN substring(COALESCE(client_name, '') from position(' ' in COALESCE(client_name, '')) + 1)
      ELSE ''
    END,
    phone_1 = client_phone
WHERE first_name IS NULL;

-- Now make them NOT NULL with defaults for safety
ALTER TABLE reservations
  ALTER COLUMN first_name SET DEFAULT '',
  ALTER COLUMN last_name SET DEFAULT '',
  ALTER COLUMN phone_1 SET DEFAULT '';

-- Add CHECK constraints for property_type and language
ALTER TABLE reservations
  ADD CONSTRAINT chk_property_type
    CHECK (property_type IS NULL OR property_type IN ('residential_backyard', 'event_hall_venue'));

ALTER TABLE reservations
  ADD CONSTRAINT chk_language
    CHECK (language IN ('en', 'es'));

-- Drop old status constraint if exists, add new one
-- (wrap in DO block to handle case where constraint doesn't exist)
DO $$
BEGIN
  -- Try to drop existing constraint
  ALTER TABLE reservations DROP CONSTRAINT IF EXISTS reservations_status_check;
  ALTER TABLE reservations DROP CONSTRAINT IF EXISTS chk_reservation_status;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

ALTER TABLE reservations
  ADD CONSTRAINT chk_reservation_status
    CHECK (status IN (
      'pending_out_of_stock',
      'approved_waiting_contract',
      'contract_signed',
      'deposit_paid',
      'balance_due',
      'paid_in_full',
      'completed',
      'cancelled',
      'hold_expired',
      -- Legacy values (keep during migration period)
      'pending', 'confirmed', 'paid'
    ));


-- 2. CREATE contracts table
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS contracts (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id        UUID NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
  template_version      TEXT NOT NULL DEFAULT 'v1',
  contract_html         TEXT NOT NULL,
  contract_hash         TEXT NOT NULL,
  status                TEXT NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending', 'signed', 'voided')),
  initials              TEXT,
  signed_at             TIMESTAMPTZ,
  signer_ip             TEXT,
  signer_user_agent     TEXT,
  signed_contract_hash  TEXT,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (reservation_id)
);


-- 3. CREATE payments table
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS payments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id    UUID NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
  type              TEXT NOT NULL CHECK (type IN ('deposit', 'balance')),
  amount            NUMERIC(10,2) NOT NULL,
  amount_cents      INTEGER NOT NULL,
  currency          TEXT DEFAULT 'USD',
  square_payment_id TEXT,
  square_invoice_id TEXT,
  square_invoice_url TEXT,
  idempotency_key   TEXT NOT NULL UNIQUE,
  status            TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
  error_message     TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (reservation_id, type)
);


-- 4. CREATE stock_holds table
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS stock_holds (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id  UUID NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
  product_id      TEXT NOT NULL,
  quantity        INTEGER NOT NULL,
  event_date      DATE NOT NULL,
  return_date     DATE NOT NULL,
  status          TEXT NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active', 'confirmed', 'released', 'expired')),
  expires_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stock_holds_availability
  ON stock_holds (product_id, event_date, return_date)
  WHERE status IN ('active', 'confirmed');


-- 5. CREATE notifications table
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id  UUID NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
  type            TEXT NOT NULL,
  channel         TEXT NOT NULL CHECK (channel IN ('email', 'sms', 'whatsapp', 'ui')),
  recipient       TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'sent', 'failed', 'skipped')),
  payload         JSONB,
  sent_at         TIMESTAMPTZ,
  error_message   TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);


-- 6. CREATE idempotency_keys table
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS idempotency_keys (
  key             TEXT PRIMARY KEY,
  reservation_id  UUID REFERENCES reservations(id),
  operation       TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'processing'
                  CHECK (status IN ('processing', 'completed', 'failed')),
  response_data   JSONB,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  expires_at      TIMESTAMPTZ DEFAULT NOW() + INTERVAL '24 hours'
);

CREATE INDEX IF NOT EXISTS idx_idempotency_expires
  ON idempotency_keys (expires_at);


-- 7. CREATE reservation_status_log table (audit)
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS reservation_status_log (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id  UUID NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
  from_status     TEXT,
  to_status       TEXT NOT NULL,
  changed_by      TEXT DEFAULT 'system',
  reason          TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_status_log_reservation
  ON reservation_status_log (reservation_id, created_at);


-- 8. TRIGGERS
-- -----------------------------------------------------------

-- 8a. Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_reservations_updated_at ON reservations;
CREATE TRIGGER trg_reservations_updated_at
  BEFORE UPDATE ON reservations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_contracts_updated_at ON contracts;
CREATE TRIGGER trg_contracts_updated_at
  BEFORE UPDATE ON contracts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_payments_updated_at ON payments;
CREATE TRIGGER trg_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- 8b. Log status changes on reservations
CREATE OR REPLACE FUNCTION log_reservation_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO reservation_status_log (reservation_id, from_status, to_status, changed_by)
    VALUES (NEW.id, OLD.status, NEW.status, COALESCE(current_setting('app.changed_by', true), 'system'));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_log_status_change ON reservations;
CREATE TRIGGER trg_log_status_change
  AFTER UPDATE ON reservations
  FOR EACH ROW EXECUTE FUNCTION log_reservation_status_change();


-- 8c. Validate status transitions
CREATE OR REPLACE FUNCTION validate_status_transition()
RETURNS TRIGGER AS $$
DECLARE
  allowed TEXT[];
BEGIN
  -- Skip validation if status hasn't changed
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  -- Define allowed transitions
  CASE OLD.status
    WHEN 'pending_out_of_stock' THEN
      allowed := ARRAY['approved_waiting_contract', 'cancelled'];
    WHEN 'approved_waiting_contract' THEN
      allowed := ARRAY['contract_signed', 'cancelled', 'hold_expired'];
    WHEN 'contract_signed' THEN
      allowed := ARRAY['deposit_paid', 'cancelled', 'hold_expired'];
    WHEN 'deposit_paid' THEN
      allowed := ARRAY['balance_due', 'cancelled'];
    WHEN 'balance_due' THEN
      allowed := ARRAY['paid_in_full', 'cancelled'];
    WHEN 'paid_in_full' THEN
      allowed := ARRAY['completed', 'cancelled'];
    WHEN 'completed' THEN
      allowed := ARRAY[]::TEXT[];
    WHEN 'cancelled' THEN
      allowed := ARRAY[]::TEXT[];
    WHEN 'hold_expired' THEN
      allowed := ARRAY[]::TEXT[];
    -- Legacy statuses: allow any transition during migration
    WHEN 'pending' THEN
      allowed := ARRAY['confirmed', 'cancelled', 'pending_out_of_stock', 'approved_waiting_contract'];
    WHEN 'confirmed' THEN
      allowed := ARRAY['paid', 'cancelled', 'completed', 'contract_signed'];
    WHEN 'paid' THEN
      allowed := ARRAY['completed', 'cancelled'];
    ELSE
      -- Unknown status, allow transition
      RETURN NEW;
  END CASE;

  IF NOT (NEW.status = ANY(allowed)) THEN
    RAISE EXCEPTION 'Invalid status transition from "%" to "%"', OLD.status, NEW.status;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validate_status ON reservations;
CREATE TRIGGER trg_validate_status
  BEFORE UPDATE ON reservations
  FOR EACH ROW EXECUTE FUNCTION validate_status_transition();


-- 9. RPC: hold_stock (pessimistic locking)
-- -----------------------------------------------------------
CREATE OR REPLACE FUNCTION hold_stock(
  p_reservation_id UUID,
  p_items JSONB,
  p_event_date DATE,
  p_return_date DATE,
  p_hold_minutes INTEGER DEFAULT 30
) RETURNS JSONB AS $$
DECLARE
  item RECORD;
  total_stock_qty INTEGER;
  reserved_qty INTEGER;
  avail INTEGER;
  result JSONB := '[]'::JSONB;
  all_available BOOLEAN := true;
BEGIN
  -- Process items in deterministic order to prevent deadlocks
  FOR item IN
    SELECT * FROM jsonb_to_recordset(p_items)
      AS x(product_id TEXT, quantity INTEGER)
    ORDER BY product_id
  LOOP
    -- Lock the product row (prevents concurrent reads)
    SELECT total_stock INTO total_stock_qty
    FROM products
    WHERE id = item.product_id
    FOR UPDATE;

    IF total_stock_qty IS NULL THEN
      all_available := false;
      result := result || jsonb_build_object(
        'product_id', item.product_id,
        'available', false,
        'available_qty', 0,
        'requested_qty', item.quantity
      );
      CONTINUE;
    END IF;

    -- Sum reserved from active/confirmed holds for overlapping dates
    SELECT COALESCE(SUM(quantity), 0) INTO reserved_qty
    FROM stock_holds
    WHERE product_id = item.product_id
      AND status IN ('active', 'confirmed')
      AND event_date <= p_return_date
      AND return_date >= p_event_date;

    avail := total_stock_qty - reserved_qty;

    IF avail < item.quantity THEN
      all_available := false;
      result := result || jsonb_build_object(
        'product_id', item.product_id,
        'available', false,
        'available_qty', GREATEST(0, avail),
        'requested_qty', item.quantity
      );
    ELSE
      result := result || jsonb_build_object(
        'product_id', item.product_id,
        'available', true,
        'available_qty', avail,
        'requested_qty', item.quantity
      );
    END IF;
  END LOOP;

  -- Only create holds if ALL items are available
  IF all_available THEN
    FOR item IN
      SELECT * FROM jsonb_to_recordset(p_items)
        AS x(product_id TEXT, quantity INTEGER)
    LOOP
      INSERT INTO stock_holds (
        reservation_id, product_id, quantity,
        event_date, return_date, status, expires_at
      ) VALUES (
        p_reservation_id, item.product_id, item.quantity,
        p_event_date, p_return_date, 'active',
        NOW() + (p_hold_minutes || ' minutes')::INTERVAL
      );
    END LOOP;
  END IF;

  RETURN jsonb_build_object(
    'all_available', all_available,
    'items', result
  );
END;
$$ LANGUAGE plpgsql;


-- 10. RPC: release_holds (for cancellation/expiration)
-- -----------------------------------------------------------
CREATE OR REPLACE FUNCTION release_holds(p_reservation_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE stock_holds
  SET status = 'released'
  WHERE reservation_id = p_reservation_id
    AND status IN ('active', 'confirmed');
END;
$$ LANGUAGE plpgsql;


-- 11. RPC: confirm_holds (after contract signing)
-- -----------------------------------------------------------
CREATE OR REPLACE FUNCTION confirm_holds(p_reservation_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE stock_holds
  SET status = 'confirmed', expires_at = NULL
  WHERE reservation_id = p_reservation_id
    AND status = 'active';
END;
$$ LANGUAGE plpgsql;


-- 12. RPC: expire_stale_holds (called by cron)
-- -----------------------------------------------------------
CREATE OR REPLACE FUNCTION expire_stale_holds()
RETURNS INTEGER AS $$
DECLARE
  expired_count INTEGER := 0;
  hold_record RECORD;
BEGIN
  -- Find and expire holds that have passed their expiration
  FOR hold_record IN
    SELECT DISTINCT reservation_id
    FROM stock_holds
    WHERE status = 'active'
      AND expires_at IS NOT NULL
      AND expires_at < NOW()
  LOOP
    -- Release all holds for this reservation
    UPDATE stock_holds
    SET status = 'expired'
    WHERE reservation_id = hold_record.reservation_id
      AND status = 'active';

    -- Update reservation status
    UPDATE reservations
    SET status = 'hold_expired'
    WHERE id = hold_record.reservation_id
      AND status IN ('approved_waiting_contract', 'contract_signed');

    expired_count := expired_count + 1;
  END LOOP;

  RETURN expired_count;
END;
$$ LANGUAGE plpgsql;


-- 13. Enable RLS on new tables
-- -----------------------------------------------------------
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_holds ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE idempotency_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservation_status_log ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (Edge Functions use service role)
CREATE POLICY "Service role full access" ON contracts
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON payments
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON stock_holds
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON notifications
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON idempotency_keys
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON reservation_status_log
  FOR ALL USING (auth.role() = 'service_role');

-- Allow anon key read access for client-facing queries
CREATE POLICY "Anon read contracts" ON contracts
  FOR SELECT USING (true);
CREATE POLICY "Anon read payments" ON payments
  FOR SELECT USING (true);
CREATE POLICY "Anon read status log" ON reservation_status_log
  FOR SELECT USING (true);
