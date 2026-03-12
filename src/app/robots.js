export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/reservation/'],
      },
    ],
    sitemap: 'https://stareventrentaltx.com/sitemap.xml',
  };
}
