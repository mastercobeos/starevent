import PrivacyPolicyPage from '../../../components/PrivacyPolicyPage';

const baseUrl = 'https://stareventrentaltx.com';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const isEs = locale === 'es';

  return {
    title: isEs
      ? 'Política de Privacidad - Star Event Rental Houston TX'
      : 'Privacy Policy - Star Event Rental Houston TX',
    description: isEs
      ? 'Política de privacidad de Star Event Rental. Cómo recopilamos, usamos y protegemos su información personal, incluyendo comunicaciones SMS.'
      : 'Privacy policy for Star Event Rental. How we collect, use, and protect your personal information, including SMS communications.',
    openGraph: {
      title: isEs
        ? 'Política de Privacidad - Star Event Rental'
        : 'Privacy Policy - Star Event Rental',
      description: isEs
        ? 'Conozca cómo Star Event Rental protege su información personal y privacidad.'
        : 'Learn how Star Event Rental protects your personal information and privacy.',
      url: isEs ? `${baseUrl}/es/privacy-policy` : `${baseUrl}/privacy-policy`,
      images: [{ url: '/og-image.webp', width: 1200, height: 630, alt: 'Star Event Rental Privacy Policy' }],
    },
    alternates: {
      canonical: isEs ? `${baseUrl}/es/privacy-policy` : `${baseUrl}/privacy-policy`,
      languages: {
        en: `${baseUrl}/privacy-policy`,
        es: `${baseUrl}/es/privacy-policy`,
      },
    },
  };
}

function getJsonLd(locale) {
  const isEs = locale === 'es';
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: isEs ? 'Política de Privacidad' : 'Privacy Policy',
    description: isEs
      ? 'Política de privacidad de Star Event Rental'
      : 'Privacy policy for Star Event Rental',
    url: isEs ? `${baseUrl}/es/privacy-policy` : `${baseUrl}/privacy-policy`,
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
      <PrivacyPolicyPage />
    </>
  );
}
