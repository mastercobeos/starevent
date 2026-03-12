import HomePage from '../../components/HomePage';

const baseUrl = 'https://stareventrentaltx.com';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const isEs = locale === 'es';

  return {
    title: isEs
      ? 'Star Event Rental - Renta de Carpas y Eventos Houston TX'
      : 'Star Event Rental - Tent Rental & Event Rentals Houston TX',
    description: isEs
      ? 'Renta de carpas, sillas desde $3, mesas desde $8 y pistas de baile en Houston TX. Paquetes completos desde $399. Servimos Houston, Katy, Tomball y más. Llama 281-636-0615.'
      : 'Tent, chair ($3+), table ($8+) & dance floor rentals in Houston TX. Complete packages from $399. Serving Houston, Katy, Tomball & more. Call 281-636-0615 for free quotes!',
    openGraph: {
      title: isEs
        ? 'Star Event Rental - Renta de Carpas y Eventos Houston TX'
        : 'Star Event Rental - Tent Rental & Event Rentals Houston TX',
      description: isEs
        ? 'Renta de carpas, sillas desde $3, mesas desde $8 y pistas de baile en Houston TX. Paquetes completos desde $399. Negocio familiar. Llama 281-636-0615.'
        : 'Tent, chair ($3+), table ($8+) & dance floor rentals in Houston TX. Complete packages from $399. Family-owned. Call 281-636-0615!',
      url: isEs ? `${baseUrl}/es` : `${baseUrl}/`,
      images: [{ url: '/og-image.webp', width: 1200, height: 630, alt: 'Star Event Rental - Event Rentals in Houston TX' }],
    },
    alternates: {
      canonical: isEs ? `${baseUrl}/es` : `${baseUrl}/`,
      languages: {
        en: `${baseUrl}/`,
        es: `${baseUrl}/es`,
      },
    },
  };
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'Star Event Rental',
  image: 'https://stareventrentaltx.com/og-image.webp',
  '@id': 'https://stareventrentaltx.com',
  url: 'https://stareventrentaltx.com',
  telephone: '+1-281-636-0615',
  email: 'info@stareventrentaltx.com',
  description: 'Family-owned event rental company in Houston, TX. We offer tents, tables, chairs, linens, heaters, coolers, and dance floors for weddings, quinceañeras, baby showers, and corporate events.',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '3730 Redwood Falls Dr',
    addressLocality: 'Houston',
    addressRegion: 'TX',
    postalCode: '77082',
    addressCountry: 'US',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 29.7233,
    longitude: -95.5977,
  },
  areaServed: [
    { '@type': 'City', name: 'Houston' },
    { '@type': 'City', name: 'Katy' },
    { '@type': 'City', name: 'Cypress' },
    { '@type': 'City', name: 'Richmond' },
    { '@type': 'City', name: 'Rosenberg' },
    { '@type': 'City', name: 'Sugar Land' },
    { '@type': 'City', name: 'The Woodlands' },
    { '@type': 'City', name: 'Baytown' },
    { '@type': 'City', name: 'Tomball' },
    { '@type': 'City', name: 'Spring' },
    { '@type': 'City', name: 'Humble' },
    { '@type': 'City', name: 'Pearland' },
  ],
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Event Rental Services',
    itemListElement: [
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Tent Rental' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Chair Rental' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Table Rental' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Dance Floor Rental' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Tablecloth & Linen Rental' } },
    ],
  },
  priceRange: '$$',
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '08:00',
      closes: '17:00',
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Saturday', 'Sunday'],
      opens: '08:00',
      closes: '17:00',
    },
  ],
  sameAs: [
    'https://www.facebook.com/people/Star-Event-Rental-supplies/61561128338857/',
    'https://www.instagram.com/stareventrentaltx',
  ],
};

const homeFaq = [
  {
    q: 'How much does event rental cost in Houston?',
    qEs: '¿Cuánto cuesta la renta de equipo para eventos en Houston?',
    a: 'Our event rental prices start at $3 per chair, $8 per table, and $250 for tents. We also offer complete packages starting at $399 that include tent, tables, chairs, tablecloths, and garden lights. Contact us for a free quote!',
    aEs: 'Nuestros precios de renta para eventos comienzan desde $3 por silla, $8 por mesa y $250 por carpa. También ofrecemos paquetes completos desde $399 que incluyen carpa, mesas, sillas, manteles y luces de jardín. ¡Contáctanos para una cotización gratis!',
  },
  {
    q: 'What areas do you serve in Houston?',
    qEs: '¿Qué áreas atienden en Houston?',
    a: 'We serve Houston, Katy, Cypress, Richmond, Rosenberg, Sugar Land, The Woodlands, Baytown, Tomball, Spring, Humble, and Pearland. Delivery and professional setup are included in our service.',
    aEs: 'Servimos Houston, Katy, Cypress, Richmond, Rosenberg, Sugar Land, The Woodlands, Baytown, Tomball, Spring, Humble y Pearland. La entrega e instalación profesional están incluidas.',
  },
  {
    q: 'Do you provide delivery and setup?',
    qEs: '¿Ofrecen entrega e instalación?',
    a: 'Yes! We provide complete delivery, professional setup, and pickup for all events. Our team arrives on time to ensure everything is ready before your event starts.',
    aEs: '¡Sí! Proporcionamos entrega completa, instalación profesional y recolección para todos los eventos. Nuestro equipo llega a tiempo para asegurar que todo esté listo.',
  },
  {
    q: 'How far in advance should I book?',
    qEs: '¿Con cuánta anticipación debo reservar?',
    a: 'We recommend booking at least 2 weeks in advance, especially during peak season (May-June for graduations, October-December for holidays). However, we do our best to accommodate last-minute requests.',
    aEs: 'Recomendamos reservar al menos 2 semanas de anticipación, especialmente durante temporada alta (mayo-junio para graduaciones, octubre-diciembre para fiestas). Sin embargo, hacemos lo posible por acomodar solicitudes de último momento.',
  },
  {
    q: 'What types of events do you serve?',
    qEs: '¿Qué tipos de eventos atienden?',
    a: 'We serve all types of events including weddings, quinceañeras, baby showers, graduation parties, corporate events, birthday parties, family reunions, and more. We offer both individual rentals and complete packages.',
    aEs: 'Atendemos todo tipo de eventos incluyendo bodas, quinceañeras, baby showers, fiestas de graduación, eventos corporativos, cumpleaños, reuniones familiares y más. Ofrecemos tanto rentas individuales como paquetes completos.',
  },
];

function getFaqJsonLd(locale) {
  const isEs = locale === 'es';
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: homeFaq.map((item) => ({
      '@type': 'Question',
      name: isEs ? item.qEs : item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: isEs ? item.aEs : item.a,
      },
    })),
  };
}

export default async function Page({ params }) {
  const { locale } = await params;
  const faqJsonLd = getFaqJsonLd(locale);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <HomePage />
    </>
  );
}
