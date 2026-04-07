-- ============================================================
-- Add missing products that exist in frontend but not in DB
-- Date: 2026-04-04
--
-- Without these, checkout fails with "Product not found" error.
-- ============================================================

-- 1. Add missing individual products
INSERT INTO products (id, name, name_es, category, price, total_stock) VALUES
  -- Proposal Arch (without addon)
  ('proposal-arch-decor',
   'Proposal Arch Decor',
   'Decoracion Arco de Propuesta',
   'others', 650.00, 2),

  -- Proposal Arch WITH cold sparklers addon (frontend appends "-with-addons" to id)
  ('proposal-arch-decor-with-addons',
   'Proposal Arch Decor + 2 Machine Cold Sparkling',
   'Decoracion Arco de Propuesta + 2 Maquinas de Chispas Frias',
   'others', 800.00, 2),

  -- West Coast 40x40 tent
  ('tent-wc-40x40',
   'West Coast 40x40',
   'West Coast 40x40',
   'tents', 1946.00, 1)
ON CONFLICT (id) DO UPDATE SET
  price = EXCLUDED.price,
  total_stock = EXCLUDED.total_stock;


-- 2. Add missing package: Basic 40x40
INSERT INTO products (id, name, name_es, category, price, total_stock) VALUES
  ('pkg-basic-40x40',
   'Basic Package 40x40',
   'Paquete Basico 40x40',
   'packages', 2939.00, 999)
ON CONFLICT (id) DO UPDATE SET
  price = EXCLUDED.price,
  total_stock = EXCLUDED.total_stock;


-- 3. Add package components for Basic 40x40
--    From frontend: 150 Garden Chairs, 19 Round Tables,
--    19 Tablecloths (not tracked), 2 Food Tables 8ft,
--    Water Barrels, Garden Lights
--    + West Coast 40x40 tent
INSERT INTO package_items (package_id, component_id, quantity) VALUES
  ('pkg-basic-40x40', 'tent-wc-40x40',  1),
  ('pkg-basic-40x40', 'chair-resin',  150),
  ('pkg-basic-40x40', 'table-round',   19),
  ('pkg-basic-40x40', 'table-8ft',      2),
  ('pkg-basic-40x40', 'water-barrel',   8),
  ('pkg-basic-40x40', 'garden-lights',  1)
ON CONFLICT (package_id, component_id) DO NOTHING;
