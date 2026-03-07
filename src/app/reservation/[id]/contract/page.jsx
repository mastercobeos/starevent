'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { FileText, PenLine, Loader2, AlertCircle, CheckCircle, CreditCard, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getInitials } from '@/lib/contract-template';
import { translations } from '@/translations';

export default function ContractPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const lang = searchParams.get('lang') || 'en';
  const tr = translations[lang]?.reservation || translations.en.reservation;

  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [initials, setInitials] = useState('');
  const [signing, setSigning] = useState(false);
  const [signed, setSigned] = useState(false);
  const [invoiceUrl, setInvoiceUrl] = useState('');
  const [depositAmount, setDepositAmount] = useState(0);

  useEffect(() => {
    const fetchReservation = async () => {
      try {
        const token = searchParams.get('token') || '';
        const res = await fetch(`/api/reservations/${params.id}?token=${token}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Not found');
        setReservation(data);
        setInitials(getInitials(data.first_name, data.last_name));
        setDepositAmount(Number(data.deposit_amount));

        // Check if already signed
        if (data.contracts?.[0]?.status === 'signed') {
          setSigned(true);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchReservation();
  }, [params.id, searchParams]);

  const handleSign = async () => {
    if (!initials.trim() || initials.trim().length < 2) {
      setError(tr.enterInitials);
      return;
    }

    setSigning(true);
    setError('');

    try {
      const contract = reservation.contracts?.[0];
      if (!contract) throw new Error('Contract not found');

      const token = searchParams.get('token') || '';
      const res = await fetch(`/api/reservations/${params.id}/sign-contract?token=${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          initials: initials.trim(),
          contract_hash: contract.contract_hash,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || 'Signing failed');

      setSigned(true);

      // Create deposit invoice
      const payRes = await fetch(`/api/reservations/${params.id}/pay-deposit?token=${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const payData = await payRes.json();
      if (payData.invoice_url) setInvoiceUrl(payData.invoice_url);
    } catch (err) {
      setError(err.message);
    } finally {
      setSigning(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error && !reservation) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className="text-white text-lg">{error}</p>
        </div>
      </div>
    );
  }

  const contract = reservation?.contracts?.[0];

  // Already signed → show success + payment link
  if (signed) {
    return (
      <div className="min-h-screen bg-gray-950 py-8 px-4">
        <div className="max-w-lg mx-auto text-center">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">
            {tr.contractSigned}
          </h2>
          <p className="text-white/60 mb-6 text-sm">
            {tr.depositReady(depositAmount.toFixed(2))}
          </p>

          {invoiceUrl ? (
            <a
              href={invoiceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 px-6 rounded-lg shadow-lg text-base"
            >
              <CreditCard className="w-5 h-5" />
              {tr.payDeposit} — ${depositAmount.toFixed(2)}
              <ExternalLink className="w-4 h-4" />
            </a>
          ) : (
            <p className="text-white/50 text-sm">
              {tr.invoiceWillBeSent}
            </p>
          )}

          <div className="mt-6">
            <button
              onClick={() => router.push(`/reservation/${params.id}?lang=${lang}`)}
              className="text-primary/70 hover:text-primary text-sm underline"
            >
              {tr.viewReservationStatus}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 py-8 px-4">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <FileText className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-bold text-white">
            {tr.reviewSignContract}
          </h1>
        </div>

        {/* Contract HTML */}
        {contract?.contract_html && (
          <div
            className="mb-5 rounded-lg bg-white overflow-y-auto border border-white/20"
            style={{ maxHeight: '400px' }}
            dangerouslySetInnerHTML={{ __html: contract.contract_html }}
          />
        )}

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/30 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {/* Initials input */}
        <div className="mb-5">
          <label className="block text-white/80 text-sm font-medium mb-1">
            <PenLine className="w-3.5 h-3.5 inline mr-1" />
            {tr.yourInitials}
          </label>
          <input
            type="text"
            value={initials}
            onChange={(e) => setInitials(e.target.value.toUpperCase().slice(0, 4))}
            className="w-full px-3 py-3 rounded-lg bg-white/10 border border-white/20 text-white text-center text-xl font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="JD"
            maxLength={4}
          />
        </div>

        <Button
          onClick={handleSign}
          disabled={signing || !initials.trim()}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 text-base shadow-lg disabled:opacity-50"
        >
          {signing ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              {tr.signing}
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <PenLine className="w-4 h-4" />
              {tr.signContract}
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}
