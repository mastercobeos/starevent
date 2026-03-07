-- ============================================================
-- Update inventory to match real physical stock counts
-- Date: 2026-03-03
-- This migration syncs the products table with the actual
-- physical inventory. Run against Supabase if re-deploying.
-- ============================================================

-- 1. Remove products that no longer exist in physical inventory
-- -----------------------------------------------------------
DELETE FROM reservation_items WHERE product_id IN (
  'chair-garden', 'chair-wood', 'cloth-color', 'cloth-white',
  'chandelier', 'walls-draping', 'dancefloor-12x12', 'dancefloor-16x16',
  'gas-propane', 'plates', 'tent-20x60',
  'pkg-deluxe-20x40', 'pkg-deluxe-20x32', 'pkg-deluxe-20x20',
  'pkg-basic-20x40', 'pkg-basic-20x32', 'pkg-basic-20x20'
);

DELETE FROM stock_holds WHERE product_id IN (
  'chair-garden', 'chair-wood', 'cloth-color', 'cloth-white',
  'chandelier', 'walls-draping', 'dancefloor-12x12', 'dancefloor-16x16',
  'gas-propane', 'plates', 'tent-20x60',
  'pkg-deluxe-20x40', 'pkg-deluxe-20x32', 'pkg-deluxe-20x20',
  'pkg-basic-20x40', 'pkg-basic-20x32', 'pkg-basic-20x20'
);

DELETE FROM products WHERE id IN (
  'chair-garden', 'chair-wood', 'cloth-color', 'cloth-white',
  'chandelier', 'walls-draping', 'dancefloor-12x12', 'dancefloor-16x16',
  'gas-propane', 'plates', 'tent-20x60',
  'pkg-deluxe-20x40', 'pkg-deluxe-20x32', 'pkg-deluxe-20x20',
  'pkg-basic-20x40', 'pkg-basic-20x32', 'pkg-basic-20x20'
);

-- 2. Update existing products with real stock counts
-- -----------------------------------------------------------

-- Tables
UPDATE products SET total_stock = 10  WHERE id = 'table-6ft';       -- Mesas de 6 pies
UPDATE products SET total_stock = 15  WHERE id = 'table-8ft';       -- Mesas de 8 pies
UPDATE products SET total_stock = 10  WHERE id = 'table-round';     -- Mesas redondas
UPDATE products SET total_stock = 10  WHERE id = 'table-cocktail';  -- Mesas de coctel

-- Chairs
UPDATE products SET total_stock = 200 WHERE id = 'chair-resin';       -- Sillas de resina blanca
UPDATE products SET total_stock = 200 WHERE id = 'chair-chiavari';    -- Sillas chiavari
UPDATE products SET total_stock = 10  WHERE id = 'chair-kid-chiavari'; -- Sillas de Niño

-- Tents
UPDATE products SET total_stock = 2 WHERE id = 'tent-20x20';       -- Carpas de 20x20
UPDATE products SET total_stock = 2 WHERE id = 'tent-20x32';       -- Carpas de 20x32
UPDATE products SET total_stock = 2 WHERE id = 'tent-20x40';       -- Carpa de 20x40
UPDATE products SET total_stock = 1 WHERE id = 'tent-clear-20x40'; -- Carpa Clear
UPDATE products SET total_stock = 2 WHERE id = 'tent-hp-20x20';    -- Carpa High Peak 20x20
UPDATE products SET total_stock = 2 WHERE id = 'tent-hp-20x40';    -- Carpa High Peak 20x40

-- Others
UPDATE products SET total_stock = 5 WHERE id = 'heater';        -- Heaters
UPDATE products SET total_stock = 2 WHERE id = 'cooler';         -- Coolers
UPDATE products SET total_stock = 8 WHERE id = 'water-barrel';   -- Barriles de peso
UPDATE products SET total_stock = 8 WHERE id = 'garden-lights';  -- Garden lights

-- 3. Add new products from real inventory
-- -----------------------------------------------------------
INSERT INTO products (id, name, name_es, category, price, total_stock) VALUES
  ('weight-bag',    'Weight Bag',     'Bolsa de Peso',    'others', 5.00,  10),
  ('charger-plate', 'Charger Plate',  'Plato Base',       'others', 3.00, 100)
ON CONFLICT (id) DO UPDATE SET
  total_stock = EXCLUDED.total_stock;
