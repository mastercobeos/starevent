-- ============================================================
-- Tents update: new sizes (10x20/10x30/10x40), West Coast 40x40,
-- walls addon ($2/unit), price fixes, normalize categories
-- Date: 2026-04-26
-- ============================================================

-- 1. Pop Up Tent 10x20 -> $150 (was $180)
INSERT INTO products (id, name, name_es, category, price, total_stock) VALUES
  ('tent-popup-10x20', 'Pop Up Tent 10x20', 'Carpa Pop Up 10x20', 'tents', 150.00, 1)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  name_es = EXCLUDED.name_es,
  category = EXCLUDED.category,
  price = EXCLUDED.price,
  total_stock = EXCLUDED.total_stock;

-- 2. Tent 10x30 -> new
INSERT INTO products (id, name, name_es, category, price, total_stock) VALUES
  ('tent-10x30', 'Tent 10x30', 'Carpa 10x30', 'tents', 180.00, 1)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  name_es = EXCLUDED.name_es,
  category = EXCLUDED.category,
  price = EXCLUDED.price,
  total_stock = EXCLUDED.total_stock;

-- 3. Tent 10x40 -> new
INSERT INTO products (id, name, name_es, category, price, total_stock) VALUES
  ('tent-10x40', 'Tent 10x40', 'Carpa 10x40', 'tents', 250.00, 1)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  name_es = EXCLUDED.name_es,
  category = EXCLUDED.category,
  price = EXCLUDED.price,
  total_stock = EXCLUDED.total_stock;

-- 4. West Coast 40x40 -> was missing in DB
INSERT INTO products (id, name, name_es, category, price, total_stock) VALUES
  ('tent-wc-40x40', 'West Coast 40x40', 'West Coast 40x40', 'tents', 1946.00, 1)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  name_es = EXCLUDED.name_es,
  category = EXCLUDED.category,
  price = EXCLUDED.price,
  total_stock = EXCLUDED.total_stock;

-- 5. Tent Wall (addon, $2.00 per panel)
INSERT INTO products (id, name, name_es, category, price, total_stock) VALUES
  ('tent-wall', 'Tent Wall', 'Pared para Carpa', 'addons', 2.00, 200)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  name_es = EXCLUDED.name_es,
  category = EXCLUDED.category,
  price = EXCLUDED.price,
  total_stock = EXCLUDED.total_stock;

-- 6. Fix prices to match homeData.js source of truth
UPDATE products SET price = 250.00 WHERE id = 'tent-20x20';
UPDATE products SET price = 450.00 WHERE id = 'tent-20x40';

-- 7. Normalize categories to lowercase (fixes Tents/Tables/Chairs/Others mix)
UPDATE products SET category = lower(category) WHERE category <> lower(category);
