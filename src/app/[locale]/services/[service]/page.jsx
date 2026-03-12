import { ServiceLandingPage } from '../../../../components/ServiceLandingPage';
import { servicesData } from '../../../../data/servicesData';
import { notFound } from 'next/navigation';

const baseUrl = 'https://stareventrentaltx.com';

export function generateStaticParams() {
  const locales = ['en', 'es'];
  return locales.flatMap((locale) =>
    servicesData.map((s) => ({ locale, service: s.slug }))
  );
}

export async function generateMetadata({ params }) {
  const { locale, service: slug } = await params;
  const service = servicesData.find((s) => s.slug === slug);
  if (!service) return {};

  const isEs = locale === 'es';
  const title = isEs ? service.titleEs : service.title;
  const description = isEs ? service.descriptionEs : service.description;
  const url = isEs
    ? `${baseUrl}/es/services/${slug}`
    : `${baseUrl}/services/${slug}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      images: [{ url: '/og-image.webp', width: 1200, height: 630, alt: title }],
    },
    alternates: {
      canonical: url,
      languages: {
        en: `${baseUrl}/services/${slug}`,
        es: `${baseUrl}/es/services/${slug}`,
      },
    },
  };
}

export default async function Page({ params }) {
  const { locale, service: slug } = await params;
  const service = servicesData.find((s) => s.slug === slug);
  if (!service) notFound();

  const isEs = locale === 'es';

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: isEs ? service.h1Es : service.h1,
      description: isEs ? service.descriptionEs : service.description,
      provider: {
        '@type': 'LocalBusiness',
        name: 'Star Event Rental',
        telephone: '+1-281-636-0615',
        url: baseUrl,
        address: {
          '@type': 'PostalAddress',
          streetAddress: '3730 Redwood Falls Dr',
          addressLocality: 'Houston',
          addressRegion: 'TX',
          postalCode: '77082',
          addressCountry: 'US',
        },
      },
      areaServed: [
        { '@type': 'City', name: 'Houston' },
        { '@type': 'City', name: 'Katy' },
        { '@type': 'City', name: 'The Woodlands' },
        { '@type': 'City', name: 'Baytown' },
        { '@type': 'City', name: 'Sugar Land' },
        { '@type': 'City', name: 'Tomball' },
      ],
      serviceType: isEs ? service.h1Es : service.h1,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: service.faq.map((item) => ({
        '@type': 'Question',
        name: isEs ? item.qEs : item.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: isEs ? item.aEs : item.a,
        },
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: isEs ? `${baseUrl}/es` : baseUrl,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: isEs ? service.h1Es : service.h1,
          item: isEs
            ? `${baseUrl}/es/services/${slug}`
            : `${baseUrl}/services/${slug}`,
        },
      ],
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ServiceLandingPage service={service} />
    </>
  );
}
