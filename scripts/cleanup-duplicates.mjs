// Cleanup de reservas duplicadas.
//
// Uso:
//   node scripts/cleanup-duplicates.mjs           # dry-run (no cambia nada)
//   node scripts/cleanup-duplicates.mjs --execute # cancela duplicados seguros
//
// Lógica:
//   - Agrupa por client_email (case-insensitive) + event_date
//   - Dentro de cada grupo, ordena por progreso del flujo (más avanzado = quedarse)
//   - Cancela solo las que están en estados SEGUROS para cancelar:
//        pending_out_of_stock, approved_waiting_contract
//   - NUNCA toca contract_signed, deposit_paid, balance_due, paid_in_full
//     (porque ya hubo compromiso del cliente y/o dinero involucrado)
//   - Flagea para revisión manual los grupos donde NO se puede limpiar automático

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

// IDs que el admin decidió NO cancelar (edge cases verificados manualmente)
const EXCLUDE_IDS = new Set([
  'a7f79c1e-7276-4164-b3d9-6e9fc3adfe9b', // Adrienne — tent $763 approved_waiting_contract
  '0d35a1cc-cab4-4a22-9df8-353694a6f0e3', // Adrienne — tent $763 pending_out_of_stock
  '9ae244e2-f36a-48df-9cf4-3a649831da23', // Adrienne — tent $763 pending_out_of_stock
  'c3be67c9-bba2-46b2-a872-55501bca97c9', // Asuree — $309 (posible versión actualizada)
]);

// Estados que NUNCA se cancelan automáticamente
const PROTECTED_STATES = ['contract_signed', 'deposit_paid', 'balance_due', 'paid_in_full'];
// Estados seguros para cancelar
const SAFE_TO_CANCEL = ['pending_out_of_stock', 'approved_waiting_contract'];
// Estados finales (se ignoran)
const FINAL_STATES = ['cancelled', 'hold_expired', 'completed'];

// Prioridad: más alto = más avanzado = se queda
const PROGRESS_RANK = {
  pending_out_of_stock: 1,
  approved_waiting_contract: 2,
  contract_signed: 3,
  deposit_paid: 4,
  balance_due: 5,
  paid_in_full: 6,
};

console.log(`\n${EXECUTE ? '🔴 EXECUTE MODE — se aplicarán cambios' : '🟢 DRY-RUN — solo simulación'}\n`);

const { data: all } = await supabase
  .from('reservations')
  .select('id, client_email, first_name, last_name, event_date, status, total, created_at')
  .not('status', 'in', `(${FINAL_STATES.join(',')})`)
  .order('created_at', { ascending: false });

const groups = {};
for (const r of all || []) {
  const key = `${r.client_email?.toLowerCase().trim() || 'no-email'}__${r.event_date}`;
  if (!groups[key]) groups[key] = [];
  groups[key].push(r);
}

const duplicateGroups = Object.entries(groups).filter(([, rs]) => rs.length > 1);

console.log(`Grupos duplicados encontrados: ${duplicateGroups.length}\n`);

const plan = {
  toCancel: [],
  manualReview: [],
};

for (const [key, rs] of duplicateGroups) {
  const [email, eventDate] = key.split('__');

  // Ordenar de más avanzado a menos avanzado; en empate, más reciente primero
  const sorted = [...rs].sort((a, b) => {
    const rankDiff = (PROGRESS_RANK[b.status] || 0) - (PROGRESS_RANK[a.status] || 0);
    if (rankDiff !== 0) return rankDiff;
    return new Date(b.created_at) - new Date(a.created_at);
  });

  const keeper = sorted[0];
  const others = sorted.slice(1);

  const hasProtected = others.some((r) => PROTECTED_STATES.includes(r.status));

  console.log('───────────────────────────────────────────────────────────────');
  console.log(`👤 ${email} | evento ${eventDate}`);
  console.log(`   KEEP   → ${keeper.id.slice(0, 8)} | ${keeper.status} | $${keeper.total}`);

  for (const r of others) {
    const excluded = EXCLUDE_IDS.has(r.id);
    const canCancel = SAFE_TO_CANCEL.includes(r.status);
    let marker;
    if (excluded) marker = '⏭️  SKIP  ';
    else if (canCancel) marker = 'CANCEL';
    else marker = '⚠️  MANUAL';
    console.log(`   ${marker} → ${r.id.slice(0, 8)} | ${r.status} | $${r.total}`);
    if (excluded) continue;
    if (canCancel) {
      plan.toCancel.push({ ...r, keeper_id: keeper.id });
    } else {
      plan.manualReview.push({ ...r, keeper_id: keeper.id });
    }
  }

  if (hasProtected) {
    console.log(`   ⚠️  Este grupo tiene reservas con pagos/firma — revisión manual recomendada`);
  }
}

console.log('\n═══════════════════════════════════════════════════════════════');
console.log('PLAN DE EJECUCIÓN');
console.log('═══════════════════════════════════════════════════════════════\n');
console.log(`Reservas a CANCELAR automáticamente: ${plan.toCancel.length}`);
console.log(`Reservas que requieren REVISIÓN MANUAL: ${plan.manualReview.length}`);

if (plan.manualReview.length > 0) {
  console.log(`\n⚠️  Revisión manual (no se tocarán):`);
  for (const r of plan.manualReview) {
    console.log(`   • ${r.id} | ${r.status} | $${r.total} (keeper: ${r.keeper_id.slice(0, 8)})`);
  }
}

if (!EXECUTE) {
  console.log(`\n💡 Para aplicar los cambios, corre:\n   node scripts/cleanup-duplicates.mjs --execute\n`);
  process.exit(0);
}

if (plan.toCancel.length === 0) {
  console.log('\nNada que cancelar.');
  process.exit(0);
}

console.log(`\n🔴 Cancelando ${plan.toCancel.length} reservas...\n`);

let success = 0;
let failed = 0;
for (const r of plan.toCancel) {
  // 1. Cancelar la reservación (trigger DB validará la transición)
  const { error: updErr } = await supabase
    .from('reservations')
    .update({ status: 'cancelled' })
    .eq('id', r.id);

  if (updErr) {
    console.log(`   ❌ ${r.id.slice(0, 8)} | ${updErr.message}`);
    failed++;
    continue;
  }

  // 2. Liberar stock holds asociados
  await supabase
    .from('stock_holds')
    .update({ status: 'released' })
    .eq('reservation_id', r.id)
    .in('status', ['active', 'confirmed']);

  console.log(`   ✅ ${r.id.slice(0, 8)} | cancelled + holds released`);
  success++;
}

console.log(`\n═══════════════════════════════════════════════════════════════`);
console.log(`Resultado: ${success} OK, ${failed} fallidas`);
console.log('═══════════════════════════════════════════════════════════════\n');
