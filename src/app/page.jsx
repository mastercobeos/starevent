import { ClientProviders } from '../components/ClientProviders';
import HomePage from '../components/HomePage';

export const metadata = {
  title: 'Star Event Rental - Tent Rental & Event Rentals Houston TX',
  description: 'Tent rental Houston TX. Chair, table & dance floor rentals for weddings, corporate events & parties. Serving Houston, Katy, Tomball, The Woodlands & Baytown. Free quotes!',
  keywords: [
    'tent rental Houston', 'chair rental Houston', 'event rentals Houston',
    'party rentals katy tx', 'wedding tent rental Houston', 'corporate event rentals Houston',
    'corporate event tent rental Houston', 'company event rentals Houston',
    'corporate party rentals Houston', 'event rentals for companies Houston',
    'dance floor rental Houston', 'dance floor white Houston', 'dance floor in the woodlands',
    'high peak tent Baytown', 'wedding rental Tomball', 'graduation party rental Houston',
    'table and chair rental Houston', 'wedding rental Houston', 'quinceañera rentals Houston',
    'renta de carpas Houston', 'renta de sillas Houston', 'renta de mesas y sillas Houston',
    'renta para eventos Houston', 'alquiler de carpas para bodas Houston',
    'pista de baile Houston', 'renta para fiestas Houston', 'eventos corporativos Houston',
  ],
  openGraph: {
    title: 'Star Event Rental - Tent Rental & Event Rentals Houston TX',
    description: 'Tent, chair, table & dance floor rentals in Houston TX. Weddings, corporate events, graduations & parties. Family-owned. Free quotes!',
    url: 'https://stareventrentaltx.com/',
    images: [{ url: '/logo.png', width: 1200, height: 630, alt: 'Star Event Rental - Tent Rental & Event Rentals in Houston TX' }],
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
    { '@type': 'City', name: 'The Woodlands' },
    { '@type': 'City', name: 'Baytown' },
    { '@type': 'City', name: 'Tomball' },
    { '@type': 'City', name: 'Spring' },
    { '@type': 'City', name: 'Humble' },
    { '@type': 'City', name: 'Pearland' },
  ],
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Event Rental Services',
    itemListElement: [
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Tent Rental' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Chair Rental' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Table Rental' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Dance Floor Rental' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Tablecloth & Linen Rental' } },
    ],
  },
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
