'use client';


import { LanguageProvider } from '../contexts/LanguageContext';
import { CartProvider } from '../contexts/CartContext';
import { ToastProvider } from './ui/Toast';
import { ConfirmProvider } from './ui/ConfirmModal';
import Layout from './Layout';
import GHLChatWidget from './GHLChatWidget';

export function ClientProviders({ children, initialLocale }) {
  return (
    <LanguageProvider initialLocale={initialLocale}>
      <CartProvider>
        <ToastProvider>
          <ConfirmProvider>
            <Layout>{children}</Layout>
            <GHLChatWidget />
          </ConfirmProvider>
        </ToastProvider>
      </CartProvider>
    </LanguageProvider>
  );
}
