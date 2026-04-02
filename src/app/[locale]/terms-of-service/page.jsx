import TermsOfServicePage from '../../../components/TermsOfServicePage';

const baseUrl = 'https://stareventrentaltx.com';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const isEs = locale === 'es';

  return {
    title: isEs
      ? 'Términos de Servicio - Star Event Rental Houston TX'
      : 'Terms of Service - Star Event Rental Houston TX',
    description: isEs
      ? 'Términos de servicio de Star Event Rental. Condiciones de reservación, pagos, cancelaciones y comunicaciones SMS.'
      : 'Terms of service for Star Event Rental. Reservation conditions, payments, cancellations, and SMS communications.',
    openGraph: {
      title: isEs
        ? 'Términos de Servicio - Star Event Rental'
        : 'Terms of Service - Star Event Rental',
      description: isEs
        ? 'Lea los términos y condiciones de Star Event Rental para alquiler de equipo para eventos.'
        : 'Read Star Event Rental terms and conditions for event equipment rentals.',
      url: isEs ? `${baseUrl}/es/terms-of-service` : `${baseUrl}/terms-of-service`,
      images: [{ url: '/og-image.webp', width: 1200, height: 630, alt: 'Star Event Rental Terms of Service' }],
    },
    alternates: {
      canonical: isEs ? `${baseUrl}/es/terms-of-service` : `${baseUrl}/terms-of-service`,
      languages: {
        en: `${baseUrl}/terms-of-service`,
        es: `${baseUrl}/es/terms-of-service`,
      },
    },
  };
}

function getJsonLd(locale) {
  const isEs = locale === 'es';
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: isEs ? 'Términos de Servicio' : 'Terms of Service',
    description: isEs
      ? 'Términos de servicio de Star Event Rental'
      : 'Terms of service for Star Event Rental',
    url: isEs ? `${baseUrl}/es/terms-of-service` : `${baseUrl}/terms-of-service`,
    publisher: {
      '@type': 'LocalBusiness',
      name: 'Star Event Rental',
      telephone: '+1-281-636-0615',
      email: 'info@stareventrentaltx.com',
    },
  };
}

export default async function Page({ params }) {
  const { locale } = await params;
  const jsonLd = getJsonLd(locale);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <TermsOfServicePage />
    </>
  );
}
