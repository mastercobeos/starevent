// Elimina permanentemente las 10 reservas hold_expired cuyo event_date ya pasó.
// DELETE no dispara el trigger validate_status_transition (que es BEFORE UPDATE).
// CASCADE limpia: reservation_items, contracts, payments, stock_holds, notifications,
// reservation_status_log.
//
// idempotency_keys NO tiene CASCADE pero verificamos que ninguna referencia estas IDs.
//
// Uso: node scripts/delete-past-expired.mjs --execute

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
const TODAY = new Date().toISOString().slice(0, 10);

console.log(`\n${EXECUTE ? '🔴 EXECUTE MODE' : '🟢 DRY-RUN'} | hoy: ${TODAY}\n`);

// Buscar todas las hold_expired con event_date < hoy
const { data: candidates } = await supabase
  .from('reservations')
  .select('id, first_name, last_name, client_email, event_date, status, total')
  .eq('status', 'hold_expired')
  .lt('event_date', TODAY)
  .order('event_date');

console.log(`Reservas a borrar (hold_expired + event_date pasado): ${candidates?.length || 0}\n`);

for (const r of candidates || []) {
  console.log(`   • ${r.id.slice(0, 8)} | ${r.first_name} ${r.last_name} | ${r.event_date} | $${r.total}`);
}

if (!EXECUTE) {
  console.log(`\n💡 Para ejecutar: node scripts/delete-past-expired.mjs --execute\n`);
  process.exit(0);
}

console.log('\n🔴 Borrando...\n');

let success = 0;
let failed = 0;
for (const r of candidates || []) {
  // 1. Borrar idempotency_keys si hay (no tienen CASCADE)
  await supabase.from('idempotency_keys').delete().eq('reservation_id', r.id);

  // 2. Borrar reserva (cascade limpia el resto)
  const { error } = await supabase.from('reservations').delete().eq('id', r.id);

  if (error) {
    console.log(`   ❌ ${r.id.slice(0, 8)} | ${error.message}`);
    failed++;
  } else {
    console.log(`   ✅ ${r.id.slice(0, 8)} | ${r.first_name} ${r.last_name} | borrada`);
    success++;
  }
}

console.log(`\nResultado: ${success} OK, ${failed} fallidas\n`);
