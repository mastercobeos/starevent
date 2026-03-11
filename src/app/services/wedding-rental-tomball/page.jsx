import { ClientProviders } from '../../../components/ClientProviders';
import { ServiceLandingPage } from '../../../components/ServiceLandingPage';
import { servicesData } from '../../../data/servicesData';

const service = servicesData.find((s) => s.slug === 'wedding-rental-tomball');

export const metadata = {
  title: service.title,
  description: service.description,
  keywords: service.keywords,
  openGraph: {
    title: service.title,
    description: service.description,
    url: 'https://stareventrentaltx.com/services/wedding-rental-tomball',
    images: [{ url: '/logo.png', width: 1200, height: 630, alt: service.title }],
  },
  alternates: {
    canonical: 'https://stareventrentaltx.com/services/wedding-rental-tomball',
    languages: {
      en: 'https://stareventrentaltx.com/services/wedding-rental-tomball',
      es: 'https://stareventrentaltx.com/services/wedding-rental-tomball?lang=es',
    },
  },
};

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Wedding Rental Tomball TX',
    description: service.description,
    provider: {
      '@type': 'LocalBusiness',
      name: 'Star Event Rental',
      telephone: '+1-281-636-0615',
      url: 'https://stareventrentaltx.com',
    },
    areaServed: [
      { '@type': 'City', name: 'Tomball' },
      { '@type': 'City', name: 'Spring' },
      { '@type': 'City', name: 'The Woodlands' },
      { '@type': 'City', name: 'Houston' },
    ],
    serviceType: 'Wedding Rental',
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
      { '@type': 'ListItem', position: 2, name: 'Wedding Rental Tomball', item: 'https://stareventrentaltx.com/services/wedding-rental-tomball' },
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
