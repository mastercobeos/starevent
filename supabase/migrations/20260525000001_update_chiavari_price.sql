-- ============================================================
-- Update Chiavari Chair price: $5.00 -> $8.00
-- (Only the adult Chiavari; Kid Chiavari unchanged)
-- ============================================================

UPDATE products SET price = 8.00 WHERE id = 'chair-chiavari';
