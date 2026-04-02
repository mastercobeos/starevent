export default function sitemap() {
  const baseUrl = 'https://stareventrentaltx.com';
  const lastModified = '2026-03-11';

  const servicePages = [
    'tent-rental-houston',
    'corporate-event-rentals-houston',
    'party-rentals-katy-tx',
    'dance-floor-rental-houston',
    'wedding-rental-tomball',
    'graduation-party-rental-houston',
    'event-rentals-cypress-tx',
    'event-rentals-sugar-land-tx',
    'tent-rental-the-woodlands-tx',
    'tent-rental-baytown-tx',
    'event-rentals-spring-tx',
    'party-rentals-pearland-tx',
  ];

  const productCategories = [
    'chairs',
    'tables',
    'tablecloths',
    'tents',
    'others',
  ];

  return [
    {
      url: baseUrl,
      lastModified,
      changeFrequency: 'weekly',
      priority: 1,
      alternates: {
        languages: {
          en: baseUrl,
          es: `${baseUrl}/es`,
        },
      },
    },
    {
      url: `${baseUrl}/contact`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
      alternates: {
        languages: {
          en: `${baseUrl}/contact`,
          es: `${baseUrl}/es/contact`,
        },
      },
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.3,
      alternates: {
        languages: {
          en: `${baseUrl}/privacy-policy`,
          es: `${baseUrl}/es/privacy-policy`,
        },
      },
    },
    {
      url: `${baseUrl}/terms-of-service`,
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.3,
      alternates: {
        languages: {
          en: `${baseUrl}/terms-of-service`,
          es: `${baseUrl}/es/terms-of-service`,
        },
      },
    },
    ...servicePages.map((slug) => ({
      url: `${baseUrl}/services/${slug}`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.9,
      alternates: {
        languages: {
          en: `${baseUrl}/services/${slug}`,
          es: `${baseUrl}/es/services/${slug}`,
        },
      },
    })),
    ...productCategories.map((slug) => ({
      url: `${baseUrl}/products/${slug}`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
      alternates: {
        languages: {
          en: `${baseUrl}/products/${slug}`,
          es: `${baseUrl}/es/products/${slug}`,
        },
      },
    })),
  ];
}
