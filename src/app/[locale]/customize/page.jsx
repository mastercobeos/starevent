import { CustomizePage } from '../../../components/CustomizePage';
import { productCards } from '../../../data/homeData';

const baseUrl = 'https://stareventrentaltx.com';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const isEs = locale === 'es';
  const title = isEs
    ? 'Personalizar tu Renta - Star Event Rental Houston TX'
    : 'Customize Your Rental - Star Event Rental Houston TX';
  const description = isEs
    ? 'Arma tu propia renta personalizada en Houston, TX. Elige cantidades de carpas, mesas, sillas, manteles, pistas de baile y más. Llama 281-636-0615 para una cotización gratis.'
    : 'Build your own custom rental in Houston, TX. Choose quantities of tents, tables, chairs, linens, dance floors and more. Call 281-636-0615 for a free quote.';
  const url = isEs ? `${baseUrl}/es/customize` : `${baseUrl}/customize`;

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
        en: `${baseUrl}/customize`,
        es: `${baseUrl}/es/customize`,
      },
    },
  };
}

export default async function Page({ params }) {
  const { locale } = await params;
  const isEs = locale === 'es';

  const allItems = productCards.flatMap((cat) =>
    cat.items.map((item) => ({ ...item, categoryName: isEs ? cat.nameEs : cat.name }))
  );

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: isEs ? 'Renta Personalizada Star Event Rental' : 'Star Event Rental Custom Rental',
      description: isEs
        ? 'Catálogo completo de productos para armar tu renta personalizada en Houston, TX.'
        : 'Full product catalog to build your custom rental in Houston, TX.',
      numberOfItems: allItems.length,
      itemListElement: allItems.map((item, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        item: {
          '@type': 'Product',
          name: isEs ? item.nameEs || item.name : item.name,
          description: isEs ? item.descEs || item.desc : item.desc,
          image: `${baseUrl}${item.image}`,
          category: item.categoryName,
          offers: {
            '@type': 'Offer',
            price: item.price.toFixed(2),
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock',
            seller: {
              '@type': 'LocalBusiness',
              name: 'Star Event Rental',
            },
          },
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
          name: isEs ? 'Inicio' : 'Home',
          item: isEs ? `${baseUrl}/es` : baseUrl,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: isEs ? 'Personalizar' : 'Customize',
          item: isEs ? `${baseUrl}/es/customize` : `${baseUrl}/customize`,
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
      <CustomizePage />
    </>
  );
}
