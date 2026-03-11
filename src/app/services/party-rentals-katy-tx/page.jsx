import { ClientProviders } from '../../../components/ClientProviders';
import { ServiceLandingPage } from '../../../components/ServiceLandingPage';
import { servicesData } from '../../../data/servicesData';

const service = servicesData.find((s) => s.slug === 'party-rentals-katy-tx');

export const metadata = {
  title: service.title,
  description: service.description,
  keywords: service.keywords,
  openGraph: {
    title: service.title,
    description: service.description,
    url: 'https://stareventrentaltx.com/services/party-rentals-katy-tx',
    images: [{ url: '/logo.png', width: 1200, height: 630, alt: service.title }],
  },
  alternates: {
    canonical: 'https://stareventrentaltx.com/services/party-rentals-katy-tx',
    languages: {
      en: 'https://stareventrentaltx.com/services/party-rentals-katy-tx',
      es: 'https://stareventrentaltx.com/services/party-rentals-katy-tx?lang=es',
    },
  },
};

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Party Rentals Katy TX',
    description: service.description,
    provider: {
      '@type': 'LocalBusiness',
      name: 'Star Event Rental',
      telephone: '+1-281-636-0615',
      url: 'https://stareventrentaltx.com',
    },
    areaServed: [
      { '@type': 'City', name: 'Katy' },
      { '@type': 'City', name: 'Houston' },
      { '@type': 'City', name: 'Cypress' },
      { '@type': 'City', name: 'Sugar Land' },
    ],
    serviceType: 'Party Rental',
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: service.faq.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  },
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://stareventrentaltx.com' },
      { '@type': 'ListItem', position: 2, name: 'Party Rentals Katy TX', item: 'https://stareventrentaltx.com/services/party-rentals-katy-tx' },
    ],
  },
];

export default function Page() {
  return (
    <ClientProviders>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ServiceLandingPage service={service} />
    </ClientProviders>
  );
}
