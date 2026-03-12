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
      images: [{ url: '/og-image.webp', width: 1200, height: 630, alt: 'Contact Star Event Rental' }],
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

function getContactJsonLd(locale) {
  const isEs = locale === 'es';
  return {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: isEs ? 'Contacto Star Event Rental' : 'Contact Star Event Rental',
    description: isEs
      ? 'Cotización gratis para renta de equipo para eventos en Houston, TX. Carpas, mesas, sillas, manteles y más.'
      : 'Get a free quote for event rentals in Houston, TX. Tents, tables, chairs, linens, and more.',
    url: isEs ? `${baseUrl}/es/contact` : `${baseUrl}/contact`,
    mainEntity: {
      '@type': 'LocalBusiness',
      name: 'Star Event Rental',
      telephone: '+1-281-636-0615',
      email: 'info@stareventrentaltx.com',
      address: {
        '@type': 'PostalAddress',
        streetAddress: '3730 Redwood Falls Dr',
        addressLocality: 'Houston',
        addressRegion: 'TX',
        postalCode: '77082',
        addressCountry: 'US',
      },
    },
  };
}

export default async function Page({ params }) {
  const { locale } = await params;
  const contactJsonLd = getContactJsonLd(locale);

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
