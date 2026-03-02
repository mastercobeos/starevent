'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { CheckCircle, Clock, FileText, CreditCard, AlertCircle, Loader2, ExternalLink } from 'lucide-react';
import { STATUS_LABELS, STATUS_COLORS, STATUS } from '@/lib/reservation-state-machine';
import { translations } from '@/translations';

function getStepIndex(status) {
  switch (status) {
    case STATUS.PENDING_OUT_OF_STOCK: return 0;
    case STATUS.APPROVED_WAITING_CONTRACT: return 1;
    case STATUS.CONTRACT_SIGNED: return 2;
    case STATUS.DEPOSIT_PAID:
    case STATUS.BALANCE_DUE: return 3;
    case STATUS.PAID_IN_FULL:
    case STATUS.COMPLETED: return 5;
    case STATUS.CANCELLED:
    case STATUS.HOLD_EXPIRED: return -1;
    default: return 0;
  }
}

export default function ReservationStatusPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const lang = searchParams.get('lang') || 'en';
  const tr = translations[lang]?.reservation || translations.en.reservation;

  const STEPS = [
    { key: 'submitted', label: tr.stepSubmitted },
    { key: 'approved', label: tr.stepApproved },
    { key: 'signed', label: tr.stepSigned },
    { key: 'deposit', label: tr.stepDeposit },
    { key: 'balance', label: tr.stepBalance },
  ];

  useEffect(() => {
    const fetchReservation = async () => {
      try {
        const token = searchParams.get('token') || '';
        const res = await fetch(`/api/reservations/${params.id}?token=${token}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Not found');
        setReservation(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchReservation();
  }, [params.id, searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !reservation) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className="text-white text-lg">{error || 'Reservation not found'}</p>
        </div>
      </div>
    );
  }

  const stepIndex = getStepIndex(reservation.status);
  const statusColors = STATUS_COLORS[reservation.status] || STATUS_COLORS[STATUS.PENDING_OUT_OF_STOCK];
  const statusLabel = STATUS_LABELS[lang]?.[reservation.status] || reservation.status;
  const isCancelled = reservation.status === STATUS.CANCELLED || reservation.status === STATUS.HOLD_EXPIRED;

  // Find balance invoice URL
  const balancePayment = (reservation.payments || []).find((p) => p.type === 'balance');
  const depositPayment = (reservation.payments || []).find((p) => p.type === 'deposit');

  return (
    <div className="min-h-screen bg-gray-950 py-8 px-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">Star Event Rental</h1>
          <p className="text-white/50 text-sm">
            {tr.reservation} #{reservation.id?.slice(0, 8).toUpperCase()}
          </p>
        </div>

        {/* Status Badge */}
        <div className="text-center mb-6">
          <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${statusColors.bg} ${statusColors.text} border ${statusColors.border}`}>
            {isCancelled ? <AlertCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
            {statusLabel}
          </span>
        </div>

        {/* Progress Stepper */}
        {!isCancelled && (
          <div className="flex items-center justify-between mb-8 px-2">
            {STEPS.map((s, i) => (
              <React.Fragment key={s.key}>
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                    i < stepIndex ? 'bg-primary border-primary text-primary-foreground' :
                    i === stepIndex ? 'border-primary text-primary bg-primary/20' :
                    'border-white/20 text-white/30'
                  }`}>
                    {i < stepIndex ? <CheckCircle className="w-4 h-4" /> : i + 1}
                  </div>
                  <span className={`text-[10px] mt-1 ${i <= stepIndex ? 'text-white/80' : 'text-white/30'}`}>
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-1 ${i < stepIndex ? 'bg-primary' : 'bg-white/10'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Reservation Details */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 mb-4">
          <h3 className="text-white font-semibold mb-3">
            {tr.eventDetails}
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-white/50">{tr.client}</span>
              <span className="text-white">{reservation.first_name} {reservation.last_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">{tr.eventDate}</span>
              <span className="text-white">{reservation.event_date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">{tr.address}</span>
              <span className="text-white text-right max-w-[200px]">{reservation.event_address}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-white/10 font-bold">
              <span className="text-white">Total</span>
              <span className="text-primary">${Number(reservation.total).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Payment Info */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 mb-4">
          <h3 className="text-white font-semibold mb-3">
            {tr.payments}
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-white/50">{tr.deposit40}</span>
              <span className={depositPayment?.status === 'completed' ? 'text-green-400' : 'text-yellow-400'}>
                ${Number(reservation.deposit_amount).toFixed(2)} — {depositPayment?.status === 'completed' ? tr.paid : tr.pending}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/50">{tr.balance60}</span>
              <span className={balancePayment?.status === 'completed' ? 'text-green-400' : 'text-white/60'}>
                ${Number(reservation.balance_amount).toFixed(2)} — {balancePayment?.status === 'completed' ? tr.paid : tr.due(reservation.event_date)}
              </span>
            </div>
          </div>

          {/* Pay balance button */}
          {reservation.status === STATUS.BALANCE_DUE && balancePayment?.square_invoice_url && (
            <a
              href={balancePayment.square_invoice_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 w-full inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 px-4 rounded-lg transition-all text-sm"
            >
              <CreditCard className="w-4 h-4" />
              {tr.payBalance} — ${Number(reservation.balance_amount).toFixed(2)}
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        {/* Contract link */}
        {reservation.contracts?.[0]?.status === 'signed' && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <div className="flex items-center gap-2 text-white/70 text-sm">
              <FileText className="w-4 h-4" />
              <span>{tr.contractSignedWith}</span>
              <span className="font-bold text-white">{reservation.contracts[0].initials}</span>
              <span className="text-white/40 ml-auto text-xs">
                {new Date(reservation.contracts[0].signed_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
