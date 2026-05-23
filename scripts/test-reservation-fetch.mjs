// Simula EXACTAMENTE lo que hace GET /api/reservations/[id] para verificar
// si el nested select de Supabase devuelve el contrato correctamente.
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

// Test con Adrienne a7f79c1e (admin-approved con contrato en DB)
const id = 'a7f79c1e-7276-4164-b3d9-6e9fc3adfe9b';

const { data: reservation, error } = await supabase
  .from('reservations')
  .select(`
    *,
    reservation_items (product_id, quantity, unit_price, products(name, name_es)),
    contracts (id, status, contract_html, contract_hash, initials, signed_at),
    payments (id, type, amount, status, square_invoice_id, square_invoice_url)
  `)
  .eq('id', id)
  .single();

if (error) {
  console.log('❌ Error:', error);
  process.exit(1);
}

// Apply the SAME normalization as the API route
if (reservation.contracts && !Array.isArray(reservation.contracts)) {
  reservation.contracts = [reservation.contracts];
} else if (!reservation.contracts) {
  reservation.contracts = [];
}

console.log('Status:', reservation.status);
console.log('contracts is array:', Array.isArray(reservation.contracts));
console.log('contracts length:', reservation.contracts.length);
console.log('contracts[0] exists:', !!reservation.contracts[0]);
console.log('contracts[0].id:', reservation.contracts[0]?.id);
console.log('contracts[0] keys:', reservation.contracts?.[0] ? Object.keys(reservation.contracts[0]) : 'N/A');
console.log('contract_html length:', reservation.contracts?.[0]?.contract_html?.length);
console.log('\npayments:', reservation.payments);
