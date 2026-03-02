import React from 'react';
import { STATUS_COLORS, STATUS_LABELS } from '../../lib/reservation-state-machine';

const legacyStyles = {
  pending: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  confirmed: 'bg-green-500/20 text-green-300 border-green-500/30',
  completed: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  cancelled: 'bg-red-500/20 text-red-300 border-red-500/30',
  paid: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
};

export default function StatusBadge({ status }) {
  const colors = STATUS_COLORS[status];
  const label = STATUS_LABELS.en[status];

  if (colors && label) {
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${colors.bg} ${colors.text} ${colors.border}`}>
        {label}
      </span>
    );
  }

  // Fallback for legacy statuses
  const style = legacyStyles[status] || legacyStyles.pending;
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${style}`}>
      {status?.charAt(0).toUpperCase() + status?.slice(1)}
    </span>
  );
}
