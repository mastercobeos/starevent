-- Tighten RLS policies: remove overly permissive anonymous access to sensitive tables

-- Drop the overly permissive "anon read all" policies on sensitive tables
DROP POLICY IF EXISTS "Anon read reservations" ON reservations;
DROP POLICY IF EXISTS "Anon read reservation_items" ON reservation_items;

-- Reservations: only service_role can read (backend API routes use service_role key)
CREATE POLICY "Service role read reservations" ON reservations
  FOR SELECT USING (auth.role() = 'service_role');

-- Reservation items: only service_role can read
CREATE POLICY "Service role read reservation_items" ON reservation_items
  FOR SELECT USING (auth.role() = 'service_role');

-- Contracts: only service_role (contains PII + legal documents)
DROP POLICY IF EXISTS "Anon read contracts" ON contracts;
CREATE POLICY "Service role read contracts" ON contracts
  FOR SELECT USING (auth.role() = 'service_role');

-- Payments: only service_role (contains financial data)
DROP POLICY IF EXISTS "Anon read payments" ON payments;
CREATE POLICY "Service role read payments" ON payments
  FOR SELECT USING (auth.role() = 'service_role');

-- Stock holds: only service_role
DROP POLICY IF EXISTS "Anon read stock_holds" ON stock_holds;
CREATE POLICY "Service role read stock_holds" ON stock_holds
  FOR SELECT USING (auth.role() = 'service_role');

-- Notifications: only service_role
DROP POLICY IF EXISTS "Anon read notifications" ON notifications;
CREATE POLICY "Service role read notifications" ON notifications
  FOR SELECT USING (auth.role() = 'service_role');

-- Idempotency keys: only service_role
DROP POLICY IF EXISTS "Anon read idempotency_keys" ON idempotency_keys;
CREATE POLICY "Service role read idempotency_keys" ON idempotency_keys
  FOR SELECT USING (auth.role() = 'service_role');

-- Status log: only service_role
DROP POLICY IF EXISTS "Anon read reservation_status_log" ON reservation_status_log;
CREATE POLICY "Service role read reservation_status_log" ON reservation_status_log
  FOR SELECT USING (auth.role() = 'service_role');

-- Products remain publicly readable (catalog data, no PII)
-- "Anon read products" policy is kept as-is
