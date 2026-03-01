'use client';

import { LanguageProvider } from '../contexts/LanguageContext';
import { CartProvider } from '../contexts/CartContext';
import Layout from './Layout';

export function ClientProviders({ children }) {
  return (
    <LanguageProvider>
      <CartProvider>
        <Layout>{children}</Layout>
      </CartProvider>
    </LanguageProvider>
  );
}
