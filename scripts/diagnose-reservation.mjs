// Diagnóstico de UNA reserva específica
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
const SEARCH = process.argv[2] || 'agarrett0646@gmail.com';

console.log(`\n🔎 Buscando: ${SEARCH}\n`);

// Búsqueda por email
const { data: reservations } = await supabase
  .from('reservations')
  .select('*')
  .or(`client_email.ilike.%${SEARCH}%,phone_1.ilike.%${SEARCH}%,first_name.ilike.%${SEARCH}%,last_name.ilike.%${SEARCH}%`)
  .order('created_at', { ascending: false });

if (!reservations || reservations.length === 0) {
  console.log('❌ No se encontraron reservas.');
  process.exit(0);
}

for (const r of reservations) {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`📋 RESERVA: ${r.id}`);
  console.log(`   Cliente: ${r.first_name} ${r.last_name} | ${r.client_email} | ${r.phone_1}`);
  console.log(`   Evento: ${r.event_date} → ${r.return_date}`);
  console.log(`   Status actual: ${r.status}`);
  console.log(`   Creada: ${r.created_at}`);
  console.log(`   Modificada: ${r.updated_at}`);
  console.log(`   Total: $${r.total} (deposit $${r.deposit_amount} + balance $${r.balance_amount})`);
  console.log(`   Language: ${r.language}`);
  console.log('───────────────────────────────────────────────────────────────');

  // Contrato
  const { data: contracts } = await supabase
    .from('contracts')
    .select('*')
    .eq('reservation_id', r.id);

  console.log(`\n📄 CONTRATO: ${contracts?.length || 0} fila(s) en DB`);
  if (contracts && contracts.length > 0) {
    for (const c of contracts) {
      console.log(`   • ID: ${c.id}`);
      console.log(`   • Status: ${c.status}`);
      console.log(`   • Template version: ${c.template_version}`);
      console.log(`   • Initials: ${c.initials || '(none)'}`);
      console.log(`   • Signed at: ${c.signed_at || '(not signed)'}`);
      console.log(`   • Created: ${c.created_at}`);
      console.log(`   • Updated: ${c.updated_at}`);
      console.log(`   • HTML length: ${c.contract_html?.length || 0} chars`);
      console.log(`   • Hash: ${c.contract_hash}`);
    }
  } else {
    console.log('   ⚠️  NO HAY CONTRATO EN DB — esto causaría el screenshot del cliente');
  }

  // Reservation items
  const { data: items } = await supabase
    .from('reservation_items')
    .select('*, products(name)')
    .eq('reservation_id', r.id);

  console.log(`\n🛒 ITEMS: ${items?.length || 0}`);
  for (const it of items || []) {
    console.log(`   • ${it.products?.name || it.product_id} × ${it.quantity} @ $${it.unit_price}`);
  }

  // Stock holds
  const { data: holds } = await supabase
    .from('stock_holds')
    .select('*')
    .eq('reservation_id', r.id)
    .order('created_at');

  console.log(`\n📦 STOCK HOLDS: ${holds?.length || 0}`);
  for (const h of holds || []) {
    const exp = h.expires_at ? new Date(h.expires_at) : null;
    const expState = exp ? (exp < new Date() ? `EXPIRÓ hace ${Math.round((Date.now() - exp) / 86400000)} días` : 'activo') : 'sin expiración';
    console.log(`   • ${h.product_id} × ${h.quantity} | status=${h.status} | ${expState}`);
  }

  // Status log
  const { data: log } = await supabase
    .from('reservation_status_log')
    .select('*')
    .eq('reservation_id', r.id)
    .order('created_at');

  console.log(`\n📜 HISTORIAL DE STATUS: ${log?.length || 0} cambios`);
  for (const l of log || []) {
    console.log(`   • ${l.created_at} | ${l.from_status || 'NEW'} → ${l.to_status} | by ${l.changed_by}`);
  }

  // Payments
  const { data: payments } = await supabase
    .from('payments')
    .select('*')
    .eq('reservation_id', r.id);

  console.log(`\n💳 PAGOS: ${payments?.length || 0}`);
  for (const p of payments || []) {
    console.log(`   • ${p.type} | $${p.amount} | status=${p.status} | invoice: ${p.square_invoice_url ? '✓' : '✗'}`);
  }

  // Notifications
  const { data: notifs } = await supabase
    .from('notifications')
    .select('type, channel, status, sent_at, error_message')
    .eq('reservation_id', r.id)
    .order('created_at');

  console.log(`\n📧 NOTIFICACIONES: ${notifs?.length || 0}`);
  for (const n of notifs || []) {
    console.log(`   • ${n.type} | ${n.channel} | ${n.status} | ${n.sent_at || ''} ${n.error_message ? `| ERR: ${n.error_message}` : ''}`);
  }

  console.log('\n');
}
