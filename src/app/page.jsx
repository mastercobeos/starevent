import { ClientProviders } from '../components/ClientProviders';
import HomePage from '../components/HomePage';

export const metadata = {
  title: 'Star Event Rental - Event Rental Services in Houston TX',
  description: 'At Star Event Rental, we believe every celebration deserves comfort, elegance, and reliability. Family-owned event rental in Houston, TX. Tents, tables, chairs, linens and more. | En Star Event Rental, creemos que cada celebración merece comodidad, elegancia y confiabilidad. Renta de carpas, mesas, sillas y manteles en Houston, TX.',
  keywords: ['event rental Houston', 'tent rental Houston TX', 'table chair rental', 'party rental Houston', 'wedding rental Houston', 'quinceañera rentals', 'renta de carpas Houston', 'renta de mesas y sillas', 'eventos Houston TX'],
  openGraph: {
    title: 'Star Event Rental - Event Rental Services in Houston TX',
    description: 'Family-owned event rental in Houston, TX. Tents, tables, chairs, linens for weddings, quinceañeras & more.',
    url: 'https://stareventrentaltx.com/',
    images: [{ url: '/logo.png', width: 1200, height: 630, alt: 'Star Event Rental - Event Rentals in Houston TX' }],
  },
  alternates: {
    canonical: 'https://stareventrentaltx.com/',
    languages: {
      'en': 'https://stareventrentaltx.com/',
      'es': 'https://stareventrentaltx.com/?lang=es',
    },
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'Star Event Rental',
  image: 'https://stareventrentaltx.com/logo.png',
  '@id': 'https://stareventrentaltx.com',
  url: 'https://stareventrentaltx.com',
  telephone: '+1-281-636-0615',
  email: 'info@stareventrentaltx.com',
  description: 'Family-owned event rental company in Houston, TX. We offer tents, tables, chairs, linens, heaters, coolers, and dance floors for weddings, quinceañeras, baby showers, and corporate events.',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Houston',
    addressRegion: 'TX',
    postalCode: '77082',
    addressCountry: 'US',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 29.7233,
    longitude: -95.5977,
  },
  areaServed: [
    { '@type': 'City', name: 'Houston' },
    { '@type': 'City', name: 'Katy' },
    { '@type': 'City', name: 'Cypress' },
    { '@type': 'City', name: 'Richmond' },
    { '@type': 'City', name: 'Rosenberg' },
    { '@type': 'City', name: 'Sugar Land' },
  ],
  priceRange: '$$',
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    opens: '08:00',
    closes: '20:00',
  },
  sameAs: [
    'https://www.facebook.com/people/Star-Event-Rental-supplies/61561128338857/',
    'https://www.instagram.com/stareventrentaltx',
  ],
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.7',
    reviewCount: '50',
    bestRating: '5',
    worstRating: '1',
  },
  review: [
    {
      '@type': 'Review',
      author: { '@type': 'Person', name: 'Maria G.' },
      reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
      reviewBody: 'Excellent service! They delivered everything on time and the setup was perfect for our quinceañera. Highly recommend Star Event Rental!',
    },
    {
      '@type': 'Review',
      author: { '@type': 'Person', name: 'Carlos R.' },
      reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
      reviewBody: 'We rented tables, chairs, and a tent for our family reunion. Everything was clean and in great condition. The team was very professional.',
    },
    {
      '@type': 'Review',
      author: { '@type': 'Person', name: 'Jessica L.' },
      reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
      reviewBody: 'Amazing experience from start to finish. They helped us choose the right package for our wedding and the prices were very reasonable.',
    },
    {
      '@type': 'Review',
      author: { '@type': 'Person', name: 'Roberto M.' },
      reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
      reviewBody: 'Very reliable and punctual. They set up everything before the event and picked up the next day without any issues. Will use again!',
    },
    {
      '@type': 'Review',
      author: { '@type': 'Person', name: 'Ana S.' },
      reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
      reviewBody: 'Star Event Rental made our baby shower look beautiful. The linens and chairs were elegant and the staff was so friendly. Thank you!',
    },
  ],
};

export default function Page() {
  return (
    <ClientProviders>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomePage />
    </ClientProviders>
  );
}
