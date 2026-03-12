'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { CreditCard, Loader2, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';
import { STATUS } from '@/lib/reservation-state-machine';
import { translations } from '@/translations';

export default function PayBalancePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const lang = searchParams.get('lang') || 'en';
  const tr = translations[lang]?.reservation || translations.en.reservation;

  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = searchParams.get('token') || '';
        const res = await fetch(`/api/reservations/${params.id}`, {
          headers: { 'x-access-token': token },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Not found');
        setReservation(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
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
          <p className="text-white text-lg">{error || 'Not found'}</p>
        </div>
      </div>
    );
  }

  // Already paid in full
  if (reservation.status === STATUS.PAID_IN_FULL || reservation.status === STATUS.COMPLETED) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center py-8 px-4">
        <div className="text-center max-w-md">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">
            {tr.paidInFull}
          </h2>
          <p className="text-white/60 text-sm">
            {tr.balancePaidThankYou}
          </p>
        </div>
      </div>
    );
  }

  const balancePayment = (reservation.payments || []).find((p) => p.type === 'balance');
  const invoiceUrl = balancePayment?.square_invoice_url;
  const balanceAmount = Number(reservation.balance_amount);

  return (
    <div className="min-h-screen bg-gray-950 py-8 px-4">
      <div className="max-w-md mx-auto text-center">
        <CreditCard className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">
          {tr.balancePaymentDue}
        </h2>
        <p className="text-white/60 mb-2 text-sm">
          {tr.balanceMustBePaid}
        </p>

        <div className="my-6 p-4 rounded-xl bg-white/5 border border-white/10">
          <div className="text-3xl font-bold text-primary mb-1">${balanceAmount.toFixed(2)}</div>
          <div className="text-white/40 text-sm">
            {tr.balance60}
          </div>
          <div className="text-white/50 text-xs mt-1">
            {tr.event}: {reservation.event_date}
          </div>
        </div>

        {invoiceUrl ? (
          <a
            href={invoiceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 px-8 rounded-lg shadow-lg text-base transition-all"
          >
            <CreditCard className="w-5 h-5" />
            {tr.payNow}
            <ExternalLink className="w-4 h-4" />
          </a>
        ) : (
          <p className="text-white/50 text-sm">
            {tr.contactToPay}
          </p>
        )}

        <p className="mt-6 text-white/30 text-xs">
          {tr.reservation} #{reservation.id?.slice(0, 8).toUpperCase()}
        </p>
      </div>
    </div>
  );
}
