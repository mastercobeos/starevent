'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ArrowLeft, CheckCircle, AlertCircle, Loader2, Clock,
  CreditCard, MapPin, FileText, PenLine, ExternalLink,
  Home, Building2, Wrench,
} from 'lucide-react';
import { Button } from './ui/button';
import { useCart } from '../contexts/CartContext';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../translations';
import { getInitials } from '../lib/contract-template';
import { calculateSplit } from '../lib/reservation-state-machine';

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
const SQUARE_APP_ID = process.env.NEXT_PUBLIC_SQUARE_APP_ID;
const SQUARE_LOCATION_ID = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID;
const SQUARE_ENV = process.env.NEXT_PUBLIC_SQUARE_ENVIRONMENT || 'sandbox';

// Warehouse origin: 3730 Redwood Falls Dr, Houston, TX 77082
const ORIGIN = { lat: 29.7233, lng: -95.5977 };
const DELIVERY_TIERS = [
  { maxMiles: 20, fee: 35 },
  { maxMiles: 40, fee: 60 },
  { maxMiles: 60, fee: 120 },
];
const MAX_DELIVERY_MILES = 60;
const TAX_RATE = 0.0825;
const SAME_DAY_PICKUP_FEE = 40;

function loadGoogleMaps() {
  if (window.google?.maps) return Promise.resolve();
  if (!GOOGLE_MAPS_API_KEY) return Promise.reject(new Error('No API key'));
  if (window._gmapsLoading) return window._gmapsLoading;
  window._gmapsLoading = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Maps'));
    document.head.appendChild(script);
  });
  return window._gmapsLoading;
}

const SQUARE_SDK_URL = SQUARE_ENV === 'production'
  ? 'https://web.squarecdn.com/v1/square.js'
  : 'https://sandbox.web.squarecdn.com/v1/square.js';

