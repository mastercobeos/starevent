import ContactPage from '../../../components/ContactPage';

const baseUrl = 'https://stareventrentaltx.com';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const isEs = locale === 'es';

  return {
    title: isEs
      ? 'Contacto Star Event Rental - Cotizaciones Gratis Houston TX'
      : 'Contact Star Event Rental - Free Event Rental Quotes Houston TX',
    description: isEs
      ? 'Contacta Star Event Rental para tu próximo evento en Houston, TX. Cotizaciones gratis para renta de carpas, mesas, sillas y manteles. Llama 281-636-0615.'
      : 'Contact Star Event Rental for your next event in Houston, TX. Free quotes for tent, table, chair, and linen rentals. Call 281-636-0615.',
    openGraph: {
      title: isEs
        ? 'Contacto Star Event Rental - Cotizaciones Gratis'
        : 'Contact Star Event Rental - Free Quotes',
      description: isEs
        ? 'Contacta Star Event Rental para tu próximo evento en Houston, TX. Cotizaciones gratis para renta de carpas, mesas, sillas y manteles.'
        : 'Contact Star Event Rental for your next event in Houston, TX. Free quotes for tent, table, chair, and linen rentals.',
      url: isEs ? `${baseUrl}/es/contact` : `${baseUrl}/contact`,
      images: [{ url: '/logo.png', width: 1200, height: 630, alt: 'Contact Star Event Rental' }],
    },
    alternates: {
      canonical: isEs ? `${baseUrl}/es/contact` : `${baseUrl}/contact`,
      languages: {
        en: `${baseUrl}/contact`,
        es: `${baseUrl}/es/contact`,
      },
    },
  };
}

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
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactJsonLd) }}
      />
      <ContactPage />
    </>
  );
}
