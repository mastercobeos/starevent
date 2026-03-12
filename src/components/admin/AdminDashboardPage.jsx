'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchAdminReservations, adminAction, archiveReservation, unarchiveReservation, deleteReservation } from '../../lib/admin-api';
import StatusBadge from './StatusBadge';
import { STATUS, TERMINAL_STATES } from '../../lib/reservation-state-machine';
import { Loader2, Eye, Check, X, RefreshCw, Ban, Archive, ArchiveRestore, Trash2 } from 'lucide-react';
import { formatDate as formatDateUtil } from '../../lib/format';
import { useToast } from '../ui/Toast';
import { useConfirm } from '../ui/ConfirmModal';

const TABS = [
  { key: 'all', label: 'All' },
  { key: STATUS.PENDING_OUT_OF_STOCK, label: 'Out of Stock' },
  { key: STATUS.APPROVED_WAITING_CONTRACT, label: 'Awaiting Contract' },
  { key: STATUS.CONTRACT_SIGNED, label: 'Signed' },
  { key: STATUS.DEPOSIT_PAID, label: 'Deposit Paid' },
  { key: STATUS.BALANCE_DUE, label: 'Balance Due' },
  { key: STATUS.PAID_IN_FULL, label: 'Paid in Full' },
  { key: STATUS.COMPLETED, label: 'Completed' },
  { key: STATUS.CANCELLED, label: 'Cancelled' },
];

