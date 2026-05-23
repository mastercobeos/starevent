-- ═══════════════════════════════════════════════════════════════
-- REVERT — Restaurar 5 reservas con eventos futuros que se expiraron
-- accidentalmente al testear expire_stale_holds().
--
-- Cómo correr:
--   1. Abrir Supabase Dashboard → SQL Editor → New query
--   2. Pegar TODO este archivo
--   3. Run
--   4. Verificar la salida del SELECT al final
-- ═══════════════════════════════════════════════════════════════

BEGIN;

-- Paso 1: Deshabilitar trigger de validación de transiciones (hold_expired es terminal por defecto)
ALTER TABLE reservations DISABLE TRIGGER trg_validate_status;

-- Paso 2: Revertir status de las 5 reservas con eventos futuros
UPDATE reservations
SET status = 'approved_waiting_contract'
WHERE id IN (
  '1fa93d50-ca5f-4648-8e90-12497800d92b',  -- Elizabeth Hinojosa, May 23 (HOY), $2413.82
  'ca42e3a3-8500-4b3f-bcec-99259d8454c4',  -- Chloe Peterson, May 29, $219.03
  '4102f3c8-276e-4150-81e9-b616b2356627',  -- Leah Clark, May 30, $363.72
  '0bc4f840-3fe7-4b1f-883d-4431ed0e9f2a',  -- Syed Rashid, May 30, $308.51
  'aa7d328b-ca51-47b4-be6b-804d3703da10'   -- Nicholas Barrington, Jun 13, $993.74
);

-- Paso 3: Reactivar stock holds con expiración a 72h
UPDATE stock_holds
SET status = 'active',
    expires_at = NOW() + INTERVAL '72 hours'
WHERE reservation_id IN (
  '1fa93d50-ca5f-4648-8e90-12497800d92b',
  'ca42e3a3-8500-4b3f-bcec-99259d8454c4',
  '4102f3c8-276e-4150-81e9-b616b2356627',
  '0bc4f840-3fe7-4b1f-883d-4431ed0e9f2a',
  'aa7d328b-ca51-47b4-be6b-804d3703da10'
)
  AND status = 'expired';

-- Paso 4: Re-habilitar trigger
ALTER TABLE reservations ENABLE TRIGGER trg_validate_status;

COMMIT;

-- ═══════════════════════════════════════════════════════════════
-- Verificación
-- ═══════════════════════════════════════════════════════════════
SELECT
  r.id,
  r.first_name || ' ' || r.last_name AS cliente,
  r.event_date,
  r.status,
  r.total,
  COUNT(sh.id) FILTER (WHERE sh.status = 'active') AS holds_activos
FROM reservations r
LEFT JOIN stock_holds sh ON sh.reservation_id = r.id
WHERE r.id IN (
  '1fa93d50-ca5f-4648-8e90-12497800d92b',
  'ca42e3a3-8500-4b3f-bcec-99259d8454c4',
  '4102f3c8-276e-4150-81e9-b616b2356627',
  '0bc4f840-3fe7-4b1f-883d-4431ed0e9f2a',
  'aa7d328b-ca51-47b4-be6b-804d3703da10'
)
GROUP BY r.id, r.first_name, r.last_name, r.event_date, r.status, r.total
ORDER BY r.event_date;

-- Esperado: 5 filas, status = 'approved_waiting_contract', holds_activos >= 1
