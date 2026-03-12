import { ClientProviders } from '../../components/ClientProviders';

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'es' }];
}

export default async function LocaleLayout({ children, params }) {
  const { locale } = await params;

  return (
    <ClientProviders initialLocale={locale}>
      {children}
    </ClientProviders>
  );
}
