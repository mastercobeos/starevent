-- ============================================================
-- Base Tables: reservations, products, reservation_items
-- Run this FIRST, before the upgrade migration
-- ============================================================

-- 1. PRODUCTS table
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
  id              TEXT PRIMARY KEY,
  name            TEXT NOT NULL,
  name_es         TEXT,
  category        TEXT,
  price           NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_stock     INTEGER NOT NULL DEFAULT 100,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access" ON products
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Anon read products" ON products
  FOR SELECT USING (true);

-- Insert all products from catalog
INSERT INTO products (id, name, name_es, category, price, total_stock) VALUES
  -- Chairs
  ('chair-resin',        'Resin Garden Chair',       'Silla de Resina de Jardín',      'chairs',      3.00,  200),
  ('chair-wood',         'Wooden Chair',             'Silla de Madera',                'chairs',      4.00,  200),
  ('chair-chiavari',     'Chiavari Chair',           'Silla Chiavari',                 'chairs',      5.00,  200),
  ('chair-kid-chiavari', 'Kid Chiavari Chair',       'Silla Chiavari para Niños',      'chairs',      5.00,  50),
  -- Tables
  ('table-6ft',          '6 FT Rectangular Table',   'Mesa Rectangular de 6 pies',     'tables',      8.00,  50),
  ('table-8ft',          '8 FT Rectangular Table',   'Mesa Rectangular de 8 pies',     'tables',     10.00,  50),
  ('table-round',        '60" Round Table',          'Mesa Redonda de 60"',            'tables',     12.00,  30),
  ('table-cocktail',     'Cocktail Table',           'Mesa Cocktail',                  'tables',     15.00,  20),
  -- Tablecloths
  ('cloth-white',        'White Tablecloth',         'Mantel Blanco',                  'tablecloths', 10.00, 100),
  ('cloth-color',        'Colored Tablecloth',       'Mantel de Color',                'tablecloths', 12.00, 100),
  -- Tents
  ('tent-20x20',         'Tent 20x20',              'Carpa 20x20',                    'tents',      250.00,  5),
  ('tent-20x32',         'Tent 20x32',              'Carpa 20x32',                    'tents',      350.00,  3),
  ('tent-20x40',         'Tent 20x40',              'Carpa 20x40',                    'tents',      450.00,  5),
  ('tent-20x60',         'Tent 20x60',              'Carpa 20x60',                    'tents',      700.00,  2),
  ('tent-hp-20x20',      'High Peak 20x20',         'High Peak 20x20',               'tents',      550.00,  3),
  ('tent-hp-20x40',      'High Peak 20x40',         'High Peak 20x40',               'tents',     1200.00,  2),
  ('tent-clear-20x40',   'Clear Tent 20x40',        'Carpa Transparente 20x40',      'tents',      750.00,  2),
  -- Others
  ('heater',             'Heater',                   'Calentador',                     'others',      65.00, 10),
  ('cooler',             'Cooler',                   'Enfriador',                      'others',     120.00,  5),
  ('plates',             'Plates',                   'Platos',                         'others',       2.00, 500),
  ('gas-propane',        'Gas Propane',              'Gas Propano',                    'others',      20.00, 20),
  ('dancefloor-16x16',   'Dance Floor 16x16',       'Pista de Baile 16x16',          'others',     750.00,  2),
  ('dancefloor-12x12',   'Dance Floor 12x12',       'Pista de Baile 12x12',          'others',     500.00,  2),
  ('garden-lights',      'Garden Lights (48 ft)',    'Luces de Jardín (48 pies)',      'others',      50.00, 20),
  ('water-barrel',       'Water Barrel',             'Barril de Agua',                 'others',      30.00, 30),
  -- Packages
  ('pkg-deluxe-20x40',   'Deluxe Package 20x40',    'Paquete Deluxe 20x40',          'packages',  1299.00,  5),
  ('pkg-deluxe-20x32',   'Deluxe Package 20x32',    'Paquete Deluxe 20x32',          'packages',  1100.00,  3),
  ('pkg-deluxe-20x20',   'Deluxe Package 20x20',    'Paquete Deluxe 20x20',          'packages',   789.00,  5),
  ('pkg-basic-20x40',    'Basic Package 20x40',     'Paquete Básico 20x40',          'packages',   849.00,  5),
  ('pkg-basic-20x32',    'Basic Package 20x32',     'Paquete Básico 20x32',          'packages',   599.00,  3),
  ('pkg-basic-20x20',    'Basic Package 20x20',     'Paquete Básico 20x20',          'packages',   399.00,  5)
ON CONFLICT (id) DO NOTHING;


-- 2. RESERVATIONS table
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS reservations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name     TEXT,
  client_email    TEXT NOT NULL,
  client_phone    TEXT,
  event_date      DATE NOT NULL,
  return_date     DATE NOT NULL,
  event_address   TEXT,
  total           NUMERIC(10,2) NOT NULL DEFAULT 0,
  status          TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'confirmed', 'paid', 'completed', 'cancelled')),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access" ON reservations
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Anon read reservations" ON reservations
  FOR SELECT USING (true);


-- 3. RESERVATION_ITEMS table
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS reservation_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id  UUID NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
  product_id      TEXT NOT NULL REFERENCES products(id),
  quantity        INTEGER NOT NULL,
  unit_price      NUMERIC(10,2) NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE reservation_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access" ON reservation_items
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Anon read reservation_items" ON reservation_items
  FOR SELECT USING (true);
