import Script from 'next/script';
import { headers } from 'next/headers';
import GoogleTagManager, { GoogleTagManagerNoScript } from '../components/GoogleTagManager';
import './globals.css';

const GA_ID = 'G-GCJZGJCNW8';
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;

export const metadata = {
  metadataBase: new URL('https://stareventrentaltx.com'),
  title: {
    default: 'Star Event Rental - Event Rental Services in Houston TX',
    template: '%s | Star Event Rental',
  },
  description: 'Star Event Rental is a family-owned tent, table, chair, and linen rental business in Houston, Texas. We serve Houston, Katy, Cypress, Richmond, Rosenberg, Sugar Land.',
  openGraph: {
    type: 'website',
    siteName: 'Star Event Rental',
    locale: 'en_US',
    images: [{ url: '/og-image.webp', width: 1200, height: 630, alt: 'Star Event Rental - Event Rentals in Houston TX' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Star Event Rental - Event Rentals Houston TX',
    description: 'Tent, chair, table & dance floor rentals in Houston TX. Weddings, corporate events, graduations & parties. Family-owned. Free quotes!',
    images: ['/og-image.webp'],
  },
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
  manifest: '/manifest.json',
  other: {
    'theme-color': '#1a1a2e',
  },
};

export default async function RootLayout({ children }) {
  const headersList = await headers();
  const locale = headersList.get('x-locale') || 'en';

  return (
    <html lang={locale} className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://flagcdn.com" />
        <link rel="dns-prefetch" href="https://web.squarecdn.com" />
        <link rel="dns-prefetch" href="https://maps.googleapis.com" />
      </head>
      <body>
        <GoogleTagManager gtmId={GTM_ID} />
        <GoogleTagManagerNoScript gtmId={GTM_ID} />
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}');
          `}
        </Script>
        {children}
      </body>
    </html>
  );
}
