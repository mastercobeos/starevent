// Reservation status constants
export const STATUS = {
  PENDING_OUT_OF_STOCK: 'pending_out_of_stock',
  APPROVED_WAITING_CONTRACT: 'approved_waiting_contract',
  CONTRACT_SIGNED: 'contract_signed',
  DEPOSIT_PAID: 'deposit_paid',
  BALANCE_DUE: 'balance_due',
  PAID_IN_FULL: 'paid_in_full',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  HOLD_EXPIRED: 'hold_expired',
};

// Allowed transitions map (source of truth — also enforced by DB trigger)
const ALLOWED_TRANSITIONS = {
  [STATUS.PENDING_OUT_OF_STOCK]:      [STATUS.APPROVED_WAITING_CONTRACT, STATUS.CANCELLED],
  [STATUS.APPROVED_WAITING_CONTRACT]: [STATUS.CONTRACT_SIGNED, STATUS.CANCELLED, STATUS.HOLD_EXPIRED],
  [STATUS.CONTRACT_SIGNED]:           [STATUS.DEPOSIT_PAID, STATUS.CANCELLED, STATUS.HOLD_EXPIRED],
  [STATUS.DEPOSIT_PAID]:              [STATUS.BALANCE_DUE, STATUS.CANCELLED],
  [STATUS.BALANCE_DUE]:               [STATUS.PAID_IN_FULL, STATUS.CANCELLED],
  [STATUS.PAID_IN_FULL]:              [STATUS.COMPLETED, STATUS.CANCELLED],
  [STATUS.COMPLETED]:                 [],
  [STATUS.CANCELLED]:                 [],
  [STATUS.HOLD_EXPIRED]:              [],
};

// Terminal states (no further transitions)
export const TERMINAL_STATES = [STATUS.COMPLETED, STATUS.CANCELLED, STATUS.HOLD_EXPIRED];

// States where payment UI should NOT be shown
export const NO_PAYMENT_STATES = [
  STATUS.PENDING_OUT_OF_STOCK,
  STATUS.CANCELLED,
  STATUS.HOLD_EXPIRED,
];

// Validate if a transition is allowed
export function canTransition(fromStatus, toStatus) {
  const allowed = ALLOWED_TRANSITIONS[fromStatus];
  if (!allowed) return false;
  return allowed.includes(toStatus);
}

// Get next possible states from current
export function getNextStates(currentStatus) {
  return ALLOWED_TRANSITIONS[currentStatus] || [];
}

// Check if status is terminal
export function isTerminal(status) {
  return TERMINAL_STATES.includes(status);
}

// Human-readable status labels (bilingual)
export const STATUS_LABELS = {
  en: {
    [STATUS.PENDING_OUT_OF_STOCK]:      'Pending — Out of Stock',
    [STATUS.APPROVED_WAITING_CONTRACT]: 'Approved — Sign Contract',
    [STATUS.CONTRACT_SIGNED]:           'Contract Signed',
    [STATUS.DEPOSIT_PAID]:              'Deposit Paid (40%)',
    [STATUS.BALANCE_DUE]:               'Balance Due (60%)',
    [STATUS.PAID_IN_FULL]:              'Paid in Full',
    [STATUS.COMPLETED]:                 'Completed',
    [STATUS.CANCELLED]:                 'Cancelled',
    [STATUS.HOLD_EXPIRED]:              'Hold Expired',
  },
  es: {
    [STATUS.PENDING_OUT_OF_STOCK]:      'Pendiente — Sin Stock',
    [STATUS.APPROVED_WAITING_CONTRACT]: 'Aprobada — Firmar Contrato',
    [STATUS.CONTRACT_SIGNED]:           'Contrato Firmado',
    [STATUS.DEPOSIT_PAID]:              'Anticipo Pagado (40%)',
    [STATUS.BALANCE_DUE]:               'Saldo Pendiente (60%)',
    [STATUS.PAID_IN_FULL]:              'Pagado al 100%',
    [STATUS.COMPLETED]:                 'Completada',
    [STATUS.CANCELLED]:                 'Cancelada',
    [STATUS.HOLD_EXPIRED]:              'Reserva Expirada',
  },
};

// Status badge colors (for UI)
export const STATUS_COLORS = {
  [STATUS.PENDING_OUT_OF_STOCK]:      { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30' },
  [STATUS.APPROVED_WAITING_CONTRACT]: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
  [STATUS.CONTRACT_SIGNED]:           { bg: 'bg-indigo-500/20', text: 'text-indigo-400', border: 'border-indigo-500/30' },
  [STATUS.DEPOSIT_PAID]:              { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  [STATUS.BALANCE_DUE]:               { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30' },
  [STATUS.PAID_IN_FULL]:              { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' },
  [STATUS.COMPLETED]:                 { bg: 'bg-teal-500/20', text: 'text-teal-400', border: 'border-teal-500/30' },
  [STATUS.CANCELLED]:                 { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' },
  [STATUS.HOLD_EXPIRED]:              { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500/30' },
};

// Deposit/Balance split constants
export const DEPOSIT_PERCENTAGE = 0.40;
export const BALANCE_PERCENTAGE = 0.60;

export function calculateSplit(total) {
  const deposit = Math.round(total * DEPOSIT_PERCENTAGE * 100) / 100;
  const balance = Math.round(total * BALANCE_PERCENTAGE * 100) / 100;
  return { deposit, balance, depositCents: Math.round(deposit * 100), balanceCents: Math.round(balance * 100) };
}
