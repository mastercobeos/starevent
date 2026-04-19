export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/reservation/', '/designer', '/es/designer'],
      },
    ],
    sitemap: 'https://stareventrentaltx.com/sitemap.xml',
  };
}
