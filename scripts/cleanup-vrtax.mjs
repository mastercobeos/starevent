// Cancela las 3 duplicadas firmadas de VR Tax Services que NO tienen pagos.
// Verificado: ninguna tiene fila en payments table, así que no hay refund involucrado.
//
// Uso: node scripts/cleanup-vrtax.mjs --execute

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
const EXECUTE = process.argv.includes('--execute');

// Duplicadas firmadas de info@vrtaxservices.net SIN pagos en DB
const TO_CANCEL = [
  { id: 'dbef83bb-38be-4b11-a427-01296c310239', label: 'VR Tax | event 2026-05-02 | $170.31 (dup of 0e44dcea)' },
  { id: 'd9c2a103-86e3-4d67-be0d-c0156ac72f27', label: 'VR Tax | event 2026-05-02 | $170.31 (dup of 0e44dcea)' },
  { id: '58acf80e-47d6-400d-b243-5ef77be8ec5a', label: 'VR Tax | event 2026-10-12 | $202.79 (dup of aab7fd23)' },
];

console.log(`\n${EXECUTE ? '🔴 EXECUTE MODE' : '🟢 DRY-RUN'}\n`);

// Verificación de seguridad: confirmar que cada una NO tiene pagos antes de cancelar
console.log('Verificando ausencia de pagos antes de cancelar...\n');
for (const r of TO_CANCEL) {
  const { data: payments } = await supabase
    .from('payments')
    .select('id, type, status, square_payment_id')
    .eq('reservation_id', r.id);

  const hasCompleted = (payments || []).some((p) => p.status === 'completed' || p.square_payment_id);
  if (hasCompleted) {
    console.log(`   ❌ ${r.id.slice(0, 8)} | TIENE PAGO — abortando todo el script`);
    console.log('   Detalles:', payments);
    process.exit(1);
  }
  console.log(`   ✅ ${r.id.slice(0, 8)} | ${r.label} | sin pagos → seguro`);
}

if (!EXECUTE) {
  console.log(`\n💡 Para ejecutar: node scripts/cleanup-vrtax.mjs --execute\n`);
  process.exit(0);
}

console.log('\n🔴 Cancelando...\n');

let success = 0;
let failed = 0;
for (const r of TO_CANCEL) {
  // 1. Cancelar reserva (trigger DB validará la transición contract_signed → cancelled)
  const { error: updErr } = await supabase
    .from('reservations')
    .update({ status: 'cancelled' })
    .eq('id', r.id);

  if (updErr) {
    console.log(`   ❌ ${r.id.slice(0, 8)} | ${updErr.message}`);
    failed++;
    continue;
  }

  // 2. Liberar stock holds si existen
  await supabase
    .from('stock_holds')
    .update({ status: 'released' })
    .eq('reservation_id', r.id)
    .in('status', ['active', 'confirmed']);

  // 3. Marcar contrato como void (opcional, para limpieza)
  await supabase
    .from('contracts')
    .update({ status: 'voided' })
    .eq('reservation_id', r.id);

  console.log(`   ✅ ${r.id.slice(0, 8)} | cancelled + holds released + contract voided`);
  success++;
}

console.log(`\nResultado: ${success} OK, ${failed} fallidas\n`);
