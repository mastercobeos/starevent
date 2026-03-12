'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';

const t = {
  en: {
    code: '404',
    title: 'Page Not Found',
    description: 'The page you are looking for doesn\'t exist or has been moved.',
    home: 'Go to Homepage',
    contact: 'Contact Us',
    services: 'Our Services',
  },
  es: {
    code: '404',
    title: 'Página No Encontrada',
    description: 'La página que buscas no existe o ha sido movida.',
    home: 'Ir al Inicio',
    contact: 'Contáctanos',
    services: 'Nuestros Servicios',
  },
};

export default function NotFound() {
  const [locale, setLocale] = useState('en');

  useEffect(() => {
    const stored = localStorage.getItem('language');
    if (stored === 'es' || (!stored && navigator.language?.startsWith('es'))) {
      setLocale('es');
    }
  }, []);

  const text = t[locale];
  const prefix = locale === 'es' ? '/es' : '';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="w-full border-b border-border/40 bg-background/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link href={`${prefix}/`}>
            <Image
              src="/logo.png"
              alt="Star Event Rental"
              width={140}
              height={56}
              className="h-10 sm:h-12 w-auto"
              priority
            />
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 sm:px-6">
        <div className="text-center max-w-lg">
          <p className="text-primary text-8xl sm:text-9xl font-bold tracking-tight">
            {text.code}
          </p>
          <h1 className="text-foreground text-2xl sm:text-3xl font-bold mt-4">
            {text.title}
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg mt-3 leading-relaxed">
            {text.description}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
            <Link
              href={`${prefix}/`}
              className="inline-flex items-center justify-center rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-base font-bold transition-colors border-2 border-[#C9A84C] shadow-lg hover:shadow-xl w-full sm:w-auto"
            >
              {text.home}
            </Link>
            <Link
              href={`${prefix}/contact`}
              className="inline-flex items-center justify-center rounded-lg border border-border hover:bg-accent text-foreground px-8 py-3 text-base font-medium transition-colors w-full sm:w-auto"
            >
              {text.contact}
            </Link>
          </div>

          <div className="mt-10 border-t border-border/40 pt-6">
            <p className="text-muted-foreground text-sm mb-3">{text.services}</p>
            <div className="flex flex-wrap justify-center gap-2">
              {[
                { href: '/services/tent-rental-houston', label: 'Tents' },
                { href: '/services/table-rental-houston', label: 'Tables' },
                { href: '/services/chair-rental-houston', label: 'Chairs' },
                { href: '/services/dance-floor-rental-houston', label: 'Dance Floors' },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={`${prefix}${link.href}`}
                  className="text-primary hover:text-primary/80 text-sm underline underline-offset-2 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
