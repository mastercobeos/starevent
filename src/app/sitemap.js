export default function sitemap() {
  const baseUrl = 'https://stareventrentaltx.com';

  const servicePages = [
    'tent-rental-houston',
    'corporate-event-rentals-houston',
    'party-rentals-katy-tx',
    'dance-floor-rental-houston',
    'wedding-rental-tomball',
    'graduation-party-rental-houston',
  ];

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
      alternates: {
        languages: {
          en: baseUrl,
          es: `${baseUrl}?lang=es`,
        },
      },
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
      alternates: {
        languages: {
          en: `${baseUrl}/contact`,
          es: `${baseUrl}/contact?lang=es`,
        },
      },
    },
    ...servicePages.map((slug) => ({
      url: `${baseUrl}/services/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
      alternates: {
        languages: {
          en: `${baseUrl}/services/${slug}`,
          es: `${baseUrl}/services/${slug}?lang=es`,
        },
      },
    })),
  ];
}
