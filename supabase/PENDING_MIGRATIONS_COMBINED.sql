-- ============================================================================
-- COMBINED PENDING MIGRATIONS — paste into Supabase SQL Editor → Run
-- ============================================================================
-- This file bundles, IN ORDER, the 4 migrations that are likely pending on
-- production. Each block is idempotent (uses ON CONFLICT / IF NOT EXISTS) so
-- running this on a DB that already has some of them applied is SAFE — already
-- present rows are updated, not duplicated.
--
-- After running, verify with:
--   SELECT id, name, price, total_stock FROM products ORDER BY category, id;
--
-- Migrations included:
--   1) 20260404000001_add_missing_products      (proposal-arch + tent-wc-40x40 + pkg-basic-40x40)
--   2) 20260426000001_tents_update_and_walls    (new 10x_ tents, walls addon, price fixes)
--   3) 20260430000001_tent_draping_addons       (6 "-with-addons" tent SKUs)
--   4) 20260525000001_update_chiavari_price     (chair-chiavari $5 -> $8)
-- ============================================================================


-- ──────────────────────────────────────────────────────────────────────────────
-- 1) 20260404000001_add_missing_products
-- ──────────────────────────────────────────────────────────────────────────────

INSERT INTO products (id, name, name_es, category, price, total_stock) VALUES
  ('proposal-arch-decor',
   'Proposal Arch Decor',
   'Decoracion Arco de Propuesta',
   'others', 650.00, 2),

  ('proposal-arch-decor-with-addons',
   'Proposal Arch Decor + 2 Machine Cold Sparkling',
   'Decoracion Arco de Propuesta + 2 Maquinas de Chispas Frias',
   'others', 800.00, 2),

  ('tent-wc-40x40',
   'West Coast 40x40',
   'West Coast 40x40',
   'tents', 1946.00, 1)
ON CONFLICT (id) DO UPDATE SET
  price = EXCLUDED.price,
  total_stock = EXCLUDED.total_stock;

INSERT INTO products (id, name, name_es, category, price, total_stock) VALUES
  ('pkg-basic-40x40',
   'Basic Package 40x40',
   'Paquete Basico 40x40',
   'packages', 2939.00, 999)
ON CONFLICT (id) DO UPDATE SET
  price = EXCLUDED.price,
  total_stock = EXCLUDED.total_stock;

INSERT INTO package_items (package_id, component_id, quantity) VALUES
  ('pkg-basic-40x40', 'tent-wc-40x40',  1),
  ('pkg-basic-40x40', 'chair-resin',  150),
  ('pkg-basic-40x40', 'table-round',   19),
  ('pkg-basic-40x40', 'table-8ft',      2),
  ('pkg-basic-40x40', 'water-barrel',   8),
  ('pkg-basic-40x40', 'garden-lights',  1)
ON CONFLICT (package_id, component_id) DO NOTHING;


-- ──────────────────────────────────────────────────────────────────────────────
-- 2) 20260426000001_tents_update_and_walls
-- ──────────────────────────────────────────────────────────────────────────────

INSERT INTO products (id, name, name_es, category, price, total_stock) VALUES
  ('tent-popup-10x20', 'Pop Up Tent 10x20', 'Carpa Pop Up 10x20', 'tents', 150.00, 1)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  name_es = EXCLUDED.name_es,
  category = EXCLUDED.category,
  price = EXCLUDED.price,
  total_stock = EXCLUDED.total_stock;

INSERT INTO products (id, name, name_es, category, price, total_stock) VALUES
  ('tent-10x30', 'Tent 10x30', 'Carpa 10x30', 'tents', 180.00, 1)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  name_es = EXCLUDED.name_es,
  category = EXCLUDED.category,
  price = EXCLUDED.price,
  total_stock = EXCLUDED.total_stock;

INSERT INTO products (id, name, name_es, category, price, total_stock) VALUES
  ('tent-10x40', 'Tent 10x40', 'Carpa 10x40', 'tents', 250.00, 1)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  name_es = EXCLUDED.name_es,
  category = EXCLUDED.category,
  price = EXCLUDED.price,
  total_stock = EXCLUDED.total_stock;

INSERT INTO products (id, name, name_es, category, price, total_stock) VALUES
  ('tent-wc-40x40', 'West Coast 40x40', 'West Coast 40x40', 'tents', 1946.00, 1)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  name_es = EXCLUDED.name_es,
  category = EXCLUDED.category,
  price = EXCLUDED.price,
  total_stock = EXCLUDED.total_stock;

INSERT INTO products (id, name, name_es, category, price, total_stock) VALUES
  ('tent-wall', 'Tent Wall', 'Pared para Carpa', 'addons', 2.00, 200)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  name_es = EXCLUDED.name_es,
  category = EXCLUDED.category,
  price = EXCLUDED.price,
  total_stock = EXCLUDED.total_stock;

UPDATE products SET price = 250.00 WHERE id = 'tent-20x20';
UPDATE products SET price = 450.00 WHERE id = 'tent-20x40';

UPDATE products SET category = lower(category) WHERE category <> lower(category);


-- ──────────────────────────────────────────────────────────────────────────────
-- 3) 20260430000001_tent_draping_addons
-- ──────────────────────────────────────────────────────────────────────────────

INSERT INTO products (id, name, name_es, category, price, total_stock) VALUES
  ('tent-popup-10x20-with-addons',
   'Pop Up Tent 10x20 + Draping + Chandelier',
   'Carpa Pop Up 10x20 + Drapeado + Candelabro',
   'tents', 500.00, 1),

  ('tent-10x30-with-addons',
   'Tent 10x30 + Draping + Chandelier',
   'Carpa 10x30 + Drapeado + Candelabro',
   'tents', 700.00, 1),

  ('tent-10x40-with-addons',
   'Tent 10x40 + Draping + Chandelier',
   'Carpa 10x40 + Drapeado + Candelabro',
   'tents', 850.00, 1),

  ('tent-20x20-with-addons',
   'Tent 20x20 + Draping + Chandelier',
   'Carpa 20x20 + Drapeado + Candelabro',
   'tents', 650.00, 1),

  ('tent-20x32-with-addons',
   'Tent 20x32 + Draping + Chandelier',
   'Carpa 20x32 + Drapeado + Candelabro',
   'tents', 750.00, 1),

  ('tent-20x40-with-addons',
   'Tent 20x40 + Draping + Chandelier',
   'Carpa 20x40 + Drapeado + Candelabro',
   'tents', 900.00, 1)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  name_es = EXCLUDED.name_es,
  category = EXCLUDED.category,
  price = EXCLUDED.price,
  total_stock = EXCLUDED.total_stock;


-- ──────────────────────────────────────────────────────────────────────────────
-- 4) 20260525000001_update_chiavari_price
-- ──────────────────────────────────────────────────────────────────────────────

UPDATE products SET price = 8.00 WHERE id = 'chair-chiavari';


-- ──────────────────────────────────────────────────────────────────────────────
-- Done. Verify with:
--   SELECT id, name, price, total_stock FROM products WHERE id IN (
--     'proposal-arch-decor', 'proposal-arch-decor-with-addons',
--     'tent-wc-40x40', 'pkg-basic-40x40',
--     'tent-popup-10x20', 'tent-10x30', 'tent-10x40', 'tent-wall',
--     'tent-popup-10x20-with-addons', 'tent-10x30-with-addons',
--     'tent-10x40-with-addons', 'tent-20x20-with-addons',
--     'tent-20x32-with-addons', 'tent-20x40-with-addons',
--     'chair-chiavari'
--   ) ORDER BY id;
-- ──────────────────────────────────────────────────────────────────────────────