export default function AdminDashboard() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [actionLoading, setActionLoading] = useState(null);
  const [showArchived, setShowArchived] = useState(false);
  const toast = useToast();
  const confirm = useConfirm();

  const loadReservations = async (archived = showArchived) => {
    setLoading(true);
    try {
      const data = await fetchAdminReservations({ archived });
      setReservations(data || []);
    } catch (err) {
      console.error('Error loading reservations:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadReservations();
  }, []);

  const handleAdminAction = async (id, action) => {
    setActionLoading(id);
    try {
      await adminAction(id, action);
      await loadReservations();
    } catch (err) {
      console.error('Action failed:', err);
      toast(err.message || 'Action failed', 'error');
    }
    setActionLoading(null);
  };

  const handleArchive = async (id, isArchived) => {
    const action = isArchived ? 'unarchive' : 'archive';
    if (!(await confirm(`Are you sure you want to ${action} this reservation?`, { title: `${action.charAt(0).toUpperCase() + action.slice(1)} Reservation` }))) return;
    setActionLoading(id);
    try {
      if (isArchived) {
        await unarchiveReservation(id);
      } else {
        await archiveReservation(id);
      }
      await loadReservations();
    } catch (err) {
      console.error(`${action} failed:`, err);
      toast(err.message || `${action} failed`, 'error');
    }
    setActionLoading(null);
  };

  const handleDelete = async (id) => {
    if (!(await confirm('PERMANENTLY DELETE this reservation? This cannot be undone.', { title: 'Delete Reservation', destructive: true, confirmText: 'Delete' }))) return;
    setActionLoading(id);
    try {
      await deleteReservation(id);
      await loadReservations();
    } catch (err) {
      console.error('Delete failed:', err);
      toast(err.message || 'Delete failed', 'error');
    }
    setActionLoading(null);
  };

  const toggleArchived = () => {
    const next = !showArchived;
    setShowArchived(next);
    loadReservations(next);
  };

  const filtered =
    activeTab === 'all'
      ? reservations
      : reservations.filter((r) => r.status === activeTab);

  const formatDate = (dateStr) => formatDateUtil(dateStr, { weekday: undefined, month: 'short' });

  const getClientName = (r) => {
    if (r.first_name && r.last_name) return `${r.first_name} ${r.last_name}`;
    return r.client_name || 'Unknown';
  };

  // Render action buttons based on current status
  const renderActions = (res) => {
    const isLoading = actionLoading === res.id;

    return (
      <div className="flex items-center justify-end gap-1">
        <Link
          href={`/admin/reservations/${res.id}`}
          className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
          title="View details"
        >
          <Eye className="w-4 h-4" />
        </Link>

        {/* Approve button for out-of-stock */}
        {res.status === STATUS.PENDING_OUT_OF_STOCK && (
          <>
            <button
              onClick={() => handleAdminAction(res.id, 'approve')}
              disabled={isLoading}
              className="p-2 text-green-400 hover:text-green-300 hover:bg-green-500/10 rounded-lg transition-all disabled:opacity-50"
              title="Approve"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            </button>
            <button
              onClick={() => handleAdminAction(res.id, 'reject')}
              disabled={isLoading}
              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-50"
              title="Reject"
            >
              <X className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Legacy pending support */}
        {res.status === 'pending' && (
          <>
            <button
              onClick={() => handleAdminAction(res.id, 'approve')}
              disabled={isLoading}
              className="p-2 text-green-400 hover:text-green-300 hover:bg-green-500/10 rounded-lg transition-all disabled:opacity-50"
              title="Approve"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            </button>
            <button
              onClick={() => handleAdminAction(res.id, 'reject')}
              disabled={isLoading}
              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-50"
              title="Reject"
            >
              <X className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Cancel button for non-terminal states */}
        {!TERMINAL_STATES.includes(res.status) && res.status !== STATUS.PENDING_OUT_OF_STOCK && res.status !== 'pending' && (
          <button
            onClick={async () => {
              if (await confirm('Are you sure you want to cancel this reservation?', { title: 'Cancel Reservation', destructive: true, confirmText: 'Cancel Reservation' })) {
                handleAdminAction(res.id, 'cancel');
              }
            }}
            disabled={isLoading}
            className="p-2 text-red-400/60 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-50"
            title="Cancel"
          >
            <Ban className="w-4 h-4" />
          </button>
        )}

        {/* Archive / Unarchive button */}
        {res.archived_at ? (
          <>
            <button
              onClick={() => handleArchive(res.id, true)}
              disabled={isLoading}
              className="p-2 text-blue-400/60 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-all disabled:opacity-50"
              title="Unarchive"
            >
              <ArchiveRestore className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDelete(res.id)}
              disabled={isLoading}
              className="p-2 text-red-500/40 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-50"
              title="Delete permanently"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </>
        ) : (
          <button
            onClick={() => handleArchive(res.id, false)}
            disabled={isLoading}
            className="p-2 text-white/30 hover:text-white/60 hover:bg-white/10 rounded-lg transition-all disabled:opacity-50"
            title="Archive"
          >
            <Archive className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Reservations</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleArchived}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
              showArchived
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            <Archive className="w-4 h-4" />
            {showArchived ? 'Showing Archived' : 'Show Archived'}
          </button>
          <button
            onClick={() => loadReservations()}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-white/10 text-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
        {TABS.map((tab) => {
          const count = tab.key === 'all'
            ? reservations.length
            : reservations.filter((r) => r.status === tab.key).length;
          if (tab.key !== 'all' && count === 0) return null; // Hide empty tabs
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-primary/20 text-primary border border-primary/30'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              {tab.label}
              <span className="ml-1 text-xs opacity-70">({count})</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-white/40 text-lg">No reservations found</p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block rounded-xl border border-white/10 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="text-left px-4 py-3 text-white/60 text-sm font-medium">Client</th>
                  <th className="text-left px-4 py-3 text-white/60 text-sm font-medium">Event Date</th>
                  <th className="text-left px-4 py-3 text-white/60 text-sm font-medium">Status</th>
                  <th className="text-left px-4 py-3 text-white/60 text-sm font-medium">Deposit</th>
                  <th className="text-left px-4 py-3 text-white/60 text-sm font-medium">Total</th>
                  <th className="text-right px-4 py-3 text-white/60 text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((res) => (
                  <tr key={res.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3">
                      <div className="text-white text-sm font-medium">{getClientName(res)}</div>
                      <div className="text-white/50 text-xs">{res.client_email || res.client_phone}</div>
                    </td>
                    <td className="px-4 py-3 text-white/80 text-sm">{formatDate(res.event_date)}</td>
                    <td className="px-4 py-3"><StatusBadge status={res.status} /></td>
                    <td className="px-4 py-3 text-white/60 text-sm">
                      {res.deposit_amount ? `$${Number(res.deposit_amount).toFixed(2)}` : '-'}
                    </td>
                    <td className="px-4 py-3 text-primary font-semibold text-sm">
                      ${res.total?.toFixed(2) || '0.00'}
                    </td>
                    <td className="px-4 py-3">{renderActions(res)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {filtered.map((res) => (
              <div key={res.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-white font-semibold text-sm">{getClientName(res)}</h3>
                    <p className="text-white/50 text-xs">{res.client_email || res.client_phone}</p>
                  </div>
                  <StatusBadge status={res.status} />
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                  <div>
                    <span className="text-white/50 text-xs">Event</span>
                    <p className="text-white/80">{formatDate(res.event_date)}</p>
                  </div>
                  <div>
                    <span className="text-white/50 text-xs">Total</span>
                    <p className="text-primary font-bold">${res.total?.toFixed(2) || '0.00'}</p>
                  </div>
                </div>
                <div className="flex items-center justify-end">{renderActions(res)}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
