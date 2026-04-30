-- ============================================================
-- Tent Draping Bundle addons
-- Date: 2026-04-30
--
-- Adds bundled "with addons" SKUs for 6 tents.
-- Frontend appends "-with-addons" to the product id when the
-- "With Draping + Chandelier" checkbox is selected, and the
-- server-side price verification fetches the bundled price
-- directly from these rows.
--
-- Bundle includes: Draping + Chandelier (Garden Lights are
-- already part of the base tent).
-- ============================================================

INSERT INTO products (id, name, name_es, category, price, total_stock) VALUES
  -- Pop Up Tent 10x20: $150 base -> $500 bundled
  ('tent-popup-10x20-with-addons',
   'Pop Up Tent 10x20 + Draping + Chandelier',
   'Carpa Pop Up 10x20 + Drapeado + Candelabro',
   'tents', 500.00, 1),

  -- Tent 10x30: $180 base -> $700 bundled
  ('tent-10x30-with-addons',
   'Tent 10x30 + Draping + Chandelier',
   'Carpa 10x30 + Drapeado + Candelabro',
   'tents', 700.00, 1),

  -- Tent 10x40: $250 base -> $850 bundled
  ('tent-10x40-with-addons',
   'Tent 10x40 + Draping + Chandelier',
   'Carpa 10x40 + Drapeado + Candelabro',
   'tents', 850.00, 1),

  -- Tent 20x20: $250 base -> $650 bundled
  ('tent-20x20-with-addons',
   'Tent 20x20 + Draping + Chandelier',
   'Carpa 20x20 + Drapeado + Candelabro',
   'tents', 650.00, 1),

  -- Tent 20x32: $350 base -> $750 bundled
  ('tent-20x32-with-addons',
   'Tent 20x32 + Draping + Chandelier',
   'Carpa 20x32 + Drapeado + Candelabro',
   'tents', 750.00, 1),

  -- Tent 20x40: $450 base -> $900 bundled
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
