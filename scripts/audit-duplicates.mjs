// Auditoría de reservas duplicadas activas (read-only)
// Criterio: mismo client_email + mismo event_date + status no-final

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

const FINAL_STATES = ['cancelled', 'hold_expired', 'completed'];

const { data: all } = await supabase
  .from('reservations')
  .select('id, client_email, first_name, last_name, event_date, status, total, created_at')
  .not('status', 'in', `(${FINAL_STATES.join(',')})`)
  .order('created_at', { ascending: false });

console.log(`\nReservas ACTIVAS totales (no canceladas/expiradas/completadas): ${all?.length || 0}\n`);

// Agrupar por (email + event_date)
const groups = {};
for (const r of all || []) {
  const key = `${r.client_email?.toLowerCase().trim() || 'no-email'}__${r.event_date}`;
  if (!groups[key]) groups[key] = [];
  groups[key].push(r);
}

const duplicateGroups = Object.entries(groups).filter(([, rs]) => rs.length > 1);
console.log(`Grupos de duplicados (mismo email + misma event_date): ${duplicateGroups.length}\n`);

if (duplicateGroups.length === 0) {
  console.log('✅ No hay duplicados activos.');
  process.exit(0);
}

console.log('═══════════════════════════════════════════════════════════════');
for (const [key, rs] of duplicateGroups) {
  const [email, eventDate] = key.split('__');
  console.log(`\n👤 ${email} | evento ${eventDate} | ${rs.length} reservas`);
  for (const r of rs.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))) {
    console.log(`   • ${r.id.slice(0, 8)} | ${r.status.padEnd(28)} | $${r.total} | created ${r.created_at.slice(0, 16)}`);
  }
}

// Resumen
const totalDuplicated = duplicateGroups.reduce((sum, [, rs]) => sum + rs.length, 0);
const toCancel = duplicateGroups.reduce((sum, [, rs]) => sum + rs.length - 1, 0);
console.log('\n═══════════════════════════════════════════════════════════════');
console.log(`\nResumen:`);
console.log(`   • Total reservas en grupos duplicados: ${totalDuplicated}`);
console.log(`   • A cancelar (manteniendo 1 por grupo): ${toCancel}\n`);
