import { supabase } from './supabase';

// Get the current user's access token for admin API calls
async function getAuthHeaders() {
  if (!supabase) return {};
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) return {};
  return { Authorization: `Bearer ${session.access_token}` };
}

// Authenticated fetch wrapper for admin API endpoints
export async function adminFetch(url, options = {}) {
  const authHeaders = await getAuthHeaders();
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...options.headers,
    },
  });
  return response;
}

// Fetch all reservations via admin API (authenticated)
export async function fetchAdminReservations({ archived = false } = {}) {
  const url = archived ? '/api/admin/reservations?archived=true' : '/api/admin/reservations';
  const res = await adminFetch(url);
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Failed to fetch reservations');
  }
  return res.json();
}

// Fetch a single reservation via admin API (authenticated)
export async function fetchAdminReservation(id) {
  const res = await adminFetch(`/api/admin/reservations/${id}`);
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Failed to fetch reservation');
  }
  return res.json();
}

// Perform admin action (approve, reject, cancel)
export async function adminAction(id, action, body = {}) {
  const res = await adminFetch(`/api/admin/reservations/${id}/${action}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Action failed');
  }
  return data;
}

// Create or resend the balance (60%) invoice in Square for a reservation.
// Used to recover reservations whose deposit was paid but the balance invoice
// was never generated, or to resend the invoice when the client lost the email.
export async function createBalanceInvoice(id) {
  const res = await adminFetch(`/api/admin/reservations/${id}/create-balance-invoice`, {
    method: 'POST',
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to create balance invoice');
  return data;
}

// Archive a reservation (soft-delete)
export async function archiveReservation(id) {
  const res = await adminFetch(`/api/admin/reservations/${id}/archive`, {
    method: 'PUT',
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to archive');
  return data;
}

// Unarchive a reservation
export async function unarchiveReservation(id) {
  const res = await adminFetch(`/api/admin/reservations/${id}/archive`, {
    method: 'DELETE',
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to unarchive');
  return data;
}

// Fetch inventory summary via admin API (uses service_role to read stock_holds)
export async function fetchAdminInventory(date) {
  const url = date ? `/api/admin/inventory?date=${date}` : '/api/admin/inventory';
  const res = await adminFetch(url);
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Failed to fetch inventory');
  }
  return res.json();
}

// Permanently delete an archived reservation
export async function deleteReservation(id) {
  const res = await adminFetch(`/api/admin/reservations/${id}`, {
    method: 'DELETE',
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to delete');
  return data;
}
