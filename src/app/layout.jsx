import './globals.css';

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
    images: [{ url: '/logo.png', width: 1200, height: 630, alt: 'Star Event Rental - Event Rentals in Houston TX' }],
  },
  twitter: {
    card: 'summary_large_image',
  },
  alternates: {
    languages: {
      'en': 'https://stareventrentaltx.com',
      'es': 'https://stareventrentaltx.com?lang=es',
    },
  },
  icons: {
    icon: '/logo.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://flagcdn.com" />
        <link rel="dns-prefetch" href="https://web.squarecdn.com" />
        <link rel="dns-prefetch" href="https://maps.googleapis.com" />
      </head>
      <body>{children}</body>
    </html>
  );
}
