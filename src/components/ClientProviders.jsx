'use client';

import { useEffect } from 'react';
import { LanguageProvider } from '../contexts/LanguageContext';
import { CartProvider } from '../contexts/CartContext';
import Layout from './Layout';
import { captureTrafficSource } from '../lib/utm-tracking';

function UTMTracker() {
  useEffect(() => {
    captureTrafficSource();
  }, []);
  return null;
}

export function ClientProviders({ children }) {
  return (
    <LanguageProvider>
      <CartProvider>
        <UTMTracker />
        <Layout>{children}</Layout>
      </CartProvider>
    </LanguageProvider>
  );
}
