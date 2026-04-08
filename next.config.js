/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'flagcdn.com' },
      { protocol: 'https', hostname: 'stareventrentaltx.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 2592000,
  },
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
          {
            key: 'Permissions-Policy',
            value: 'geolocation=(self), microphone=(), camera=(), payment=(self)',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://web.squarecdn.com https://sandbox.web.squarecdn.com https://maps.googleapis.com https://www.googletagmanager.com https://www.google-analytics.com https://widgets.leadconnectorhq.com https://stcdn.leadconnectorhq.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://web.squarecdn.com https://sandbox.web.squarecdn.com https://widgets.leadconnectorhq.com https://stcdn.leadconnectorhq.com",
              "font-src 'self' https://fonts.gstatic.com https://*.squarecdn.com https://d1g145x70srn7h.cloudfront.net",
              "img-src 'self' https: data: blob:",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://connect.squareup.com https://connect.squareupsandbox.com https://pci-connect.squareup.com https://pci-connect.squareupsandbox.com https://maps.googleapis.com https://*.ingest.sentry.io https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com https://widgets.leadconnectorhq.com https://*.leadconnectorhq.com",
              "frame-src 'self' https://web.squarecdn.com https://sandbox.web.squarecdn.com https://widgets.leadconnectorhq.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
