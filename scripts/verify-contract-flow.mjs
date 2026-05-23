// Verificación end-to-end del flow de contratos.
// Simula lo que hace GET /api/reservations/[id] incluyendo la normalización
// y reporta cualquier reserva approved_waiting_contract que no renderice bien.

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

const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const POST_APPROVAL_STATES = [
  'approved_waiting_contract',
  'contract_signed',
  'deposit_paid',
  'balance_due',
  'paid_in_full',
];

console.log('\n═══════════════════════════════════════════════════════════════');
console.log('VERIFICACIÓN END-TO-END DEL FLOW DE CONTRATOS');
console.log('═══════════════════════════════════════════════════════════════\n');

// Trae todas las reservas post-aprobación y verifica que renderearían bien
const { data: reservations } = await sb
  .from('reservations')
  .select(`
    id, first_name, last_name, status, event_date, total,
    contracts (id, status, contract_html, contract_hash, initials, signed_at)
  `)
  .in('status', POST_APPROVAL_STATES)
  .order('created_at', { ascending: false });

console.log(`Reservas post-aprobación encontradas: ${reservations?.length || 0}\n`);

const issues = [];
const stats = {
  willRender: 0,
  wouldFail: 0,
  selfHealCovered: 0,
};

for (const r of reservations || []) {
  // PASO 1: Aplicar normalización (como hace el API ahora)
  let normalized = r.contracts;
  if (normalized && !Array.isArray(normalized)) {
    normalized = [normalized];
  } else if (!normalized) {
    normalized = [];
  }

  // PASO 2: Simular lo que hace el frontend
  const contract = normalized[0];

  if (contract && contract.contract_html && contract.contract_html.length > 100) {
    stats.willRender++;
  } else {
    // No contract → self-heal kicks in only for approved_waiting_contract
    if (r.status === 'approved_waiting_contract') {
      stats.selfHealCovered++;
    } else {
      stats.wouldFail++;
      issues.push({
        id: r.id,
        name: `${r.first_name} ${r.last_name}`,
        event_date: r.event_date,
        status: r.status,
        reason: 'Contrato faltante o vacío en estado post-firma (no self-heal)',
      });
    }
  }
}

console.log('Resultados:');
console.log(`   ✅ Renderizarían correctamente: ${stats.willRender}`);
console.log(`   🛟  Cubiertas por self-heal (APPROVED_WAITING_CONTRACT sin contrato): ${stats.selfHealCovered}`);
console.log(`   ❌ Posibles fallos (no cubiertos por self-heal): ${stats.wouldFail}\n`);

if (issues.length > 0) {
  console.log('⚠️  Casos que necesitan atención:\n');
  for (const i of issues) {
    console.log(`   • ${i.id.slice(0, 8)} | ${i.name} | ${i.event_date} | status=${i.status}`);
    console.log(`     → ${i.reason}`);
  }
} else {
  console.log('🎉 Todas las reservas post-aprobación tienen contrato listo para renderizar.\n');
}

console.log('═══════════════════════════════════════════════════════════════\n');
