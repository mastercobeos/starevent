// Verifica el estado de pagos de las 3 duplicadas firmadas de VR Tax
// para saber si es seguro cancelarlas (sin pago = sí, con deposit pagado = refund manual)

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envFile = readFileSync(resolve(__dirname, '../.env.local'), 'utf8');
const env = Object.fromEntries(
  envFile.split('\n').filter((l) => l.trim() && !l.startsWith('#')).map((l) => {
    const idx = l.indexOf('=');
    return [l.slice(0, idx).trim(), l.slice(idx + 1).trim().replace(/^["']|["']$/g, '')];
  })
);

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const VR_TAX_IDS = [
  'd9c2a103-86e3-4d67-be0d-c0156ac72f27',
  'dbef83bb-38be-4b11-a427-01296c310239',
  '58acf80e-47d6-400d-b243-5ef77be8ec5a',
  // También verifico los KEEPERS para comparar
  '0e44dcea',
  'aab7fd23',
];

console.log('Verificando estado de las reservas de VR Tax Services...\n');

for (const partialId of VR_TAX_IDS) {
  const { data } = await supabase
    .from('reservations')
    .select('id, status, total, event_date, payments(type, status, amount, square_invoice_id, square_payment_id)')
    .or(`id.eq.${partialId}${partialId.length === 8 ? '%' : ''},id.like.${partialId}%`)
    .limit(1);

  // Fallback: try with ilike on first 8 chars
  let reservation;
  if (data && data.length > 0) {
    reservation = data[0];
  } else {
    const { data: byPrefix } = await supabase
      .from('reservations')
      .select('id, status, total, event_date, payments(type, status, amount, square_invoice_id, square_payment_id)')
      .gte('id', partialId.slice(0, 8))
      .lt('id', partialId.slice(0, 8) + 'g')
      .limit(1);
    reservation = byPrefix?.[0];
  }

  if (!reservation) {
    console.log(`❓ ${partialId} - no encontrada\n`);
    continue;
  }

  const isKeeper = partialId.length === 8;
  console.log(`${isKeeper ? '🟢 KEEPER' : '🔴 DUP'} ${reservation.id.slice(0, 8)} | ${reservation.status} | $${reservation.total} | evento ${reservation.event_date}`);

  if (!reservation.payments || reservation.payments.length === 0) {
    console.log(`   💰 Sin pagos registrados → SEGURO cancelar`);
  } else {
    for (const p of reservation.payments) {
      const flag = p.status === 'completed' ? '⚠️  PAGADO' : 'sin completar';
      console.log(`   💰 ${p.type} | $${p.amount} | status=${p.status} ${flag} | square_payment=${p.square_payment_id ? 'SÍ' : 'no'}`);
    }
  }
  console.log('');
}
