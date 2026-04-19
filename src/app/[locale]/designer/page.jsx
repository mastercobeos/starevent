import DesignerPage from '../../../components/designer/DesignerPage';

const baseUrl = 'https://stareventrentaltx.com';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const isEs = locale === 'es';

  return {
    title: isEs
      ? 'Diseñador 3D de Carpas | Star Event Rental'
      : '3D Tent Layout Designer | Star Event Rental',
    description: isEs
      ? 'Diseña el layout de tu evento en 3D.'
      : 'Design your event layout in 3D.',
    // Hidden feature — not linked from the public site and must not appear
    // in search engines. Remove both blocks when promoting it publicly.
    robots: {
      index: false,
      follow: false,
      googleBot: { index: false, follow: false },
    },
    alternates: {
      canonical: isEs ? `${baseUrl}/es/designer` : `${baseUrl}/designer`,
    },
  };
}

function getDesignerJsonLd(locale) {
  const isEs = locale === 'es';
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: isEs ? 'Diseñador 3D de Carpas Star Event Rental' : 'Star Event Rental 3D Tent Designer',
    description: isEs
      ? 'Aplicación web para diseñar el layout de eventos con carpas, mesas y sillas en 3D.'
      : 'Web application to design event layouts with tents, tables, and chairs in 3D.',
    applicationCategory: 'DesignApplication',
    operatingSystem: 'Web',
    url: isEs ? `${baseUrl}/es/designer` : `${baseUrl}/designer`,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    provider: {
      '@type': 'LocalBusiness',
      name: 'Star Event Rental',
      url: baseUrl,
    },
  };
}

export default async function Page({ params }) {
  const { locale } = await params;
  const jsonLd = getDesignerJsonLd(locale);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <DesignerPage />
    </>
  );
}