export default function CheckoutForm({ onBack }) {
  const { items, getTotal, clearCart } = useCart();
  const { language } = useLanguage();
  const t = translations[language];
  const tc = t.cart;
  const tr = t.reservation;

  // --- Form state ---
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone1: '',
    phone2: '',
    eventAddress: '',
    propertyType: '',
    installationRequired: false,
    installationDetails: '',
    eventDate: '',
    returnDate: '',
    eventStartTime: '',
    eventEndTime: '',
    specialNotes: '',
    surfaceType: '',
    sameDayPickup: false,
  });

  const [errors, setErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState('');

  // Step: form | submitting | contract | signing | deposit | pending | success | error | holdExpired
  const [step, setStep] = useState('form');
  const [reservationId, setReservationId] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [contractHtml, setContractHtml] = useState('');
  const [contractHash, setContractHash] = useState('');
  const [depositAmount, setDepositAmount] = useState(0);
  const [balanceAmount, setBalanceAmount] = useState(0);
  const [invoiceUrl, setInvoiceUrl] = useState('');
  const [initials, setInitials] = useState('');

  // Square card payment state
  const [squareReady, setSquareReady] = useState(typeof window !== 'undefined' && !!window.Square);
  const [cardInstance, setCardInstance] = useState(null);
  const [cardLoading, setCardLoading] = useState(false);
  const [cardInitKey, setCardInitKey] = useState(0);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const cardContainerRef = useRef(null);

  // Delivery fee state
  const [deliveryFee, setDeliveryFee] = useState(null);
  const [deliveryMiles, setDeliveryMiles] = useState(null);
  const [calculatingDelivery, setCalculatingDelivery] = useState(false);
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const addressInputRef = useRef(null);
  const autocompleteRef = useRef(null);

  const needsSurface = items.some((item) =>
    item.id.startsWith('tent-') || item.id.startsWith('pkg-') || item.id.startsWith('dancefloor-')
  );

  // --- Load Square SDK ---
  useEffect(() => {
    if (window.Square) { setSquareReady(true); return; }
    // Avoid adding duplicate script tags
    const existing = document.querySelector(`script[src="${SQUARE_SDK_URL}"]`);
    if (existing) {
      const check = () => { if (window.Square) setSquareReady(true); };
      existing.addEventListener('load', check);
      return () => existing.removeEventListener('load', check);
    }
    const script = document.createElement('script');
    script.src = SQUARE_SDK_URL;
    script.async = true;
    script.onload = () => {
      if (window.Square) {
        setSquareReady(true);
      } else {
        console.error('Square SDK loaded but window.Square is undefined');
        setPaymentError('Payment system failed to initialize. Please refresh the page.');
      }
    };
    script.onerror = () => {
      console.error('Square SDK failed to load');
      setPaymentError('Payment system could not be loaded. Please check your connection and refresh.');
    };
    document.head.appendChild(script);
  }, []);

  // --- Google Maps ---
  useEffect(() => {
    loadGoogleMaps().then(() => setMapsLoaded(true)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!mapsLoaded || !addressInputRef.current || autocompleteRef.current) return;
    if (step !== 'form') return;
    const autocomplete = new window.google.maps.places.Autocomplete(addressInputRef.current, {
      componentRestrictions: { country: 'us' },
      fields: ['formatted_address', 'geometry'],
    });
    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (place.formatted_address) {
        setForm((prev) => ({ ...prev, eventAddress: place.formatted_address }));
        if (errors.eventAddress) setErrors((prev) => ({ ...prev, eventAddress: '' }));
        calculateDistance(place);
      }
    });
    autocompleteRef.current = autocomplete;
  }, [mapsLoaded, step]);

  const calculateDistance = useCallback((place) => {
    if (!window.google?.maps || !place.geometry) return;
    setCalculatingDelivery(true);
    const service = new window.google.maps.DistanceMatrixService();
    service.getDistanceMatrix(
      {
        origins: [new window.google.maps.LatLng(ORIGIN.lat, ORIGIN.lng)],
        destinations: [place.geometry.location],
        travelMode: window.google.maps.TravelMode.DRIVING,
        unitSystem: window.google.maps.UnitSystem.IMPERIAL,
      },
      (response, status) => {
        setCalculatingDelivery(false);
        if (status === 'OK' && response.rows[0]?.elements[0]?.status === 'OK') {
          const distanceMeters = response.rows[0].elements[0].distance.value;
          const miles = Math.round(distanceMeters / 1609.34);
          setDeliveryMiles(miles);
          if (miles > MAX_DELIVERY_MILES) {
            setDeliveryFee(null);
          } else {
            const tier = DELIVERY_TIERS.find((t) => miles <= t.maxMiles);
            setDeliveryFee(tier.fee);
          }
        }
      }
    );
  }, []);

  // --- Square Web Payments SDK ---
  useEffect(() => {
    if (step !== 'deposit' || cardInstance || !squareReady) return;
    let card;
    let cancelled = false;

    async function initCard() {
      setCardLoading(true);
      setPaymentError('');
      const MAX_RETRIES = 3;
      for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        if (cancelled) return;
        try {
          if (!window.Square) throw new Error('Square SDK not available');
          if (!SQUARE_APP_ID || !SQUARE_LOCATION_ID) throw new Error('Square credentials not configured');
          // Wait before retry attempts
          if (attempt > 0) await new Promise((r) => setTimeout(r, 1000 * attempt));
          if (cancelled) return;
          const payments = await window.Square.payments(SQUARE_APP_ID, SQUARE_LOCATION_ID);
          card = await payments.card();
          if (cancelled) return;
          // Wait for DOM container
          let container;
          for (let i = 0; i < 20; i++) {
            if (cancelled) return;
            container = document.getElementById('sq-card-container');
            if (container) break;
            await new Promise((r) => setTimeout(r, 100));
          }
          if (!container) throw new Error('Card container not found in DOM');
          await card.attach('#sq-card-container');
          if (!cancelled) { setCardInstance(card); setCardLoading(false); }
          return; // Success — exit retry loop
        } catch (err) {
          console.error(`Square card init attempt ${attempt + 1} error:`, err);
          if (card) { card.destroy().catch(() => {}); card = null; }
          if (attempt === MAX_RETRIES - 1 && !cancelled) {
            const detail = err?.message || String(err);
            setPaymentError(
              (language === 'en'
                ? 'Could not load payment form. Please refresh the page and try again.'
                : 'No se pudo cargar el formulario de pago. Actualice la página e intente de nuevo.')
              + ` [${detail}]`
            );
          }
        }
      }
      if (!cancelled) setCardLoading(false);
    }

    initCard();
    return () => {
      cancelled = true;
      if (card) {
        card.destroy().catch(() => {});
        setCardInstance(null);
      }
    };
  }, [step, squareReady, language, cardInitKey]);

  const handlePayDeposit = async () => {
    if (!cardInstance) return;
    setProcessingPayment(true);
    setPaymentError('');

    try {
      const tokenResult = await cardInstance.tokenize();
      if (tokenResult.status !== 'OK') {
        throw new Error(tokenResult.errors?.[0]?.message || 'Card validation failed');
      }

      const response = await fetch(`/api/reservations/${reservationId}/pay-deposit?token=${accessToken}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceId: tokenResult.token }),
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || 'Payment failed');
      }

      setStep('success');
    } catch (err) {
      console.error('Payment error:', err);
      setPaymentError(err.message || 'Payment failed');
    } finally {
      setProcessingPayment(false);
    }
  };

  const getTaxAmount = () => Math.round(getTotal() * TAX_RATE * 100) / 100;
  const getSameDayPickupFee = () => form.sameDayPickup ? SAME_DAY_PICKUP_FEE : 0;
  const getGrandTotal = () => getTotal() + getTaxAmount() + (deliveryFee || 0) + getSameDayPickupFee();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    if (name === 'eventAddress') { setDeliveryFee(null); setDeliveryMiles(null); }
  };

  // --- Validation ---
  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = tc.requiredField;
    if (!form.lastName.trim()) e.lastName = tc.requiredField;
    if (!form.email.trim()) e.email = tc.requiredField;
    if (!form.phone1.trim()) e.phone1 = tc.requiredField;
    if (!form.eventDate) e.eventDate = tc.requiredField;
    if (!form.returnDate) e.returnDate = tc.requiredField;
    if (!form.eventAddress.trim()) e.eventAddress = tc.requiredField;
    else if (deliveryMiles != null && deliveryMiles > MAX_DELIVERY_MILES) e.eventAddress = tc.deliveryOutOfRange;
    if (!form.propertyType) e.propertyType = tc.requiredField;
    if (needsSurface && !form.surfaceType) e.surfaceType = tc.requiredField;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // --- Submit reservation ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setStep('submitting');
    setErrorMessage('');

    try {
      const grandTotal = getGrandTotal();
      const idempKey = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idempotency_key: idempKey,
          first_name: form.firstName.trim(),
          last_name: form.lastName.trim(),
          client_email: form.email.trim(),
          phone_1: form.phone1.trim(),
          phone_2: form.phone2.trim() || null,
          address: form.eventAddress.trim(),
          property_type: form.propertyType,
          installation_required: form.installationRequired,
          installation_details: form.installationDetails.trim() || null,
          event_date: form.eventDate,
          return_date: form.returnDate,
          event_start_time: form.eventStartTime || null,
          event_end_time: form.eventEndTime || null,
          special_notes: form.specialNotes.trim() || null,
          language,
          items: items.map((item) => ({
            product_id: item.id,
            quantity: item.quantity,
            unit_price: item.price,
          })),
          subtotal: getTotal(),
          delivery_fee: deliveryFee || 0,
          delivery_miles: deliveryMiles,
          same_day_pickup: form.sameDayPickup,
          same_day_pickup_fee: getSameDayPickupFee(),
          tax_amount: getTaxAmount(),
          total: grandTotal,
        }),
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || 'Failed to create reservation');
      }

      setReservationId(data.reservation_id);
      setAccessToken(data.access_token);

      if (data.status === 'pending_out_of_stock') {
        // NO STOCK → show pending message
        setStep('pending');
        clearCart();
      } else {
        // STOCK OK → show contract
        setContractHtml(data.contract_html);
        setContractHash(data.contract_hash);
        setDepositAmount(data.deposit_amount);
        setBalanceAmount(data.balance_amount);
        setInitials(getInitials(form.firstName, form.lastName));
        setStep('contract');
      }
    } catch (err) {
      console.error('Reservation error:', err);
      setErrorMessage(err.message || tc.reservationError);
      setStep('error');
    }
  };

  // --- Sign contract ---
  const handleSignContract = async () => {
    if (!initials.trim() || initials.trim().length < 2) {
      setErrorMessage(tr.enterInitials);
      return;
    }

    setStep('signing');
    setErrorMessage('');

    try {
      const response = await fetch(`/api/reservations/${reservationId}/sign-contract?token=${accessToken}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initials: initials.trim(), contract_hash: contractHash }),
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || 'Failed to sign contract');
      }

      // Contract signed → show card payment form
      showDepositPayment();
    } catch (err) {
      console.error('Sign error:', err);
      setErrorMessage(err.message);
      setStep('contract');
    }
  };

  // --- Show card payment form after contract signing ---
  const showDepositPayment = () => {
    setCardInstance(null);
    setPaymentError('');
    setStep('deposit');
    clearCart();
  };

  // Retry card initialization (force re-run of the useEffect)
  const retryCardInit = () => {
    if (cardInstance) {
      cardInstance.destroy().catch(() => {});
    }
    setCardInstance(null);
    setPaymentError('');
    setCardInitKey((k) => k + 1);
  };

  // --- Date calculations ---
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];
  const minReturnDate = form.eventDate
    ? new Date(new Date(form.eventDate).getTime() + 86400000).toISOString().split('T')[0]
    : minDate;

  // --- Styling ---
  const inputClass = 'w-full px-3 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all text-sm';
  const labelClass = 'block text-white/80 text-sm font-medium mb-1';
  const errorCls = 'text-red-400 text-xs mt-1';

  // =============================================
  //  RENDER: PENDING (no stock)
  // =============================================
  if (step === 'pending') {
    return (
      <div className="text-center py-12">
        <Clock className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
        <h3 className="text-white text-xl font-bold mb-2">
          {tr.orderUnderReview}
        </h3>
        <p className="text-white/70 mb-6 text-sm leading-relaxed max-w-sm mx-auto">
          {tr.orderUnderReviewDesc}
        </p>
        <Button onClick={onBack} className="bg-primary hover:bg-primary/90 text-primary-foreground">
          {t.common.close}
        </Button>
      </div>
    );
  }

  // =============================================
  //  RENDER: DEPOSIT (card payment form)
  // =============================================
  if (step === 'deposit') {
    return (
      <div className="py-4">
        <div className="text-center mb-6">
          <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
          <h3 className="text-white text-xl font-bold mb-1">
            {tr.contractSigned}
          </h3>
          <p className="text-white/70 text-sm">
            {tr.depositReady(depositAmount.toFixed(2))}
          </p>
        </div>

        {/* Payment summary */}
        <div className="mb-5 p-3 rounded-lg bg-white/5 border border-white/10 space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-white/60">{tr.deposit40}</span>
            <span className="text-primary font-bold">${depositAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-white/60">{tr.balance60}</span>
            <span className="text-white/50">${balanceAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* Square Card Form */}
        <div className="mb-4">
          <label className="block text-white/80 text-sm font-medium mb-2">
            <CreditCard className="w-3.5 h-3.5 inline mr-1" />
            {language === 'en' ? 'Card Details' : 'Datos de Tarjeta'}
          </label>
          <div className="relative">
            <div
              id="sq-card-container"
              ref={cardContainerRef}
              className="min-h-[90px] rounded-lg bg-white/10 border border-white/20 p-2"
            />
            {cardLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/5 rounded-lg">
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
              </div>
            )}
          </div>
        </div>

        {paymentError && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/30">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
              <p className="text-red-300 text-sm">{paymentError}</p>
            </div>
            {!cardInstance && (
              <button
                onClick={retryCardInit}
                className="mt-2 w-full text-sm text-primary hover:text-primary/80 underline"
              >
                {language === 'en' ? 'Retry' : 'Reintentar'}
              </button>
            )}
          </div>
        )}

        <Button
          onClick={handlePayDeposit}
          disabled={processingPayment || !cardInstance}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 text-base shadow-lg disabled:opacity-50"
        >
          {processingPayment ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              {language === 'en' ? 'Processing...' : 'Procesando...'}
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <CreditCard className="w-4 h-4" />
              {tr.payDeposit} — ${depositAmount.toFixed(2)}
            </span>
          )}
        </Button>

        <div className="mt-3 text-center">
          <p className="text-white/40 text-xs mb-3">
            {tr.balanceRemaining(balanceAmount.toFixed(2))}
          </p>
          <Button onClick={onBack} variant="outline" className="border-white/20 text-white/70 hover:bg-white/10 text-sm">
            {t.common.close}
          </Button>
        </div>
      </div>
    );
  }

  // =============================================
  //  RENDER: SUCCESS (fully confirmed)
  // =============================================
  if (step === 'success') {
    return (
      <div className="text-center py-12">
        <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
        <h3 className="text-white text-xl font-bold mb-2">{tc.confirmedTitle}</h3>
        <p className="text-white/70 mb-6 text-sm leading-relaxed">{tc.reservationSuccess}</p>
        <Button onClick={onBack} className="bg-primary hover:bg-primary/90 text-primary-foreground">
          {t.common.close}
        </Button>
      </div>
    );
  }

  // =============================================
  //  RENDER: CONTRACT VIEW + SIGNATURE
  // =============================================
  if (step === 'contract' || step === 'signing') {
    return (
      <div>
        <div className="flex items-center gap-3 mb-4">
          <FileText className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold text-white">
            {tr.reviewSignContract}
          </h2>
        </div>

        {/* Contract HTML rendered in scrollable container */}
        <div
          className="mb-4 rounded-lg bg-white overflow-y-auto border border-white/20"
          style={{ maxHeight: '350px' }}
          dangerouslySetInnerHTML={{ __html: contractHtml }}
        />

        {/* Payment summary */}
        <div className="mb-4 p-3 rounded-lg bg-white/5 border border-white/10 space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-white/60">{tr.deposit40}</span>
            <span className="text-primary font-bold">${depositAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-white/60">{tr.balance60}</span>
            <span className="text-white/70">${balanceAmount.toFixed(2)}</span>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-3 p-3 rounded-lg bg-red-500/20 border border-red-500/30 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
            <p className="text-red-300 text-sm">{errorMessage}</p>
          </div>
        )}

        {/* Initials input */}
        <div className="mb-4">
          <label className={labelClass}>
            <PenLine className="w-3.5 h-3.5 inline mr-1" />
            {tr.yourInitials}
          </label>
          <input
            type="text"
            value={initials}
            onChange={(e) => setInitials(e.target.value.toUpperCase().slice(0, 4))}
            className={`${inputClass} text-center text-xl font-bold tracking-widest`}
            placeholder="JD"
            maxLength={4}
          />
          <p className="text-white/40 text-xs mt-1">
            {tr.initialsSuggestion(getInitials(form.firstName, form.lastName))}
          </p>
        </div>

        <Button
          onClick={handleSignContract}
          disabled={step === 'signing' || !initials.trim()}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 text-base shadow-lg disabled:opacity-50"
        >
          {step === 'signing' ? (
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
    );
  }

  // =============================================
  //  RENDER: ERROR
  // =============================================
  if (step === 'error') {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h3 className="text-white text-xl font-bold mb-2">
          {tr.somethingWentWrong}
        </h3>
        <p className="text-red-300/80 mb-6 text-sm">{errorMessage}</p>
        <div className="flex gap-3 justify-center">
          <Button onClick={() => { setStep('form'); setErrorMessage(''); }} variant="outline" className="border-white/20 text-white/70">
            {tr.tryAgain}
          </Button>
          <Button onClick={onBack} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            {t.common.close}
          </Button>
        </div>
      </div>
    );
  }

  // =============================================
  //  RENDER: FORM STEP
  // =============================================
  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <button onClick={onBack} className="text-white/70 hover:text-white p-1 rounded-full hover:bg-white/10 transition-all">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-bold text-white">{tc.checkoutTitle}</h2>
      </div>

      {/* Order Summary */}
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
        <div className="flex justify-between text-sm pt-2 mt-2 border-t border-white/10">
          <span className="text-white/70">{tc.subtotal}</span>
          <span className="text-white/80">${getTotal().toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm py-1">
          <span className="text-white/70">{tc.salesTax}</span>
          <span className="text-white/80">${getTaxAmount().toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm py-1">
          <span className="text-white/70 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" /> {tc.deliveryFee}
            {deliveryMiles != null && <span className="text-white/40">({deliveryMiles} {tc.miles})</span>}
          </span>
          <span className="text-white/80">
            {calculatingDelivery ? (
              <span className="flex items-center gap-1 text-white/50"><Loader2 className="w-3 h-3 animate-spin" /> {tc.calculatingDistance}</span>
            ) : deliveryMiles != null && deliveryMiles > MAX_DELIVERY_MILES ? (
              <span className="text-amber-400 text-xs">{tc.deliveryOutOfRange}</span>
            ) : deliveryFee != null ? `$${deliveryFee.toFixed(2)}` : <span className="text-white/40">&mdash;</span>}
          </span>
        </div>
        {form.sameDayPickup && (
          <div className="flex justify-between text-sm py-1">
            <span className="text-white/70">{tc.sameDayPickupFee}</span>
            <span className="text-white/80">${SAME_DAY_PICKUP_FEE.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm font-bold pt-2 mt-1 border-t border-white/10">
          <span className="text-white">{tc.total}</span>
          <span className="text-primary">${getGrandTotal().toFixed(2)}</span>
        </div>
        {/* Deposit / Balance preview */}
        {getGrandTotal() > 0 && (
          <div className="mt-2 pt-2 border-t border-white/10 space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-white/50">{tr.deposit40}</span>
              <span className="text-white/60">${calculateSplit(getGrandTotal()).deposit.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-white/50">{tr.balance60DueEventDay}</span>
              <span className="text-white/60">${calculateSplit(getGrandTotal()).balance.toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>

      {step === 'error' && errorMessage && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/30 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
          <p className="text-red-300 text-sm">{errorMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Name: first + last */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>{tr.firstName} *</label>
            <input type="text" name="firstName" value={form.firstName} onChange={handleChange} className={inputClass} placeholder="John" />
            {errors.firstName && <p className={errorCls}>{errors.firstName}</p>}
          </div>
          <div>
            <label className={labelClass}>{tr.lastName} *</label>
            <input type="text" name="lastName" value={form.lastName} onChange={handleChange} className={inputClass} placeholder="Doe" />
            {errors.lastName && <p className={errorCls}>{errors.lastName}</p>}
          </div>
        </div>

        {/* Email */}
        <div>
          <label className={labelClass}>{tc.email} *</label>
          <input type="email" name="email" value={form.email} onChange={handleChange} className={inputClass} placeholder="email@example.com" />
          {errors.email && <p className={errorCls}>{errors.email}</p>}
        </div>

        {/* Phones */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>{tr.phone1} *</label>
            <input type="tel" name="phone1" value={form.phone1} onChange={handleChange} className={inputClass} placeholder="(281) 636-0615" />
            {errors.phone1 && <p className={errorCls}>{errors.phone1}</p>}
          </div>
          <div>
            <label className={labelClass}>{tr.phone2}</label>
            <input type="tel" name="phone2" value={form.phone2} onChange={handleChange} className={inputClass} placeholder={tr.optional} />
          </div>
        </div>

        {/* Address */}
        <div>
          <label className={labelClass}>{tc.eventAddress} *</label>
          <input
            ref={addressInputRef}
            type="text"
            name="eventAddress"
            value={form.eventAddress}
            onChange={handleChange}
            className={inputClass}
            placeholder="123 Main St, Houston, TX 77001"
            autoComplete="off"
          />
          {errors.eventAddress && <p className={errorCls}>{errors.eventAddress}</p>}
          {deliveryFee != null && deliveryMiles != null && (
            <p className="text-primary/80 text-xs mt-1 flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {deliveryMiles} {tc.miles} &mdash; ${deliveryFee.toFixed(2)} {tc.deliveryFee.toLowerCase()}
            </p>
          )}
        </div>

        {/* Property Type */}
        <div>
          <label className={labelClass}>{tr.propertyType} *</label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => { setForm((prev) => ({ ...prev, propertyType: 'residential_backyard' })); if (errors.propertyType) setErrors((prev) => ({ ...prev, propertyType: '' })); }}
              className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${
                form.propertyType === 'residential_backyard'
                  ? 'bg-primary/20 border-primary text-primary'
                  : 'bg-white/10 border-white/20 text-white/70 hover:bg-white/15'
              }`}
            >
              <Home className="w-4 h-4" /> {tr.backyard}
            </button>
            <button
              type="button"
              onClick={() => { setForm((prev) => ({ ...prev, propertyType: 'event_hall_venue' })); if (errors.propertyType) setErrors((prev) => ({ ...prev, propertyType: '' })); }}
              className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${
                form.propertyType === 'event_hall_venue'
                  ? 'bg-primary/20 border-primary text-primary'
                  : 'bg-white/10 border-white/20 text-white/70 hover:bg-white/15'
              }`}
            >
              <Building2 className="w-4 h-4" /> {tr.eventHall}
            </button>
          </div>
          {errors.propertyType && <p className={errorCls}>{errors.propertyType}</p>}
        </div>

        {/* Installation */}
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="installationRequired"
              checked={form.installationRequired}
              onChange={handleChange}
              className="w-4 h-4 rounded border-white/30 bg-white/10 text-primary focus:ring-primary/50"
            />
            <span className="text-white/80 text-sm flex items-center gap-1">
              <Wrench className="w-3.5 h-3.5" />
              {tr.installationRequired}
            </span>
          </label>
        </div>
        {form.installationRequired && (
          <div>
            <label className={labelClass}>{tr.installationDetails}</label>
            <textarea name="installationDetails" value={form.installationDetails} onChange={handleChange} rows={2} className={`${inputClass} resize-none`} placeholder={tr.installationPlaceholder} />
          </div>
        )}

        {/* Event Dates */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>{tc.eventDate} *</label>
            <input type="date" name="eventDate" value={form.eventDate} onChange={handleChange} min={minDate} className={`${inputClass} [color-scheme:dark]`} />
            {errors.eventDate && <p className={errorCls}>{errors.eventDate}</p>}
          </div>
          <div>
            <label className={labelClass}>{tc.returnDate} *</label>
            <input type="date" name="returnDate" value={form.returnDate} onChange={handleChange} min={minReturnDate} className={`${inputClass} [color-scheme:dark]`} />
            {errors.returnDate && <p className={errorCls}>{errors.returnDate}</p>}
          </div>
        </div>

        {/* Event Times (optional) */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>{tr.startTime}</label>
            <input type="time" name="eventStartTime" value={form.eventStartTime} onChange={handleChange} className={`${inputClass} [color-scheme:dark]`} />
          </div>
          <div>
            <label className={labelClass}>{tr.endTime}</label>
            <input type="time" name="eventEndTime" value={form.eventEndTime} onChange={handleChange} className={`${inputClass} [color-scheme:dark]`} />
          </div>
        </div>

        {/* Same-day pickup */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
          <input
            type="checkbox"
            id="sameDayPickup"
            checked={form.sameDayPickup}
            onChange={(e) => setForm((prev) => ({ ...prev, sameDayPickup: e.target.checked }))}
            className="w-4 h-4 accent-primary"
          />
          <label htmlFor="sameDayPickup" className="text-sm text-white/80 cursor-pointer">
            {tc.sameDayPickupQuestion} <span className="text-primary font-semibold">(+${SAME_DAY_PICKUP_FEE})</span>
          </label>
        </div>

        {/* Surface Type (conditional) */}
        {needsSurface && (
          <div>
            <label className={labelClass}>{tc.surfaceType} *</label>
            <div className="flex gap-3">
              <button type="button" onClick={() => { setForm((prev) => ({ ...prev, surfaceType: 'grass' })); if (errors.surfaceType) setErrors((prev) => ({ ...prev, surfaceType: '' })); }}
                className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition-all ${form.surfaceType === 'grass' ? 'bg-primary/20 border-primary text-primary' : 'bg-white/10 border-white/20 text-white/70 hover:bg-white/15'}`}>
                {tc.surfaceGrass}
              </button>
              <button type="button" onClick={() => { setForm((prev) => ({ ...prev, surfaceType: 'concrete' })); if (errors.surfaceType) setErrors((prev) => ({ ...prev, surfaceType: '' })); }}
                className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition-all ${form.surfaceType === 'concrete' ? 'bg-primary/20 border-primary text-primary' : 'bg-white/10 border-white/20 text-white/70 hover:bg-white/15'}`}>
                {tc.surfaceConcrete}
              </button>
            </div>
            {errors.surfaceType && <p className={errorCls}>{errors.surfaceType}</p>}
          </div>
        )}

        {/* Special Notes */}
        <div>
          <label className={labelClass}>{tr.specialNotes}</label>
          <textarea name="specialNotes" value={form.specialNotes} onChange={handleChange} rows={2} className={`${inputClass} resize-none`} />
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={step === 'submitting'}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 text-base shadow-lg disabled:opacity-50"
        >
          {step === 'submitting' ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> {tc.submitting}
            </span>
          ) : (
            tc.confirmReservation
          )}
        </Button>
      </form>
    </div>
  );
}
