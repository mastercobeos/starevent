-- ============================================================
-- Package Decomposition: packages deduct from general inventory
-- Date: 2026-03-04
--
-- When a package is reserved, its component products (tents,
-- tables, chairs, lights) are held from general inventory,
-- preventing overbooking.
-- ============================================================

-- 1. Create package_items table (maps packages → components)
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS package_items (
  package_id   TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  component_id TEXT NOT NULL REFERENCES products(id),
  quantity     INTEGER NOT NULL CHECK (quantity > 0),
  PRIMARY KEY (package_id, component_id)
);

ALTER TABLE package_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access" ON package_items
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Anon read package_items" ON package_items
  FOR SELECT USING (true);


-- 2. Re-add packages to products (virtual, total_stock=999)
-- -----------------------------------------------------------
INSERT INTO products (id, name, name_es, category, price, total_stock) VALUES
  ('pkg-deluxe-20x40', 'Deluxe Package 20x40', 'Paquete Deluxe 20x40', 'packages', 1299.00, 999),
  ('pkg-deluxe-20x32', 'Deluxe Package 20x32', 'Paquete Deluxe 20x32', 'packages', 1100.00, 999),
  ('pkg-deluxe-20x20', 'Deluxe Package 20x20', 'Paquete Deluxe 20x20', 'packages',  789.00, 999),
  ('pkg-basic-20x40',  'Basic Package 20x40',  'Paquete Básico 20x40', 'packages',  849.00, 999),
  ('pkg-basic-20x32',  'Basic Package 20x32',  'Paquete Básico 20x32', 'packages',  599.00, 999),
  ('pkg-basic-20x20',  'Basic Package 20x20',  'Paquete Básico 20x20', 'packages',  399.00, 999)
ON CONFLICT (id) DO UPDATE SET
  total_stock = EXCLUDED.total_stock,
  price = EXCLUDED.price;


-- 3. Populate package components (only tracked inventory items)
--    NOT tracked (always available): tablecloths, chandeliers, draping, cake table
-- -----------------------------------------------------------
INSERT INTO package_items (package_id, component_id, quantity) VALUES
  -- Deluxe 20x40: tent, 7 tables 6ft, 70 resin chairs, 1 garden lights
  ('pkg-deluxe-20x40', 'tent-20x40',    1),
  ('pkg-deluxe-20x40', 'table-6ft',     7),
  ('pkg-deluxe-20x40', 'chair-resin',  70),
  ('pkg-deluxe-20x40', 'garden-lights', 1),

  -- Deluxe 20x32: tent, 6 round tables, 48 resin chairs, 1 garden lights
  ('pkg-deluxe-20x32', 'tent-20x32',    1),
  ('pkg-deluxe-20x32', 'table-round',   6),
  ('pkg-deluxe-20x32', 'chair-resin',  48),
  ('pkg-deluxe-20x32', 'garden-lights', 1),

  -- Deluxe 20x20: tent, 3 tables 6ft, 30 resin chairs, 1 garden lights
  ('pkg-deluxe-20x20', 'tent-20x20',    1),
  ('pkg-deluxe-20x20', 'table-6ft',     3),
  ('pkg-deluxe-20x20', 'chair-resin',  30),
  ('pkg-deluxe-20x20', 'garden-lights', 1),

  -- Basic 20x40: tent, 7 tables 6ft, 70 resin chairs, 1 garden lights
  ('pkg-basic-20x40', 'tent-20x40',    1),
  ('pkg-basic-20x40', 'table-6ft',     7),
  ('pkg-basic-20x40', 'chair-resin',  70),
  ('pkg-basic-20x40', 'garden-lights', 1),

  -- Basic 20x32: tent, 6 round tables, 48 resin chairs, 1 garden lights
  ('pkg-basic-20x32', 'tent-20x32',    1),
  ('pkg-basic-20x32', 'table-round',   6),
  ('pkg-basic-20x32', 'chair-resin',  48),
  ('pkg-basic-20x32', 'garden-lights', 1),

  -- Basic 20x20: tent, 3 tables 6ft, 30 resin chairs, 1 garden lights
  ('pkg-basic-20x20', 'tent-20x20',    1),
  ('pkg-basic-20x20', 'table-6ft',     3),
  ('pkg-basic-20x20', 'chair-resin',  30),
  ('pkg-basic-20x20', 'garden-lights', 1)
ON CONFLICT (package_id, component_id) DO NOTHING;


-- 4. Replace hold_stock() to expand packages into components
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
  pkg_component RECORD;
  expanded JSONB := '[]'::JSONB;
  total_stock_qty INTEGER;
  reserved_qty INTEGER;
  avail INTEGER;
  result JSONB := '[]'::JSONB;
  all_available BOOLEAN := true;
BEGIN
  -- PHASE 1: Expand packages into component items
  FOR item IN
    SELECT * FROM jsonb_to_recordset(p_items)
      AS x(product_id TEXT, quantity INTEGER)
  LOOP
    IF EXISTS (SELECT 1 FROM package_items WHERE package_id = item.product_id) THEN
      -- Package: expand into components (multiply by ordered qty)
      FOR pkg_component IN
        SELECT component_id, pi.quantity AS comp_qty
        FROM package_items pi
        WHERE pi.package_id = item.product_id
      LOOP
        expanded := expanded || jsonb_build_object(
          'product_id', pkg_component.component_id,
          'quantity', pkg_component.comp_qty * item.quantity
        );
      END LOOP;
    ELSE
      -- Regular product: pass through as-is
      expanded := expanded || jsonb_build_object(
        'product_id', item.product_id,
        'quantity', item.quantity
      );
    END IF;
  END LOOP;

  -- PHASE 2: Aggregate duplicates (e.g. package chairs + individual chairs)
  expanded := (
    SELECT COALESCE(
      jsonb_agg(jsonb_build_object('product_id', agg.pid, 'quantity', agg.total_qty)),
      '[]'::JSONB
    )
    FROM (
      SELECT e.product_id AS pid, SUM(e.quantity)::INTEGER AS total_qty
      FROM jsonb_to_recordset(expanded) AS e(product_id TEXT, quantity INTEGER)
      GROUP BY e.product_id
    ) agg
  );

  -- PHASE 3: Check availability (deterministic order to prevent deadlocks)
  FOR item IN
    SELECT * FROM jsonb_to_recordset(expanded)
      AS x(product_id TEXT, quantity INTEGER)
    ORDER BY product_id
  LOOP
    -- Lock the product row
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

  -- PHASE 4: Create holds on EXPANDED component items (not packages)
  IF all_available THEN
    FOR item IN
      SELECT * FROM jsonb_to_recordset(expanded)
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
