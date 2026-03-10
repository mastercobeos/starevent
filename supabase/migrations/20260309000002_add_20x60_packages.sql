-- ============================================================
-- Re-add products missing from DB but still offered in frontend
-- (were deleted in 20260303000002_update_real_inventory)
-- Also adds missing 20x60 packages.
-- ============================================================

-- 1. Re-add individual products deleted but still in frontend
INSERT INTO products (id, name, name_es, category, price, total_stock) VALUES
  ('tent-20x60',       'Tent 20x60',           'Carpa 20x60',                    'tents',       700.00,   2),
  ('chair-wood',       'Wooden Chair',          'Silla de Madera',                'chairs',        4.00, 200),
  ('cloth-white',      'White Tablecloth',      'Mantel Blanco',                  'tablecloths',  10.00, 100),
  ('cloth-color',      'Colored Tablecloth',    'Mantel de Color',                'tablecloths',  12.00, 100),
  ('plates',           'Plates',                'Platos',                         'others',        2.00, 500),
  ('gas-propane',      'Gas Propane',           'Gas Propano',                    'others',       20.00,  20),
  ('dancefloor-16x16', 'Dance Floor 16x16',     'Pista de Baile 16x16',          'others',      750.00,   2),
  ('dancefloor-12x12', 'Dance Floor 12x12',     'Pista de Baile 12x12',          'others',      500.00,   2)
ON CONFLICT (id) DO UPDATE SET
  total_stock = EXCLUDED.total_stock,
  price = EXCLUDED.price;

-- 2. Add 20x60 package products
INSERT INTO products (id, name, name_es, category, price, total_stock) VALUES
  ('pkg-deluxe-20x60-premium', 'Deluxe Package 20x60 Premium', 'Paquete Deluxe 20x60 Premium', 'packages', 2119.00, 999),
  ('pkg-basic-20x60',          'Basic Package 20x60',          'Paquete Básico 20x60',         'packages', 1370.00, 999)
ON CONFLICT (id) DO UPDATE SET
  total_stock = EXCLUDED.total_stock,
  price = EXCLUDED.price;

-- 3. Add package components (tracked inventory items only)
--    NOT tracked: tablecloths, chandeliers, draping, cake table, walls
INSERT INTO package_items (package_id, component_id, quantity) VALUES
  -- Deluxe 20x60 Premium: tent, 15 round tables, 120 resin chairs, 1 garden lights
  ('pkg-deluxe-20x60-premium', 'tent-20x60',    1),
  ('pkg-deluxe-20x60-premium', 'table-round',  15),
  ('pkg-deluxe-20x60-premium', 'chair-resin', 120),
  ('pkg-deluxe-20x60-premium', 'garden-lights', 1),

  -- Basic 20x60: tent, 15 round tables, 120 resin chairs, 1 garden lights
  ('pkg-basic-20x60', 'tent-20x60',    1),
  ('pkg-basic-20x60', 'table-round',  15),
  ('pkg-basic-20x60', 'chair-resin', 120),
  ('pkg-basic-20x60', 'garden-lights', 1)
ON CONFLICT (package_id, component_id) DO NOTHING;
