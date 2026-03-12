'use client';

import { useState, useEffect, useRef } from 'react';

const SQUARE_ENV = process.env.NEXT_PUBLIC_SQUARE_ENVIRONMENT || 'sandbox';
const SQUARE_APP_ID = process.env.NEXT_PUBLIC_SQUARE_APP_ID;
const SQUARE_LOCATION_ID = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID;
const SQUARE_SDK_URL = SQUARE_ENV === 'production'
  ? 'https://web.squarecdn.com/v1/square.js'
  : 'https://sandbox.web.squarecdn.com/v1/square.js';

/**
 * Manages Square Web Payments SDK lifecycle: script loading, card init, retry.
 *
 * @param {object} opts
 * @param {boolean} opts.active  - true when the card form should be visible (e.g. step === 'deposit')
 * @param {string}  opts.language
 * @returns {{ cardInstance, cardLoading, paymentError, setPaymentError, retryCardInit, cardContainerRef }}
 */
export function useSquareCard({ active, language }) {
  const [squareReady, setSquareReady] = useState(typeof window !== 'undefined' && !!window.Square);
  const [cardInstance, setCardInstance] = useState(null);
  const [cardLoading, setCardLoading] = useState(false);
  const [cardInitKey, setCardInitKey] = useState(0);
  const [paymentError, setPaymentError] = useState('');
  const cardContainerRef = useRef(null);

  // Load Square SDK script
  useEffect(() => {
    if (window.Square) { setSquareReady(true); return; }
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

  // Init card when active
  useEffect(() => {
    if (!active || cardInstance || !squareReady) return;
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
          if (attempt > 0) await new Promise((r) => setTimeout(r, 1000 * attempt));
          if (cancelled) return;
          const payments = await window.Square.payments(SQUARE_APP_ID, SQUARE_LOCATION_ID);
          card = await payments.card();
          if (cancelled) return;
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
          return;
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
  }, [active, squareReady, language, cardInitKey]);

  const retryCardInit = () => {
    if (cardInstance) {
      cardInstance.destroy().catch(() => {});
    }
    setCardInstance(null);
    setPaymentError('');
    setCardInitKey((k) => k + 1);
  };

  const resetCard = () => {
    setCardInstance(null);
    setPaymentError('');
  };

  return {
    cardInstance,
    cardLoading,
    paymentError,
    setPaymentError,
    retryCardInit,
    resetCard,
    cardContainerRef,
  };
}
