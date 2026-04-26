-- ============================================================
-- Add Pop Up Tent 10x20 product
-- Date: 2026-04-26
-- ============================================================

INSERT INTO products (id, name, name_es, category, price, total_stock) VALUES
  ('tent-popup-10x20',
   'Pop Up Tent 10x20',
   'Carpa Pop Up 10x20',
   'tents', 180.00, 5)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  name_es = EXCLUDED.name_es,
  category = EXCLUDED.category,
  price = EXCLUDED.price,
  total_stock = EXCLUDED.total_stock;
