import { ProductDetailPage } from '../../../../../components/ProductDetailPage';
import { productCards } from '../../../../../data/homeData';
import { notFound } from 'next/navigation';

const baseUrl = 'https://stareventrentaltx.com';

export function generateStaticParams() {
  const locales = ['en', 'es'];
  const params = [];
  for (const locale of locales) {
    for (const cat of productCards) {
      for (const item of cat.items) {
        params.push({ locale, category: cat.slug, item: item.id });
      }
    }
  }
  return params;
}

export async function generateMetadata({ params }) {
  const { locale, category: slug, item: itemId } = await params;
  const category = productCards.find((c) => c.slug === slug);
  if (!category) return {};
  const item = category.items.find((i) => i.id === itemId);
  if (!item) return {};

  const isEs = locale === 'es';
  const itemName = isEs ? item.nameEs || item.name : item.name;
  const itemDesc = isEs ? item.descEs || item.desc : item.desc;
  const priceTag = `$${item.price.toFixed(0)}`;

  const title = isEs
    ? `${itemName} ${priceTag} - Renta en Houston TX | Star Event Rental`
    : `${itemName} ${priceTag} - Rent in Houston TX | Star Event Rental`;
  const description = isEs
    ? `${itemDesc} Renta en Houston, TX desde ${priceTag}. Llama 281-636-0615 para una cotización gratis.`
    : `${itemDesc} Rent in Houston, TX starting at ${priceTag}. Call 281-636-0615 for a free quote.`;
  const url = isEs
    ? `${baseUrl}/es/products/${slug}/${itemId}`
    : `${baseUrl}/products/${slug}/${itemId}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      images: [
        {
          url: `${baseUrl}${item.image}`,
          width: 1200,
          height: 630,
          alt: itemName,
        },
      ],
    },
    alternates: {
      canonical: url,
      languages: {
        en: `${baseUrl}/products/${slug}/${itemId}`,
        es: `${baseUrl}/es/products/${slug}/${itemId}`,
      },
    },
  };
}

export default async function Page({ params }) {
  const { locale, category: slug, item: itemId } = await params;
  const category = productCards.find((c) => c.slug === slug);
  if (!category) notFound();
  const item = category.items.find((i) => i.id === itemId);
  if (!item) notFound();

  const isEs = locale === 'es';
  const itemName = isEs ? item.nameEs || item.name : item.name;
  const itemDesc = isEs ? item.descEs || item.desc : item.desc;
  const categoryName = isEs ? category.nameEs : category.name;
  const url = isEs
    ? `${baseUrl}/es/products/${slug}/${itemId}`
    : `${baseUrl}/products/${slug}/${itemId}`;

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: itemName,
      description: itemDesc,
      image: `${baseUrl}${item.image}`,
      category: categoryName,
      brand: { '@type': 'Brand', name: 'Star Event Rental' },
      offers: {
        '@type': 'Offer',
        price: item.price.toFixed(2),
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
        url,
        seller: { '@type': 'LocalBusiness', name: 'Star Event Rental' },
      },
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
          name: categoryName,
          item: isEs ? `${baseUrl}/es/products/${slug}` : `${baseUrl}/products/${slug}`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: itemName,
          item: url,
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
      <ProductDetailPage category={category} item={item} />
    </>
  );
}
