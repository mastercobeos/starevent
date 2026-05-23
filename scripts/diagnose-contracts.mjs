// Diagnóstico read-only de reservas y contratos
// Identifica reservas aprobadas que pueden estar mostrando "contract not ready" al cliente

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envFile = readFileSync(resolve(__dirname, '../.env.local'), 'utf8');
const env = Object.fromEntries(
  envFile
    .split('\n')
    .filter((l) => l.trim() && !l.startsWith('#'))
    .map((l) => {
      const idx = l.indexOf('=');
      return [l.slice(0, idx).trim(), l.slice(idx + 1).trim().replace(/^["']|["']$/g, '')];
    })
);

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const POST_APPROVAL_STATES = [
  'approved_waiting_contract',
  'contract_signed',
  'deposit_paid',
  'balance_due',
  'paid_in_full',
];

console.log('═══════════════════════════════════════════════════════════════');
console.log('DIAGNÓSTICO DE CONTRATOS — Star Event Rental');
console.log('═══════════════════════════════════════════════════════════════\n');

// ─── 1. Reservas post-aprobación SIN contrato ────────────────────────────
console.log('1️⃣  RESERVAS POST-APROBACIÓN SIN CONTRATO EN DB\n');

const { data: postApproval } = await supabase
  .from('reservations')
  .select('id, status, first_name, last_name, event_date, created_at, updated_at, contracts(id, status)')
  .in('status', POST_APPROVAL_STATES)
  .order('created_at', { ascending: false })
  .limit(100);

const orphaned = (postApproval || []).filter((r) => !r.contracts || r.contracts.length === 0);
console.log(`   Total reservas en estados post-aprobación (últimas 100): ${postApproval?.length || 0}`);
console.log(`   Reservas SIN contrato (problemáticas): ${orphaned.length}\n`);

if (orphaned.length > 0) {
  console.log('   ⚠️  Reservas afectadas:');
  for (const r of orphaned) {
    console.log(`      • ${r.id.slice(0, 8)} | ${r.status} | ${r.first_name} ${r.last_name} | event ${r.event_date} | created ${r.created_at.slice(0, 16)}`);
  }
} else {
  console.log('   ✅ Todas las reservas post-aprobación tienen contrato en DB.');
}

// ─── 2. Reservas que terminaron en hold_expired ──────────────────────────
console.log('\n2️⃣  RESERVAS EN hold_expired (cron expiró antes de firma)\n');

const { data: expired } = await supabase
  .from('reservations')
  .select('id, status, first_name, last_name, event_date, created_at, updated_at, contracts(id, status)')
  .eq('status', 'hold_expired')
  .order('created_at', { ascending: false })
  .limit(50);

console.log(`   Total: ${expired?.length || 0}\n`);
if (expired && expired.length > 0) {
  for (const r of expired.slice(0, 10)) {
    const hasContract = r.contracts && r.contracts.length > 0;
    console.log(`      • ${r.id.slice(0, 8)} | ${r.first_name} ${r.last_name} | event ${r.event_date} | contract: ${hasContract ? `✓ ${r.contracts[0].status}` : '✗ MISSING'}`);
  }
  if (expired.length > 10) console.log(`      ... y ${expired.length - 10} más`);
}

// ─── 3. Stock holds activos a punto de expirar ───────────────────────────
console.log('\n3️⃣  STOCK HOLDS ACTIVOS A PUNTO DE EXPIRAR (próximas 24h)\n');

const in24h = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
const { data: aboutToExpire } = await supabase
  .from('stock_holds')
  .select('id, reservation_id, product_id, expires_at, reservations(status, first_name, last_name)')
  .eq('status', 'active')
  .lte('expires_at', in24h)
  .order('expires_at', { ascending: true })
  .limit(30);

const grouped = {};
for (const h of aboutToExpire || []) {
  if (!grouped[h.reservation_id]) grouped[h.reservation_id] = { ...h, count: 0 };
  grouped[h.reservation_id].count++;
}

console.log(`   Reservas únicas con holds expirando pronto: ${Object.keys(grouped).length}\n`);
for (const r of Object.values(grouped)) {
  const exp = new Date(r.expires_at);
  const minsLeft = Math.round((exp - Date.now()) / 60000);
  const passed = minsLeft < 0;
  console.log(`      • ${r.reservation_id.slice(0, 8)} | ${r.reservations?.status} | ${r.count} hold(s) | ${passed ? `EXPIRÓ hace ${-minsLeft} min` : `expira en ${minsLeft} min`}`);
}

// ─── 4. Status log — patrón de transiciones recientes ────────────────────
console.log('\n4️⃣  TRANSICIONES DE STATUS — ÚLTIMOS 30 DÍAS\n');

const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
const { data: log } = await supabase
  .from('reservation_status_log')
  .select('from_status, to_status, changed_by')
  .gte('created_at', since);

const transitions = {};
for (const l of log || []) {
  const key = `${l.from_status || 'NEW'} → ${l.to_status}`;
  transitions[key] = (transitions[key] || 0) + 1;
}

const sorted = Object.entries(transitions).sort((a, b) => b[1] - a[1]);
for (const [key, count] of sorted) {
  console.log(`      ${count.toString().padStart(4)} × ${key}`);
}

// ─── 5. Verificar reservas approved_waiting_contract con holds expirados ──
console.log('\n5️⃣  CASO BORDE: status=approved_waiting_contract con holds expirados\n');

const { data: borderline } = await supabase
  .from('reservations')
  .select('id, status, first_name, event_date, stock_holds(status, expires_at)')
  .eq('status', 'approved_waiting_contract')
  .order('created_at', { ascending: false })
  .limit(50);

const borderHits = (borderline || []).filter((r) => {
  if (!r.stock_holds || r.stock_holds.length === 0) return false;
  return r.stock_holds.some((h) => h.status === 'expired' || (h.status === 'active' && h.expires_at && new Date(h.expires_at) < new Date()));
});

console.log(`   Reservas approved_waiting_contract con holds vencidos: ${borderHits.length}`);
for (const r of borderHits.slice(0, 10)) {
  console.log(`      • ${r.id.slice(0, 8)} | ${r.first_name} | event ${r.event_date}`);
}

console.log('\n═══════════════════════════════════════════════════════════════');
console.log('DIAGNÓSTICO COMPLETO');
console.log('═══════════════════════════════════════════════════════════════\n');
