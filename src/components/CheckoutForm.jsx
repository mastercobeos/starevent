import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, CheckCircle, AlertCircle, Loader2, Clock, CreditCard } from 'lucide-react';
import { Button } from './ui/button';
import { useCart } from '../contexts/CartContext';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../translations';
import { createReservation, checkAvailability } from '../lib/supabase';

const SQUARE_APP_ID = import.meta.env.VITE_SQUARE_APP_ID;
const SQUARE_LOCATION_ID = import.meta.env.VITE_SQUARE_LOCATION_ID;

export default function CheckoutForm({ onBack }) {
  const { items, getTotal, clearCart } = useCart();
  const { language } = useLanguage();
  const tc = translations[language].cart;

  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    eventDate: '',
    returnDate: '',
    eventAddress: '',
    notes: '',
  });

  const [errors, setErrors] = useState({});
  // idle | submitting | payment | processing | success | pending | error
  const [step, setStep] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [reservationId, setReservationId] = useState(null);
  const [savedTotal, setSavedTotal] = useState(0);
  const cardRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.fullName.trim()) newErrors.fullName = tc.requiredField;
    if (!form.phone.trim()) newErrors.phone = tc.requiredField;
    if (!form.eventDate) newErrors.eventDate = tc.requiredField;
    if (!form.returnDate) newErrors.returnDate = tc.requiredField;
    if (!form.eventAddress.trim()) newErrors.eventAddress = tc.requiredField;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const buildReservationData = (status) => ({
    client_name: form.fullName.trim(),
    client_email: form.email.trim() || null,
    client_phone: form.phone.trim(),
    event_date: form.eventDate,
    return_date: form.returnDate,
    event_address: form.eventAddress.trim(),
    notes: form.notes.trim() || null,
    total: getTotal(),
    status,
    items: items.map((item) => ({
      product_id: item.id,
      quantity: item.quantity,
      unit_price: item.price,
    })),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setStep('submitting');
    setErrorMessage('');

    try {
      const availabilityResults = await checkAvailability(
        items.map((item) => ({ id: item.id, quantity: item.quantity })),
        form.eventDate,
        form.returnDate
      );

      const unavailable = availabilityResults.filter((r) => !r.available);

      if (unavailable.length > 0) {
        // No stock → create as pending for admin review
        const reservation = await createReservation(buildReservationData('pending'));
        setReservationId(reservation.id);
        setStep('pending');
        clearCart();
        return;
      }

      // Stock available → auto-confirm
      const total = getTotal();
      const reservation = await createReservation(buildReservationData('confirmed'));
      setReservationId(reservation.id);
      setSavedTotal(total);

      // If Square is configured, show payment step
      if (SQUARE_APP_ID && SQUARE_LOCATION_ID) {
        setStep('payment');
      } else {
        // No Square yet → just confirm without payment
        setStep('success');
        clearCart();
      }
    } catch (err) {
      console.error('Reservation error:', err);
      setErrorMessage(tc.reservationError);
      setStep('error');
    }
  };

  // Initialize Square card when payment step is shown
  useEffect(() => {
    if (step !== 'payment' || !SQUARE_APP_ID || !SQUARE_LOCATION_ID) return;

    let card;
    const initSquare = async () => {
      try {
        if (!window.Square) {
          console.error('Square SDK not loaded');
          return;
        }
        const payments = window.Square.payments(SQUARE_APP_ID, SQUARE_LOCATION_ID);
        card = await payments.card();
        await card.attach('#square-card-container');
        cardRef.current = card;
      } catch (err) {
        console.error('Square init error:', err);
      }
    };

    initSquare();
    return () => { if (card) card.destroy(); };
  }, [step]);

  const handlePayment = async () => {
    if (!cardRef.current) return;

    setStep('processing');
    setErrorMessage('');

    try {
      const result = await cardRef.current.tokenize();
      if (result.status !== 'OK') {
        setErrorMessage(tc.paymentError);
        setStep('payment');
        return;
      }

      // Send token to Supabase Edge Function to process payment
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-payment`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sourceId: result.token,
            amount: Math.round(savedTotal * 100),
            reservationId,
          }),
        }
      );

      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || 'Payment failed');
      }

      setStep('success');
      clearCart();
    } catch (err) {
      console.error('Payment error:', err);
      setErrorMessage(tc.paymentError);
      setStep('payment');
    }
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];
  const minReturnDate = form.eventDate
    ? new Date(new Date(form.eventDate).getTime() + 86400000).toISOString().split('T')[0]
    : minDate;

  // ---- PENDING STATE (no stock → admin reviews) ----
  if (step === 'pending') {
    return (
      <div className="text-center py-12">
        <Clock className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
        <h3 className="text-white text-xl font-bold mb-2">{tc.pendingTitle}</h3>
        <p className="text-white/70 mb-6 text-sm leading-relaxed">{tc.reservationPending}</p>
        <Button onClick={onBack} className="bg-primary hover:bg-primary/90 text-primary-foreground">
          {language === 'en' ? 'Close' : 'Cerrar'}
        </Button>
      </div>
    );
  }

  // ---- SUCCESS STATE ----
  if (step === 'success') {
    return (
      <div className="text-center py-12">
        <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
        <h3 className="text-white text-xl font-bold mb-2">
          {SQUARE_APP_ID ? tc.paidTitle : tc.confirmedTitle}
        </h3>
        <p className="text-white/70 mb-6 text-sm leading-relaxed">{tc.reservationSuccess}</p>
        <Button onClick={onBack} className="bg-primary hover:bg-primary/90 text-primary-foreground">
          {language === 'en' ? 'Close' : 'Cerrar'}
        </Button>
      </div>
    );
  }

  // ---- PAYMENT STEP (Square card form) ----
  if (step === 'payment' || step === 'processing') {
    return (
      <div>
        <div className="flex items-center gap-3 mb-5">
          <CreditCard className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold text-white">{tc.paymentTitle}</h2>
        </div>

        <div className="mb-4 p-3 rounded-lg bg-white/5 border border-white/10">
          <div className="flex justify-between text-sm font-bold">
            <span className="text-white">{tc.total}</span>
            <span className="text-primary">${savedTotal.toFixed(2)}</span>
          </div>
        </div>

        <p className="text-white/60 text-sm mb-4">{tc.paymentDesc}</p>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/30 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
            <p className="text-red-300 text-sm">{errorMessage}</p>
          </div>
        )}

        <div id="square-card-container" className="mb-4 rounded-lg overflow-hidden" style={{ minHeight: '89px' }} />

        <Button
          onClick={handlePayment}
          disabled={step === 'processing'}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 text-base shadow-lg disabled:opacity-50"
        >
          {step === 'processing' ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              {tc.processing}
            </span>
          ) : (
            `${tc.proceedToPayment} - $${savedTotal.toFixed(2)}`
          )}
        </Button>
      </div>
    );
  }

  // ---- FORM STEP ----
  const inputClass =
    'w-full px-3 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all text-sm';
  const labelClass = 'block text-white/80 text-sm font-medium mb-1';
  const errorClass = 'text-red-400 text-xs mt-1';

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <button onClick={onBack} className="text-white/70 hover:text-white p-1 rounded-full hover:bg-white/10 transition-all">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-bold text-white">{tc.checkoutTitle}</h2>
      </div>

      <div className="mb-5 p-3 rounded-lg bg-white/5 border border-white/10">
        <h3 className="text-white/80 text-sm font-semibold mb-2">{tc.orderSummary}</h3>
        {items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm py-1">
            <span className="text-white/60">
              {language === 'en' ? item.name : (item.nameEs || item.name)} x{item.quantity}
            </span>
            <span className="text-white/80">${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
        <div className="flex justify-between text-sm font-bold pt-2 mt-2 border-t border-white/10">
          <span className="text-white">{tc.total}</span>
          <span className="text-primary">${getTotal().toFixed(2)}</span>
        </div>
      </div>

      {step === 'error' && errorMessage && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/30 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
          <p className="text-red-300 text-sm">{errorMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className={labelClass}>{tc.fullName} *</label>
          <input type="text" name="fullName" value={form.fullName} onChange={handleChange} className={inputClass} placeholder="John Doe" />
          {errors.fullName && <p className={errorClass}>{errors.fullName}</p>}
        </div>

        <div>
          <label className={labelClass}>{tc.phone} *</label>
          <input type="tel" name="phone" value={form.phone} onChange={handleChange} className={inputClass} placeholder="(281) 636-0615" />
          {errors.phone && <p className={errorClass}>{errors.phone}</p>}
        </div>

        <div>
          <label className={labelClass}>{tc.email}</label>
          <input type="email" name="email" value={form.email} onChange={handleChange} className={inputClass} placeholder="email@example.com" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>{tc.eventDate} *</label>
            <input type="date" name="eventDate" value={form.eventDate} onChange={handleChange} min={minDate} className={`${inputClass} [color-scheme:dark]`} />
            {errors.eventDate && <p className={errorClass}>{errors.eventDate}</p>}
          </div>
          <div>
            <label className={labelClass}>{tc.returnDate} *</label>
            <input type="date" name="returnDate" value={form.returnDate} onChange={handleChange} min={minReturnDate} className={`${inputClass} [color-scheme:dark]`} />
            {errors.returnDate && <p className={errorClass}>{errors.returnDate}</p>}
          </div>
        </div>

        <div>
          <label className={labelClass}>{tc.eventAddress} *</label>
          <input type="text" name="eventAddress" value={form.eventAddress} onChange={handleChange} className={inputClass} placeholder="123 Main St, Houston, TX" />
          {errors.eventAddress && <p className={errorClass}>{errors.eventAddress}</p>}
        </div>

        <div>
          <label className={labelClass}>{tc.notes}</label>
          <textarea name="notes" value={form.notes} onChange={handleChange} rows={2} className={`${inputClass} resize-none`} />
        </div>

        <Button
          type="submit"
          disabled={step === 'submitting'}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 text-base shadow-lg disabled:opacity-50"
        >
          {step === 'submitting' ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              {tc.submitting}
            </span>
          ) : (
            tc.confirmReservation
          )}
        </Button>
      </form>
    </div>
  );
}
