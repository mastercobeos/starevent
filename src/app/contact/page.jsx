import { ClientProviders } from '../../components/ClientProviders';
import ContactPage from '../../components/ContactPage';

export const metadata = {
  title: 'Contact',
  description: 'Contact Star Event Rental for your next event in Houston, TX. Free quotes for tent, table, chair, and linen rentals. Call 281-636-0615. | Contacta Star Event Rental para tu próximo evento en Houston, TX. Cotizaciones gratis.',
  openGraph: {
    title: 'Contact Star Event Rental - Free Quotes',
    description: 'Contact Star Event Rental for your next event in Houston, TX. Free quotes for tent, table, chair, and linen rentals.',
    url: 'https://stareventrentaltx.com/contact',
    images: [{ url: '/logo.png', width: 1200, height: 630, alt: 'Contact Star Event Rental' }],
  },
  alternates: {
    canonical: 'https://stareventrentaltx.com/contact',
    languages: {
      'en': 'https://stareventrentaltx.com/contact',
      'es': 'https://stareventrentaltx.com/contact?lang=es',
    },
  },
};

const contactJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  name: 'Contact Star Event Rental',
  description: 'Get a free quote for event rentals in Houston, TX. Tents, tables, chairs, linens, and more.',
  url: 'https://stareventrentaltx.com/contact',
  mainEntity: {
    '@type': 'LocalBusiness',
    name: 'Star Event Rental',
    telephone: '+1-281-636-0615',
    email: 'info@stareventrentaltx.com',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Houston',
      addressRegion: 'TX',
      postalCode: '77082',
      addressCountry: 'US',
    },
  },
};

export default function Page() {
  return (
    <ClientProviders>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactJsonLd) }}
      />
      <ContactPage />
    </ClientProviders>
  );
}
