'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchAdminReservation, adminAction, archiveReservation, unarchiveReservation, deleteReservation } from '../../lib/admin-api';
import StatusBadge from './StatusBadge';
import { STATUS, TERMINAL_STATES, STATUS_LABELS } from '../../lib/reservation-state-machine';
import { Button } from '../ui/button';
import {
  ArrowLeft, Loader2, User, MapPin, Calendar, Phone, Mail,
  FileText, CreditCard, Clock, Check, X, Ban, Home, Building2, Wrench, ExternalLink, Archive, ArchiveRestore, Trash2,
} from 'lucide-react';

export default function ReservationDetailPage({ id }) {
  const router = useRouter();
  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showContract, setShowContract] = useState(false);

  const load = async () => {
    try {
      const data = await fetchAdminReservation(id);
      setReservation(data);
    } catch (err) {
      console.error('Error loading reservation:', err);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [id]);

  const handleAction = async (action) => {
    setActionLoading(true);
    try {
      await adminAction(id, action);
      await load();
    } catch (err) {
      console.error('Action error:', err);
      alert(err.message || 'Action failed');
    }
    setActionLoading(false);
  };

  const handleArchive = async (isArchived) => {
    const action = isArchived ? 'unarchive' : 'archive';
    if (!confirm(`Are you sure you want to ${action} this reservation?`)) return;
    setActionLoading(true);
    try {
      if (isArchived) {
        await unarchiveReservation(id);
      } else {
        await archiveReservation(id);
      }
      await load();
    } catch (err) {
      console.error(`${action} failed:`, err);
      alert(err.message || `${action} failed`);
    }
    setActionLoading(false);
  };

  const handleDelete = async () => {
    if (!confirm('PERMANENTLY DELETE this reservation and all its data? This cannot be undone.')) return;
    setActionLoading(true);
    try {
      await deleteReservation(id);
      router.push('/admin');
    } catch (err) {
      console.error('Delete failed:', err);
      alert(err.message || 'Delete failed');
      setActionLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="text-center py-16">
        <p className="text-white/40 text-lg mb-4">Reservation not found</p>
        <Button onClick={() => router.push('/admin')} variant="outline" className="border-white/20 text-white">
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const r = reservation;
  const clientName = (r.first_name && r.last_name) ? `${r.first_name} ${r.last_name}` : r.client_name;
  const cardClass = 'rounded-xl border border-white/10 bg-white/5 p-5';
  const contract = r.contracts?.[0] || r.contracts;
  const payments = r.payments || [];
  const depositPayment = payments.find((p) => p.type === 'deposit');
  const balancePayment = payments.find((p) => p.type === 'balance');
  const statusLog = r.reservation_status_log || [];
  const isTerminal = TERMINAL_STATES.includes(r.status);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.push('/admin')} className="text-white/70 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-all">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-white">Reservation #{r.id.slice(0, 8)}</h1>
          <p className="text-white/50 text-sm">
            Created {new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <StatusBadge status={r.status} />
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 mb-6">
        {(r.status === STATUS.PENDING_OUT_OF_STOCK || r.status === 'pending') && (
          <>
            <Button
              onClick={() => handleAction('approve')}
              disabled={actionLoading}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold"
            >
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
              Approve Reservation
            </Button>
            <Button
              onClick={() => handleAction('reject')}
              disabled={actionLoading}
              variant="outline"
              className="border-red-500/50 text-red-400 hover:bg-red-500/10"
            >
              <X className="w-4 h-4 mr-2" /> Reject
            </Button>
          </>
        )}

        {!isTerminal && r.status !== STATUS.PENDING_OUT_OF_STOCK && r.status !== 'pending' && (
          <Button
            onClick={() => { if (confirm('Cancel this reservation?')) handleAction('cancel'); }}
            disabled={actionLoading}
            variant="outline"
            className="border-red-500/30 text-red-400/70 hover:bg-red-500/10"
          >
            <Ban className="w-4 h-4 mr-2" /> Cancel
          </Button>
        )}

        {r.archived_at ? (
          <>
            <Button
              onClick={() => handleArchive(true)}
              disabled={actionLoading}
              variant="outline"
              className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
            >
              <ArchiveRestore className="w-4 h-4 mr-2" /> Unarchive
            </Button>
            <Button
              onClick={handleDelete}
              disabled={actionLoading}
              variant="outline"
              className="border-red-600/30 text-red-500 hover:bg-red-600/10"
            >
              <Trash2 className="w-4 h-4 mr-2" /> Delete Permanently
            </Button>
          </>
        ) : (
          <Button
            onClick={() => handleArchive(false)}
            disabled={actionLoading}
            variant="outline"
            className="border-white/20 text-white/60 hover:bg-white/10"
          >
            <Archive className="w-4 h-4 mr-2" /> Archive
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Client Info */}
        <div className={cardClass}>
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-primary" /> Client Information
          </h2>
          <div className="space-y-3">
            <div>
              <span className="text-white/50 text-xs">Name</span>
              <p className="text-white">{clientName}</p>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-white/40" />
              <a href={`tel:${r.phone_1 || r.client_phone}`} className="text-white hover:text-primary">{r.phone_1 || r.client_phone}</a>
              {r.phone_2 && <span className="text-white/40">/ {r.phone_2}</span>}
            </div>
            {(r.client_email) && (
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-white/40" />
                <a href={`mailto:${r.client_email}`} className="text-white hover:text-primary">{r.client_email}</a>
              </div>
            )}
            {r.property_type && (
              <div className="flex items-center gap-2">
                {r.property_type === 'residential_backyard' ? <Home className="w-3.5 h-3.5 text-white/40" /> : <Building2 className="w-3.5 h-3.5 text-white/40" />}
                <span className="text-white/70 text-sm">{r.property_type === 'residential_backyard' ? 'Residential Backyard' : 'Event Hall / Venue'}</span>
              </div>
            )}
            {r.installation_required && (
              <div className="flex items-start gap-2">
                <Wrench className="w-3.5 h-3.5 text-white/40 mt-0.5" />
                <div>
                  <span className="text-white/70 text-sm">Installation Required</span>
                  {r.installation_details && <p className="text-white/50 text-xs">{r.installation_details}</p>}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Event Details */}
        <div className={cardClass}>
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" /> Event Details
          </h2>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-white/50 text-xs">Event Date</span>
                <p className="text-white text-sm">{formatDate(r.event_date)}</p>
                {r.event_start_time && <p className="text-white/50 text-xs">{r.event_start_time}{r.event_end_time ? ` — ${r.event_end_time}` : ''}</p>}
              </div>
              <div>
                <span className="text-white/50 text-xs">Return Date</span>
                <p className="text-white text-sm">{formatDate(r.return_date)}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="w-3.5 h-3.5 text-white/40 mt-1" />
              <p className="text-white text-sm">{r.event_address}</p>
            </div>
            {(r.special_notes || r.notes) && (
              <div className="flex items-start gap-2">
                <FileText className="w-3.5 h-3.5 text-white/40 mt-1" />
                <p className="text-white/70 text-sm">{r.special_notes || r.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payments Card */}
      <div className={`${cardClass} mb-4`}>
        <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-primary" /> Payments
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-3 rounded-lg bg-white/5">
            <span className="text-white/50 text-xs block">Total</span>
            <span className="text-primary font-bold text-lg">${Number(r.total).toFixed(2)}</span>
          </div>
          <div className="text-center p-3 rounded-lg bg-white/5">
            <span className="text-white/50 text-xs block">Deposit (40%)</span>
            <span className={`font-bold text-lg ${depositPayment?.status === 'completed' ? 'text-green-400' : 'text-yellow-400'}`}>
              ${Number(r.deposit_amount || 0).toFixed(2)}
            </span>
            <span className="block text-xs text-white/40">{depositPayment?.status || 'not created'}</span>
          </div>
          <div className="text-center p-3 rounded-lg bg-white/5">
            <span className="text-white/50 text-xs block">Balance (60%)</span>
            <span className={`font-bold text-lg ${balancePayment?.status === 'completed' ? 'text-green-400' : 'text-white/60'}`}>
              ${Number(r.balance_amount || 0).toFixed(2)}
            </span>
            <span className="block text-xs text-white/40">{balancePayment?.status || 'not created'}</span>
          </div>
        </div>
        {/* Square Invoice Links */}
        {(depositPayment?.square_invoice_url || balancePayment?.square_invoice_url) && (
          <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap gap-2">
            {depositPayment?.square_invoice_url && (
              <a href={depositPayment.square_invoice_url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-primary/70 hover:text-primary">
                <ExternalLink className="w-3 h-3" /> Deposit Invoice
              </a>
            )}
            {balancePayment?.square_invoice_url && (
              <a href={balancePayment.square_invoice_url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-primary/70 hover:text-primary">
                <ExternalLink className="w-3 h-3" /> Balance Invoice
              </a>
            )}
          </div>
        )}
      </div>

      {/* Contract Card */}
      {contract && (
        <div className={`${cardClass} mb-4`}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" /> Contract
            </h2>
            <StatusBadge status={contract.status === 'signed' ? STATUS.CONTRACT_SIGNED : (contract.status === 'voided' ? STATUS.CANCELLED : STATUS.APPROVED_WAITING_CONTRACT)} />
          </div>
          {contract.status === 'signed' && (
            <div className="space-y-1 text-sm text-white/60">
              <p>Initials: <strong className="text-white">{contract.initials}</strong></p>
              <p>Signed: {new Date(contract.signed_at).toLocaleString()}</p>
              {contract.signer_ip && <p className="text-xs">IP: {contract.signer_ip}</p>}
            </div>
          )}
          <button
            onClick={() => setShowContract(!showContract)}
            className="mt-2 text-primary/70 hover:text-primary text-xs underline"
          >
            {showContract ? 'Hide Contract' : 'View Contract'}
          </button>
          {showContract && contract.contract_html && (
            <div
              className="mt-3 rounded-lg bg-white overflow-y-auto border border-white/20"
              style={{ maxHeight: '400px' }}
              dangerouslySetInnerHTML={{ __html: contract.contract_html }}
            />
          )}
        </div>
      )}

      {/* Order Items */}
      <div className={`${cardClass} mb-4`}>
        <h2 className="text-white font-semibold mb-4">Order Items</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-2 text-white/50 text-sm font-medium">Product</th>
                <th className="text-center py-2 text-white/50 text-sm font-medium">Qty</th>
                <th className="text-right py-2 text-white/50 text-sm font-medium">Price</th>
                <th className="text-right py-2 text-white/50 text-sm font-medium">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {r.reservation_items?.map((item, idx) => (
                <tr key={idx} className="border-b border-white/5">
                  <td className="py-3 text-white text-sm">
                    {item.products?.name || item.product_id}
                    {item.products?.category && <span className="text-white/40 text-xs ml-2">({item.products.category})</span>}
                  </td>
                  <td className="py-3 text-white/80 text-sm text-center">{item.quantity}</td>
                  <td className="py-3 text-white/80 text-sm text-right">${item.unit_price?.toFixed(2)}</td>
                  <td className="py-3 text-white text-sm text-right font-medium">${(item.subtotal || item.unit_price * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              {r.delivery_fee > 0 && (
                <tr className="border-t border-white/10">
                  <td colSpan={3} className="py-2 text-white/60 text-sm text-right">
                    Delivery ({r.delivery_miles} mi)
                  </td>
                  <td className="py-2 text-white/80 text-sm text-right">${Number(r.delivery_fee).toFixed(2)}</td>
                </tr>
              )}
              <tr className="border-t border-white/10">
                <td colSpan={3} className="py-3 text-white font-bold text-right">Total</td>
                <td className="py-3 text-primary font-bold text-right text-lg">${r.total?.toFixed(2) || '0.00'}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Status Timeline */}
      {statusLog.length > 0 && (
        <div className={cardClass}>
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" /> Status Timeline
          </h2>
          <div className="space-y-3">
            {statusLog.map((log, idx) => (
              <div key={log.id || idx} className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {log.from_status && (
                      <span className="text-white/40 text-xs">{STATUS_LABELS.en[log.from_status] || log.from_status}</span>
                    )}
                    <span className="text-white/30 text-xs">&rarr;</span>
                    <span className="text-white text-xs font-medium">{STATUS_LABELS.en[log.to_status] || log.to_status}</span>
                    <span className="text-white/30 text-xs ml-auto">{log.changed_by}</span>
                  </div>
                  <p className="text-white/40 text-xs">{new Date(log.created_at).toLocaleString()}</p>
                  {log.reason && <p className="text-white/50 text-xs">{log.reason}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
